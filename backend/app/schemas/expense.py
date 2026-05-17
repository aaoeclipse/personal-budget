import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, field_validator

from app.schemas.category import CategoryResponse


class ExpenseCreate(BaseModel):
    budget_id: Optional[uuid.UUID] = None
    category_id: uuid.UUID
    amount: Decimal
    currency: str = "USD"
    description: Optional[str] = None
    date: date

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        if v not in ("USD", "GTQ"):
            raise ValueError("Currency must be USD or GTQ")
        return v


class ExpenseUpdate(BaseModel):
    budget_id: Optional[uuid.UUID] = None
    category_id: Optional[uuid.UUID] = None
    amount: Optional[Decimal] = None
    currency: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str | None) -> str | None:
        if v is not None and v not in ("USD", "GTQ"):
            raise ValueError("Currency must be USD or GTQ")
        return v


class ExpenseResponse(BaseModel):
    id: uuid.UUID
    budget_id: Optional[uuid.UUID]
    category_id: uuid.UUID
    amount: Decimal
    currency: str = "USD"
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
