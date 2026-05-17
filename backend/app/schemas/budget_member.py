import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = "editor"


class BudgetMemberResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    user_name: str
    user_email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class BudgetInvitationResponse(BaseModel):
    id: uuid.UUID
    budget_id: uuid.UUID
    budget_name: str
    inviter_name: str
    role: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class InvitationActionRequest(BaseModel):
    action: str  # "accept" or "decline"
