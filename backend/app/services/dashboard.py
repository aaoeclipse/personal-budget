import uuid
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import case, extract, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.budget import Budget
from app.models.budget_member import BudgetMember
from app.models.category import Category
from app.models.expense import Expense
from app.schemas.budget import BudgetDetailResponse
from app.schemas.dashboard import DailySpending, DashboardResponse, MonthlySpending, MonthlySpendingResponse, SpendingByCategory

# Conversion rate: 1 USD = 7.7 GTQ
GTQ_TO_USD = Decimal("0.1298701298701299")  # 1/7.7
USD_TO_GTQ = Decimal("7.7")


def _amount_in_usd():
    """SQL CASE to convert expense amount to USD."""
    return case(
        (Expense.currency == "GTQ", Expense.amount * GTQ_TO_USD),
        else_=Expense.amount,
    )


def get_dashboard(db: Session, user_id: uuid.UUID) -> DashboardResponse:
    today = date.today()

    # Active budgets: owned OR member of
    active_budgets_rows = list(
        db.execute(
            select(Budget).where(
                or_(
                    Budget.user_id == user_id,
                    Budget.id.in_(select(BudgetMember.budget_id).where(BudgetMember.user_id == user_id)),
                ),
                Budget.start_date <= today,
                Budget.end_date >= today,
            )
        ).scalars().all()
    )
    active_budgets: list[BudgetDetailResponse] = []
    for b in active_budgets_rows:
        spent = Decimal(str(
            db.execute(
                select(func.coalesce(func.sum(_amount_in_usd()), 0)).where(Expense.budget_id == b.id)
            ).scalar_one()
        ))
        role = "owner" if b.user_id == user_id else "editor"
        member_count = 1
        if b.is_shared:
            member_count = db.execute(
                select(func.count(BudgetMember.id)).where(BudgetMember.budget_id == b.id)
            ).scalar_one() or 1
        budget_amount = Decimal(str(b.amount))
        active_budgets.append(BudgetDetailResponse(
            id=b.id, name=b.name, amount=b.amount,
            amount_gtq=budget_amount * USD_TO_GTQ,
            start_date=b.start_date, end_date=b.end_date,
            is_shared=b.is_shared, role=role, member_count=member_count,
            created_at=b.created_at, updated_at=b.updated_at,
            total_spent=spent, total_spent_gtq=spent * USD_TO_GTQ,
            remaining=budget_amount - spent,
        ))

    # Total spent (last 30 days) — converted to USD
    thirty_days_ago = today - timedelta(days=30)
    total_spent = Decimal(str(
        db.execute(
            select(func.coalesce(func.sum(_amount_in_usd()), 0))
            .where(Expense.user_id == user_id, Expense.date >= thirty_days_ago)
        ).scalar_one()
    ))

    # Spending by category (last 30 days) — converted to USD
    cat_rows = db.execute(
        select(Category.name, Category.color, func.sum(_amount_in_usd()).label("total"))
        .join(Expense, Expense.category_id == Category.id)
        .where(Expense.user_id == user_id, Expense.date >= thirty_days_ago)
        .group_by(Category.name, Category.color)
        .order_by(func.sum(_amount_in_usd()).desc())
    ).all()
    spending_by_category = [
        SpendingByCategory(category_name=r.name, category_color=r.color, total=Decimal(str(r.total)))
        for r in cat_rows
    ]

    # Recent expenses
    recent = list(
        db.execute(
            select(Expense)
            .where(Expense.user_id == user_id)
            .options(joinedload(Expense.category))
            .order_by(Expense.date.desc())
            .limit(10)
        ).scalars().unique().all()
    )

    # Daily spending (last 30 days) — converted to USD
    daily_rows = db.execute(
        select(Expense.date, func.sum(_amount_in_usd()).label("total"))
        .where(Expense.user_id == user_id, Expense.date >= thirty_days_ago)
        .group_by(Expense.date)
        .order_by(Expense.date)
    ).all()
    daily_spending = [DailySpending(date=r.date, total=Decimal(str(r.total))) for r in daily_rows]

    return DashboardResponse(
        active_budgets=active_budgets,
        total_spent=total_spent,
        spending_by_category=spending_by_category,
        recent_expenses=recent,
        daily_spending=daily_spending,
    )


def get_monthly_spending(db: Session, user_id: uuid.UUID, num_months: int = 6) -> MonthlySpendingResponse:
    today = date.today()
    # Go back num_months months from the first day of the current month
    start = date(today.year, today.month, 1)
    for _ in range(num_months - 1):
        start = (start - timedelta(days=1)).replace(day=1)

    rows = db.execute(
        select(
            extract("year", Expense.date).label("year"),
            extract("month", Expense.date).label("month"),
            func.sum(_amount_in_usd()).label("total"),
        )
        .where(Expense.user_id == user_id, Expense.date >= start)
        .group_by(extract("year", Expense.date), extract("month", Expense.date))
        .order_by(extract("year", Expense.date), extract("month", Expense.date))
    ).all()

    months: list[MonthlySpending] = []
    prev_total = None
    for r in rows:
        total = Decimal(str(r.total))
        month_str = f"{int(r.year)}-{int(r.month):02d}"
        change_pct = None
        if prev_total is not None and prev_total > 0:
            change_pct = round(float((total - prev_total) / prev_total * 100), 1)
        months.append(MonthlySpending(month=month_str, total=total, change_pct=change_pct))
        prev_total = total

    return MonthlySpendingResponse(months=months)
