import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetDetailResponse, BudgetResponse, BudgetStatsResponse, BudgetUpdate
from app.schemas.budget_member import BudgetMemberResponse, InviteMemberRequest
from app.services import budget as budget_service
from app.services import budget_member as member_service

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=list[BudgetResponse])
def list_budgets(active: Optional[bool] = Query(None), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return budget_service.list_budgets(db, user.id, active)


@router.post("", response_model=BudgetResponse, status_code=201)
def create_budget(data: BudgetCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    budget = budget_service.create_budget(db, user.id, data)
    return BudgetResponse(
        id=budget.id, name=budget.name, amount=budget.amount,
        start_date=budget.start_date, end_date=budget.end_date,
        is_shared=budget.is_shared, role="owner", member_count=1,
        created_at=budget.created_at, updated_at=budget.updated_at,
    )


@router.get("/{budget_id}", response_model=BudgetDetailResponse)
def get_budget(budget_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return budget_service.get_budget_detail(db, user.id, budget_id)


@router.get("/{budget_id}/stats", response_model=BudgetStatsResponse)
def get_budget_stats(budget_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return budget_service.get_budget_stats(db, user.id, budget_id)


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: uuid.UUID, data: BudgetUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    budget = budget_service.update_budget(db, user.id, budget_id, data)
    return BudgetResponse(
        id=budget.id, name=budget.name, amount=budget.amount,
        start_date=budget.start_date, end_date=budget.end_date,
        is_shared=budget.is_shared, role="owner", member_count=1,
        created_at=budget.created_at, updated_at=budget.updated_at,
    )


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    budget_service.delete_budget(db, user.id, budget_id)


# --- Member management ---


@router.post("/{budget_id}/members/invite", status_code=201)
def invite_member(
    budget_id: uuid.UUID,
    data: InviteMemberRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    member_service.invite_member(db, budget_id, user.id, data.email, data.role)
    return {"detail": "Invitation sent"}


@router.get("/{budget_id}/members", response_model=list[BudgetMemberResponse])
def list_members(budget_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check access
    role = member_service.get_user_role(db, budget_id, user.id)
    if not role:
        from app.exceptions import Forbidden
        raise Forbidden()
    return member_service.list_members(db, budget_id)


@router.delete("/{budget_id}/members/{member_user_id}", status_code=204)
def remove_member(
    budget_id: uuid.UUID,
    member_user_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    member_service.remove_member(db, budget_id, user.id, member_user_id)
