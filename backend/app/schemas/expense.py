import datetime as dt
import uuid
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
    date: dt.date

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
    date: Optional[dt.date] = None

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
    date: dt.date
    created_at: dt.datetime
    updated_at: dt.datetime
    category: Optional[CategoryResponse] = None
    creator_name: Optional[str] = None

    model_config = {"from_attributes": True}


class ExpenseListResponse(BaseModel):
    items: list[ExpenseResponse]
    total: int


class CsvImportError(BaseModel):
    row: int
    message: str


class CsvImportResponse(BaseModel):
    imported: int
    skipped: int
    errors: list[CsvImportError]
