from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.exceptions import Forbidden, NotFound
from app.models.budget import Budget
from app.models.category import Category
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


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
    q = select(Expense).where(Expense.user_id == user_id)
    count_q = select(func.count(Expense.id)).where(Expense.user_id == user_id)

    if category_id:
        q = q.where(Expense.category_id == category_id)
        count_q = count_q.where(Expense.category_id == category_id)
    if budget_id:
        q = q.where(Expense.budget_id == budget_id)
        count_q = count_q.where(Expense.budget_id == budget_id)
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
            q.options(joinedload(Expense.category), joinedload(Expense.budget))
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
        budget = db.get(Budget, data.budget_id)
        if not budget or budget.user_id != user_id:
            raise NotFound("Budget not found")
    expense = Expense(
        user_id=user_id, budget_id=data.budget_id, category_id=data.category_id,
        amount=data.amount, description=data.description or "", date=data.date,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    db.refresh(expense, ["category"])
    return expense


def get_expense(db: Session, user_id: uuid.UUID, expense_id: uuid.UUID) -> Expense:
    expense = db.execute(
        select(Expense).where(Expense.id == expense_id).options(joinedload(Expense.category))
    ).scalar_one_or_none()
    if not expense:
        raise NotFound("Expense not found")
    if expense.user_id != user_id:
        raise Forbidden()
    return expense


def update_expense(db: Session, user_id: uuid.UUID, expense_id: uuid.UUID, data: ExpenseUpdate) -> Expense:
    expense = db.get(Expense, expense_id)
    if not expense:
        raise NotFound("Expense not found")
    if expense.user_id != user_id:
        raise Forbidden()
    update_data = data.model_dump(exclude_unset=True)
    if "category_id" in update_data:
        cat = db.get(Category, update_data["category_id"])
        if not cat or cat.user_id != user_id:
            raise NotFound("Category not found")
    if "budget_id" in update_data and update_data["budget_id"]:
        budget = db.get(Budget, update_data["budget_id"])
        if not budget or budget.user_id != user_id:
            raise NotFound("Budget not found")
    for field, value in update_data.items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    db.refresh(expense, ["category"])
    return expense


def delete_expense(db: Session, user_id: uuid.UUID, expense_id: uuid.UUID) -> None:
    expense = db.get(Expense, expense_id)
    if not expense:
        raise NotFound("Expense not found")
    if expense.user_id != user_id:
        raise Forbidden()
    db.delete(expense)
    db.commit()
