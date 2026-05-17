import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


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
