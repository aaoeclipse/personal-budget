from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.exceptions import Forbidden, NotFound
from app.models.budget import Budget
from app.models.budget_member import BudgetMember
from app.models.category import Category
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def _check_budget_access(db: Session, budget_id: uuid.UUID, user_id: uuid.UUID) -> str | None:
    """Check if user has access to a budget. Returns role or None."""
    budget = db.get(Budget, budget_id)
    if not budget:
        return None
    if budget.user_id == user_id:
        return "owner"
    member = db.execute(
        select(BudgetMember).where(BudgetMember.budget_id == budget_id, BudgetMember.user_id == user_id)
    ).scalar_one_or_none()
    return member.role if member else None


def list_expenses(
    db: Session,
    user_id: uuid.UUID,
    category_id: uuid.UUID | None = None,
    budget_id: uuid.UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    limit: int = 50,
    offset: int = 0,
    search: str | None = None,
    min_amount: float | None = None,
    max_amount: float | None = None,
) -> tuple[list[Expense], int]:
    # If filtering by a shared budget, show ALL expenses in that budget
    if budget_id:
        role = _check_budget_access(db, budget_id, user_id)
        if role:
            # User has access to this budget — show all expenses in it
            q = select(Expense).where(Expense.budget_id == budget_id)
            count_q = select(func.count(Expense.id)).where(Expense.budget_id == budget_id)
        else:
            # No access — show nothing from this budget
            q = select(Expense).where(Expense.user_id == user_id, Expense.budget_id == budget_id)
            count_q = select(func.count(Expense.id)).where(Expense.user_id == user_id, Expense.budget_id == budget_id)
    else:
        q = select(Expense).where(Expense.user_id == user_id)
        count_q = select(func.count(Expense.id)).where(Expense.user_id == user_id)

    if category_id:
        q = q.where(Expense.category_id == category_id)
        count_q = count_q.where(Expense.category_id == category_id)
    if start_date:
        q = q.where(Expense.date >= start_date)
        count_q = count_q.where(Expense.date >= start_date)
    if end_date:
        q = q.where(Expense.date <= end_date)
        count_q = count_q.where(Expense.date <= end_date)
    if search:
        pattern = f"%{search}%"
        q = q.where(Expense.description.ilike(pattern))
        count_q = count_q.where(Expense.description.ilike(pattern))
    if min_amount is not None:
        q = q.where(Expense.amount >= min_amount)
        count_q = count_q.where(Expense.amount >= min_amount)
    if max_amount is not None:
        q = q.where(Expense.amount <= max_amount)
        count_q = count_q.where(Expense.amount <= max_amount)

    total = db.execute(count_q).scalar_one()
    items = list(
        db.execute(
            q.options(joinedload(Expense.category), joinedload(Expense.budget), joinedload(Expense.user))
            .order_by(Expense.date.desc()).limit(limit).offset(offset)
        )
        .scalars()
        .unique()
        .all()
    )
    return items, total


def create_expense(db: Session, user_id: uuid.UUID, data: ExpenseCreate) -> Expense:
    cat = db.get(Category, data.category_id)
    if not cat or cat.user_id != user_id:
        raise NotFound("Category not found")
    if data.budget_id:
        role = _check_budget_access(db, data.budget_id, user_id)
        if not role:
            raise NotFound("Budget not found")
    expense = Expense(
        user_id=user_id, budget_id=data.budget_id, category_id=data.category_id,
        amount=data.amount, currency=data.currency, description=data.description or "", date=data.date,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    db.refresh(expense, ["category", "user"])
    return expense


def get_expense(db: Session, user_id: uuid.UUID, expense_id: uuid.UUID) -> Expense:
    expense = db.execute(
        select(Expense).where(Expense.id == expense_id).options(joinedload(Expense.category), joinedload(Expense.user))
    ).scalar_one_or_none()
    if not expense:
        raise NotFound("Expense not found")
    # Allow access if user owns the expense OR is a member of the budget
    if expense.user_id != user_id:
        if expense.budget_id:
            role = _check_budget_access(db, expense.budget_id, user_id)
            if not role:
                raise Forbidden()
        else:
            raise Forbidden()
    return expense


def update_expense(db: Session, user_id: uuid.UUID, expense_id: uuid.UUID, data: ExpenseUpdate) -> Expense:
    expense = db.get(Expense, expense_id)
    if not expense:
        raise NotFound("Expense not found")

    # Check access
    if expense.user_id != user_id:
        if expense.budget_id:
            role = _check_budget_access(db, expense.budget_id, user_id)
            if not role:
                raise Forbidden()
            # Editors can only modify their own expenses
            if role == "editor":
                raise Forbidden("Editors can only modify their own expenses")
        else:
            raise Forbidden()

    update_data = data.model_dump(exclude_unset=True)
    if "category_id" in update_data:
        cat = db.get(Category, update_data["category_id"])
        if not cat or cat.user_id != user_id:
            raise NotFound("Category not found")
    if "budget_id" in update_data and update_data["budget_id"]:
        role = _check_budget_access(db, update_data["budget_id"], user_id)
        if not role:
            raise NotFound("Budget not found")
    # Ensure description is never set to None on the NOT NULL column
    if "description" in update_data and update_data["description"] is None:
        update_data["description"] = ""
    for field, value in update_data.items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    db.refresh(expense, ["category", "user"])
    return expense


def delete_expense(db: Session, user_id: uuid.UUID, expense_id: uuid.UUID) -> None:
    expense = db.get(Expense, expense_id)
    if not expense:
        raise NotFound("Expense not found")

    # Check access
    if expense.user_id != user_id:
        if expense.budget_id:
            role = _check_budget_access(db, expense.budget_id, user_id)
            if not role:
                raise Forbidden()
            if role == "editor":
                raise Forbidden("Editors can only delete their own expenses")
        else:
            raise Forbidden()

    db.delete(expense)
    db.commit()
