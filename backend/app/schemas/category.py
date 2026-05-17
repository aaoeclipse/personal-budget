import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str
    color: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")
    emoji: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")
    emoji: Optional[str] = None


class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    color: str
    emoji: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
