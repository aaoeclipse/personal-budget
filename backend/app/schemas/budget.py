import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class BudgetCreate(BaseModel):
    name: str
    amount: Decimal
    start_date: date
    end_date: date


class BudgetUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class BudgetResponse(BaseModel):
    id: uuid.UUID
    name: str
    amount: Decimal
    start_date: date
    end_date: date
    is_shared: bool = False
    role: Optional[str] = None
    member_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BudgetDetailResponse(BudgetResponse):
    total_spent: Decimal
    total_spent_gtq: Decimal = Decimal("0")
    remaining: Decimal
    amount_gtq: Decimal = Decimal("0")


class BudgetCategorySpending(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category_name: str
    category_color: str
    category_emoji: Optional[str] = None
    total: Decimal
    percentage: Decimal


class BudgetDailySpending(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: date
    total: Decimal


class BudgetStatsResponse(BaseModel):
    days_total: int
    days_elapsed: int
    days_remaining: int
    daily_allowance: Decimal
    avg_daily_spending: Decimal
    projected_total: Decimal
    on_track: bool
    spending_by_category: list[BudgetCategorySpending]
    daily_spending: list[BudgetDailySpending]
