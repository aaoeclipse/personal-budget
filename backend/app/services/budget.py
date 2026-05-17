from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.exceptions import Forbidden, NotFound
from app.models.budget import Budget
from app.models.expense import Expense
from app.schemas.budget import BudgetCreate, BudgetDetailResponse, BudgetUpdate


def list_budgets(db: Session, user_id: uuid.UUID, active: bool | None = None) -> list[Budget]:
    q = select(Budget).where(Budget.user_id == user_id)
    if active:
        today = date.today()
        q = q.where(Budget.start_date <= today, Budget.end_date >= today)
    return list(db.execute(q.order_by(Budget.start_date.desc())).scalars().all())


def create_budget(db: Session, user_id: uuid.UUID, data: BudgetCreate) -> Budget:
    budget = Budget(user_id=user_id, name=data.name, amount=data.amount, start_date=data.start_date, end_date=data.end_date)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def get_budget_detail(db: Session, user_id: uuid.UUID, budget_id: uuid.UUID) -> BudgetDetailResponse:
    budget = db.get(Budget, budget_id)
    if not budget:
        raise NotFound("Budget not found")
    if budget.user_id != user_id:
        raise Forbidden()
    total_spent = db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(Expense.budget_id == budget_id)
    ).scalar_one()
    total_spent = Decimal(str(total_spent))
    return BudgetDetailResponse(
        id=budget.id, name=budget.name, amount=budget.amount,
        start_date=budget.start_date, end_date=budget.end_date,
        created_at=budget.created_at, updated_at=budget.updated_at,
        total_spent=total_spent, remaining=Decimal(str(budget.amount)) - total_spent,
    )


def update_budget(db: Session, user_id: uuid.UUID, budget_id: uuid.UUID, data: BudgetUpdate) -> Budget:
    budget = db.get(Budget, budget_id)
    if not budget:
        raise NotFound("Budget not found")
    if budget.user_id != user_id:
        raise Forbidden()
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(budget, field, value)
    db.commit()
    db.refresh(budget)
    return budget


def delete_budget(db: Session, user_id: uuid.UUID, budget_id: uuid.UUID) -> None:
    budget = db.get(Budget, budget_id)
    if not budget:
        raise NotFound("Budget not found")
    if budget.user_id != user_id:
        raise Forbidden()
    db.delete(budget)
    db.commit()
