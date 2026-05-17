import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.schemas.category import CategoryResponse


class ExpenseCreate(BaseModel):
    budget_id: Optional[uuid.UUID] = None
    category_id: uuid.UUID
    amount: Decimal
    description: Optional[str] = None
    date: date


class ExpenseUpdate(BaseModel):
    budget_id: Optional[uuid.UUID] = None
    category_id: Optional[uuid.UUID] = None
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    date: Optional[date] = None


class ExpenseResponse(BaseModel):
    id: uuid.UUID
    budget_id: Optional[uuid.UUID]
    category_id: uuid.UUID
    amount: Decimal
    description: str
    date: date
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    creator_name: Optional[str] = None

    model_config = {"from_attributes": True}


class ExpenseListResponse(BaseModel):
    items: list[ExpenseResponse]
    total: int
