import csv
import io
import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseListResponse, ExpenseResponse, ExpenseUpdate
from app.services import expense as expense_service

router = APIRouter(prefix="/expenses", tags=["expenses"])


def _expense_to_response(exp) -> ExpenseResponse:
    """Convert an Expense ORM object to ExpenseResponse with creator_name."""
    creator_name = None
    if hasattr(exp, "user") and exp.user:
        creator_name = exp.user.name
    return ExpenseResponse(
        id=exp.id,
        budget_id=exp.budget_id,
        category_id=exp.category_id,
        amount=exp.amount,
        description=exp.description,
        date=exp.date,
        created_at=exp.created_at,
        updated_at=exp.updated_at,
        category=exp.category,
        creator_name=creator_name,
    )


@router.get("", response_model=ExpenseListResponse)
def list_expenses(
    category_id: Optional[uuid.UUID] = Query(None),
    budget_id: Optional[uuid.UUID] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None, ge=0),
    max_amount: Optional[float] = Query(None, ge=0),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total = expense_service.list_expenses(
        db, user.id, category_id, budget_id, start_date, end_date, limit, offset,
        search=search, min_amount=min_amount, max_amount=max_amount,
    )
    return ExpenseListResponse(
        items=[_expense_to_response(exp) for exp in items],
        total=total,
    )


@router.get("/export/csv")
def export_expenses_csv(
    category_id: Optional[uuid.UUID] = Query(None),
    budget_id: Optional[uuid.UUID] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None, ge=0),
    max_amount: Optional[float] = Query(None, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, _ = expense_service.list_expenses(
        db, user.id, category_id, budget_id, start_date, end_date,
        limit=10000, offset=0, search=search, min_amount=min_amount, max_amount=max_amount,
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Description", "Category", "Amount", "Budget", "Added By"])

    for exp in items:
        writer.writerow([
            str(exp.date),
            exp.description,
            exp.category.name if exp.category else "",
            f"{exp.amount:.2f}",
            exp.budget.name if exp.budget else "",
            exp.user.name if exp.user else "",
        ])

    output.seek(0)
    filename = f"expenses_{date.today().isoformat()}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("", response_model=ExpenseResponse, status_code=201)
def create_expense(data: ExpenseCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = expense_service.create_expense(db, user.id, data)
    return _expense_to_response(exp)


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = expense_service.get_expense(db, user.id, expense_id)
    return _expense_to_response(exp)


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: uuid.UUID, data: ExpenseUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = expense_service.update_expense(db, user.id, expense_id, data)
    return _expense_to_response(exp)


@router.delete("/{expense_id}", status_code=204)
def delete_expense(expense_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    expense_service.delete_expense(db, user.id, expense_id)
