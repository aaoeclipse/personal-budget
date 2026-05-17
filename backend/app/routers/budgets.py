import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetDetailResponse, BudgetResponse, BudgetUpdate
from app.services import budget as budget_service

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=list[BudgetResponse])
def list_budgets(active: Optional[bool] = Query(None), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return budget_service.list_budgets(db, user.id, active)


@router.post("", response_model=BudgetResponse, status_code=201)
def create_budget(data: BudgetCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return budget_service.create_budget(db, user.id, data)


@router.get("/{budget_id}", response_model=BudgetDetailResponse)
def get_budget(budget_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return budget_service.get_budget_detail(db, user.id, budget_id)


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: uuid.UUID, data: BudgetUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return budget_service.update_budget(db, user.id, budget_id, data)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    budget_service.delete_budget(db, user.id, budget_id)
