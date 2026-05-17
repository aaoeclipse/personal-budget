from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import case, func, or_, select
from sqlalchemy.orm import Session

from app.exceptions import Forbidden, NotFound
from app.models.budget import Budget
from app.models.budget_member import BudgetMember
from app.models.expense import Expense
from app.schemas.budget import BudgetCreate, BudgetDetailResponse, BudgetResponse, BudgetUpdate

# Conversion rate: 1 USD = 7.7 GTQ
GTQ_TO_USD = Decimal("0.1298701298701299")  # 1/7.7


def _spent_in_usd_expr():
    """SQL expression to sum expenses converted to USD."""
    return func.coalesce(
        func.sum(
            case(
                (Expense.currency == "GTQ", Expense.amount * GTQ_TO_USD),
                else_=Expense.amount,
            )
        ),
        0,
    )


def list_budgets(db: Session, user_id: uuid.UUID, active: bool | None = None) -> list[BudgetResponse]:
    # Get budgets where user is owner OR a member
    q = select(Budget).where(
        or_(
            Budget.user_id == user_id,
            Budget.id.in_(
                select(BudgetMember.budget_id).where(BudgetMember.user_id == user_id)
            ),
        )
    )
    if active:
        today = date.today()
        q = q.where(Budget.start_date <= today, Budget.end_date >= today)

    budgets = list(db.execute(q.order_by(Budget.start_date.desc())).scalars().all())

    results = []
    for b in budgets:
        role = "owner" if b.user_id == user_id else _get_member_role(db, b.id, user_id)
        member_count = _get_member_count(db, b)
        results.append(BudgetResponse(
            id=b.id, name=b.name, amount=b.amount,
            start_date=b.start_date, end_date=b.end_date,
            is_shared=b.is_shared, role=role, member_count=member_count,
            created_at=b.created_at, updated_at=b.updated_at,
        ))
    return results


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

    # Check access: owner or member
    role = None
    if budget.user_id == user_id:
        role = "owner"
    else:
        role = _get_member_role(db, budget_id, user_id)
        if not role:
            raise Forbidden()

    total_spent = db.execute(
        select(_spent_in_usd_expr()).where(Expense.budget_id == budget_id)
    ).scalar_one()
    total_spent = Decimal(str(total_spent)).quantize(Decimal("0.01"))
    member_count = _get_member_count(db, budget)
    budget_amount = Decimal(str(budget.amount))
    usd_to_gtq = Decimal("7.7")

    return BudgetDetailResponse(
        id=budget.id, name=budget.name, amount=budget.amount,
        amount_gtq=(budget_amount * usd_to_gtq).quantize(Decimal("0.01")),
        start_date=budget.start_date, end_date=budget.end_date,
        is_shared=budget.is_shared, role=role, member_count=member_count,
        created_at=budget.created_at, updated_at=budget.updated_at,
        total_spent=total_spent,
        total_spent_gtq=(total_spent * usd_to_gtq).quantize(Decimal("0.01")),
        remaining=(budget_amount - total_spent).quantize(Decimal("0.01")),
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


def _get_member_role(db: Session, budget_id: uuid.UUID, user_id: uuid.UUID) -> str | None:
    member = db.execute(
        select(BudgetMember).where(BudgetMember.budget_id == budget_id, BudgetMember.user_id == user_id)
    ).scalar_one_or_none()
    return member.role if member else None


def _get_member_count(db: Session, budget: Budget) -> int:
    if not budget.is_shared:
        return 1
    count = db.execute(
        select(func.count(BudgetMember.id)).where(BudgetMember.budget_id == budget.id)
    ).scalar_one()
    return count or 1
