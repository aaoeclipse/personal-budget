from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.schemas.budget import BudgetDetailResponse
from app.schemas.expense import ExpenseResponse


class SpendingByCategory(BaseModel):
    category_name: str
    category_color: str
    total: Decimal


class DailySpending(BaseModel):
    date: date
    total: Decimal


class MonthlySpending(BaseModel):
    month: str  # "YYYY-MM" format
    total: Decimal
    change_pct: Optional[float] = None  # % change from previous month


class MonthlySpendingResponse(BaseModel):
    months: list[MonthlySpending]


class DashboardResponse(BaseModel):
    active_budgets: list[BudgetDetailResponse]
    total_spent: Decimal
    spending_by_category: list[SpendingByCategory]
    recent_expenses: list[ExpenseResponse]
    daily_spending: list[DailySpending]
