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
from app.models.category import Category
from app.schemas.budget import (
    BudgetCategorySpending,
    BudgetCreate,
    BudgetDailySpending,
    BudgetDetailResponse,
    BudgetResponse,
    BudgetStatsResponse,
    BudgetUpdate,
)

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


def get_budget_stats(db: Session, user_id: uuid.UUID, budget_id: uuid.UUID) -> BudgetStatsResponse:
    budget = db.get(Budget, budget_id)
    if not budget:
        raise NotFound("Budget not found")

    # Check access: owner or member
    if budget.user_id != user_id:
        role = _get_member_role(db, budget_id, user_id)
        if not role:
            raise Forbidden()

    # Amount expression for a single expense converted to USD (no sum/coalesce)
    amount_in_usd = case(
        (Expense.currency == "GTQ", Expense.amount * GTQ_TO_USD),
        else_=Expense.amount,
    )

    # Total spent
    total_spent = db.execute(
        select(_spent_in_usd_expr()).where(Expense.budget_id == budget_id)
    ).scalar_one()
    total_spent = Decimal(str(total_spent)).quantize(Decimal("0.01"))

    budget_amount = Decimal(str(budget.amount))
    remaining = budget_amount - total_spent

    # Time stats
    today = date.today()
    start = budget.start_date
    end = budget.end_date
    days_total = (end - start).days + 1
    # Clamp elapsed to budget range
    if today < start:
        days_elapsed = 0
    elif today > end:
        days_elapsed = days_total
    else:
        days_elapsed = (today - start).days + 1
    days_remaining = max(0, days_total - days_elapsed)

    # Pace stats
    if days_remaining > 0:
        daily_allowance = (remaining / days_remaining).quantize(Decimal("0.01"))
    else:
        daily_allowance = Decimal("0")

    if days_elapsed > 0:
        avg_daily = (total_spent / days_elapsed).quantize(Decimal("0.01"))
        projected = (avg_daily * days_total).quantize(Decimal("0.01"))
    else:
        avg_daily = Decimal("0")
        projected = Decimal("0")

    on_track = projected <= budget_amount

    # Category breakdown
    cat_rows = db.execute(
        select(
            Category.name,
            Category.color,
            Category.emoji,
            func.sum(amount_in_usd).label("total"),
        )
        .join(Category, Expense.category_id == Category.id)
        .where(Expense.budget_id == budget_id)
        .group_by(Category.id, Category.name, Category.color, Category.emoji)
        .order_by(func.sum(amount_in_usd).desc())
    ).all()

    spending_by_category = []
    for row in cat_rows:
        cat_total = Decimal(str(row.total)).quantize(Decimal("0.01"))
        pct = (cat_total / total_spent * 100).quantize(Decimal("0.01")) if total_spent > 0 else Decimal("0")
        spending_by_category.append(
            BudgetCategorySpending(
                category_name=row.name,
                category_color=row.color,
                category_emoji=row.emoji,
                total=cat_total,
                percentage=pct,
            )
        )

    # Daily spending
    daily_rows = db.execute(
        select(
            Expense.date.label("date"),
            func.sum(amount_in_usd).label("total"),
        )
        .where(Expense.budget_id == budget_id)
        .group_by(Expense.date)
        .order_by(Expense.date)
    ).all()

    daily_spending = [
        BudgetDailySpending(
            date=row.date,
            total=Decimal(str(row.total)).quantize(Decimal("0.01")),
        )
        for row in daily_rows
    ]

    return BudgetStatsResponse(
        days_total=days_total,
        days_elapsed=days_elapsed,
        days_remaining=days_remaining,
        daily_allowance=daily_allowance,
        avg_daily_spending=avg_daily,
        projected_total=projected,
        on_track=on_track,
        spending_by_category=spending_by_category,
        daily_spending=daily_spending,
    )


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
