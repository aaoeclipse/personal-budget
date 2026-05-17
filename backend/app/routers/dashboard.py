from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardResponse, MonthlySpendingResponse
from app.services import dashboard as dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return dashboard_service.get_dashboard(db, user.id)


@router.get("/monthly-spending", response_model=MonthlySpendingResponse)
def get_monthly_spending(
    months: int = Query(6, ge=2, le=12),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return dashboard_service.get_monthly_spending(db, user.id, months)
