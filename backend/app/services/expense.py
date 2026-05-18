from __future__ import annotations

import csv
import io
import uuid
from datetime import date
from decimal import Decimal, InvalidOperation

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.exceptions import Forbidden, NotFound
from app.models.budget import Budget
from app.models.budget_member import BudgetMember
from app.models.category import Category
from app.models.expense import Expense
from app.schemas.expense import CsvImportError, CsvImportResponse, ExpenseCreate, ExpenseUpdate


def _check_budget_access(db: Session, budget_id: uuid.UUID, user_id: uuid.UUID) -> str | None:
    """Check if user has access to a budget. Returns role or None."""
    budget = db.get(Budget, budget_id)
    if not budget:
        return None
    if budget.user_id == user_id:
        return "owner"
    member = db.execute(
        select(BudgetMember).where(BudgetMember.budget_id == budget_id, BudgetMember.user_id == user_id)
    ).scalar_one_or_none()
    return member.role if member else None


def list_expenses(
    db: Session,
    user_id: uuid.UUID,
    category_id: uuid.UUID | None = None,
    budget_id: uuid.UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    limit: int = 50,
    offset: int = 0,
    search: str | None = None,
    min_amount: float | None = None,
    max_amount: float | None = None,
) -> tuple[list[Expense], int]:
    # If filtering by a shared budget, show ALL expenses in that budget
    if budget_id:
        role = _check_budget_access(db, budget_id, user_id)
        if role:
            # User has access to this budget — show all expenses in it
            q = select(Expense).where(Expense.budget_id == budget_id)
            count_q = select(func.count(Expense.id)).where(Expense.budget_id == budget_id)
        else:
            # No access — show nothing from this budget
            q = select(Expense).where(Expense.user_id == user_id, Expense.budget_id == budget_id)
            count_q = select(func.count(Expense.id)).where(Expense.user_id == user_id, Expense.budget_id == budget_id)
    else:
        q = select(Expense).where(Expense.user_id == user_id)
        count_q = select(func.count(Expense.id)).where(Expense.user_id == user_id)

    if category_id:
        q = q.where(Expense.category_id == category_id)
        count_q = count_q.where(Expense.category_id == category_id)
    if start_date:
        q = q.where(Expense.date >= start_date)
        count_q = count_q.where(Expense.date >= start_date)
    if end_date:
        q = q.where(Expense.date <= end_date)
        count_q = count_q.where(Expense.date <= end_date)
    if search:
        pattern = f"%{search}%"
        q = q.where(Expense.description.ilike(pattern))
        count_q = count_q.where(Expense.description.ilike(pattern))
    if min_amount is not None:
        q = q.where(Expense.amount >= min_amount)
        count_q = count_q.where(Expense.amount >= min_amount)
    if max_amount is not None:
        q = q.where(Expense.amount <= max_amount)
        count_q = count_q.where(Expense.amount <= max_amount)

    total = db.execute(count_q).scalar_one()
    items = list(
        db.execute(
            q.options(joinedload(Expense.category), joinedload(Expense.budget), joinedload(Expense.user))
            .order_by(Expense.date.desc()).limit(limit).offset(offset)
        )
        .scalars()
        .unique()
        .all()
    )
    return items, total


def create_expense(db: Session, user_id: uuid.UUID, data: ExpenseCreate) -> Expense:
    cat = db.get(Category, data.category_id)
    if not cat or cat.user_id != user_id:
        raise NotFound("Category not found")
    if data.budget_id:
        role = _check_budget_access(db, data.budget_id, user_id)
        if not role:
            raise NotFound("Budget not found")
    expense = Expense(
        user_id=user_id, budget_id=data.budget_id, category_id=data.category_id,
        amount=data.amount, currency=data.currency, description=data.description or "", date=data.date,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    db.refresh(expense, ["category", "user"])
    return expense


def get_expense(db: Session, user_id: uuid.UUID, expense_id: uuid.UUID) -> Expense:
    expense = db.execute(
        select(Expense).where(Expense.id == expense_id).options(joinedload(Expense.category), joinedload(Expense.user))
    ).scalar_one_or_none()
    if not expense:
        raise NotFound("Expense not found")
    # Allow access if user owns the expense OR is a member of the budget
    if expense.user_id != user_id:
        if expense.budget_id:
            role = _check_budget_access(db, expense.budget_id, user_id)
            if not role:
                raise Forbidden()
        else:
            raise Forbidden()
    return expense


def update_expense(db: Session, user_id: uuid.UUID, expense_id: uuid.UUID, data: ExpenseUpdate) -> Expense:
    expense = db.get(Expense, expense_id)
    if not expense:
        raise NotFound("Expense not found")

    # Check access
    if expense.user_id != user_id:
        if expense.budget_id:
            role = _check_budget_access(db, expense.budget_id, user_id)
            if not role:
                raise Forbidden()
            # Editors can only modify their own expenses
            if role == "editor":
                raise Forbidden("Editors can only modify their own expenses")
        else:
            raise Forbidden()

    update_data = data.model_dump(exclude_unset=True)
    if "category_id" in update_data:
        cat = db.get(Category, update_data["category_id"])
        if not cat or cat.user_id != user_id:
            raise NotFound("Category not found")
    if "budget_id" in update_data and update_data["budget_id"]:
        role = _check_budget_access(db, update_data["budget_id"], user_id)
        if not role:
            raise NotFound("Budget not found")
    # Ensure description is never set to None on the NOT NULL column
    if "description" in update_data and update_data["description"] is None:
        update_data["description"] = ""
    for field, value in update_data.items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    db.refresh(expense, ["category", "user"])
    return expense


def delete_expense(db: Session, user_id: uuid.UUID, expense_id: uuid.UUID) -> None:
    expense = db.get(Expense, expense_id)
    if not expense:
        raise NotFound("Expense not found")

    # Check access
    if expense.user_id != user_id:
        if expense.budget_id:
            role = _check_budget_access(db, expense.budget_id, user_id)
            if not role:
                raise Forbidden()
            if role == "editor":
                raise Forbidden("Editors can only delete their own expenses")
        else:
            raise Forbidden()

    db.delete(expense)
    db.commit()


def import_expenses_csv(db: Session, user_id: uuid.UUID, file_content: bytes) -> CsvImportResponse:
    """Import expenses from a CSV file.

    Expected columns (case-insensitive, order-independent):
      Date, Amount, Currency (optional), Category, Description (optional), Budget (optional)

    Also accepts the export format:
      Date, Description, Category, Amount, Currency, Budget, Added By
    """
    try:
        text = file_content.decode("utf-8-sig")  # Handle BOM from Excel
    except UnicodeDecodeError:
        text = file_content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        return CsvImportResponse(imported=0, skipped=0, errors=[CsvImportError(row=0, message="Empty or invalid CSV file")])

    # Normalize header names to lowercase
    header_map = {f.strip().lower(): f for f in reader.fieldnames}

    # Require at minimum: date, amount, category
    required = {"date", "amount", "category"}
    if not required.issubset(header_map):
        missing = required - set(header_map)
        return CsvImportResponse(
            imported=0, skipped=0,
            errors=[CsvImportError(row=0, message=f"Missing required columns: {', '.join(missing)}")],
        )

    # Pre-load user's categories for name matching
    cats = db.execute(select(Category).where(Category.user_id == user_id)).scalars().all()
    cat_by_name: dict[str, Category] = {c.name.strip().lower(): c for c in cats}

    # Pre-load user's budgets for name matching
    own_budgets = db.execute(select(Budget).where(Budget.user_id == user_id)).scalars().all()
    member_rows = db.execute(
        select(BudgetMember.budget_id).where(BudgetMember.user_id == user_id)
    ).scalars().all()
    shared_budgets = db.execute(
        select(Budget).where(Budget.id.in_(member_rows))
    ).scalars().all() if member_rows else []
    all_budgets = own_budgets + shared_budgets
    budget_by_name: dict[str, Budget] = {b.name.strip().lower(): b for b in all_budgets}

    imported = 0
    skipped = 0
    errors: list[CsvImportError] = []

    for row_num, row in enumerate(reader, start=2):  # Row 1 is header
        # Normalize keys
        norm = {k.strip().lower(): (v.strip() if v else "") for k, v in row.items()}

        # Parse date
        raw_date = norm.get("date", "")
        if not raw_date:
            errors.append(CsvImportError(row=row_num, message="Missing date"))
            continue
        try:
            expense_date = date.fromisoformat(raw_date)
        except ValueError:
            # Try common formats
            for fmt in ("%m/%d/%Y", "%d/%m/%Y", "%m-%d-%Y", "%Y/%m/%d"):
                try:
                    from datetime import datetime as _dt
                    expense_date = _dt.strptime(raw_date, fmt).date()
                    break
                except ValueError:
                    continue
            else:
                errors.append(CsvImportError(row=row_num, message=f"Invalid date: {raw_date}"))
                continue

        # Parse amount
        raw_amount = norm.get("amount", "").replace(",", "").replace("$", "").replace("Q", "").replace("q", "")
        if not raw_amount:
            errors.append(CsvImportError(row=row_num, message="Missing amount"))
            continue
        try:
            amount = Decimal(raw_amount).quantize(Decimal("0.01"))
            if amount <= 0:
                errors.append(CsvImportError(row=row_num, message="Amount must be positive"))
                continue
        except (InvalidOperation, ArithmeticError):
            errors.append(CsvImportError(row=row_num, message=f"Invalid amount: {norm.get('amount', '')}"))
            continue

        # Parse currency
        raw_currency = norm.get("currency", "").upper()
        if raw_currency in ("USD", "GTQ"):
            currency = raw_currency
        elif raw_currency == "" or raw_currency not in ("USD", "GTQ"):
            currency = "USD"  # Default

        # Match category
        raw_cat = norm.get("category", "")
        if not raw_cat:
            errors.append(CsvImportError(row=row_num, message="Missing category"))
            continue
        cat = cat_by_name.get(raw_cat.lower())
        if not cat:
            errors.append(CsvImportError(row=row_num, message=f"Unknown category: {raw_cat}"))
            continue

        # Optional: description
        description = norm.get("description", "")

        # Optional: budget
        budget_id = None
        raw_budget = norm.get("budget", "")
        if raw_budget:
            budget = budget_by_name.get(raw_budget.lower())
            if budget:
                budget_id = budget.id

        expense = Expense(
            user_id=user_id,
            budget_id=budget_id,
            category_id=cat.id,
            amount=amount,
            currency=currency,
            description=description,
            date=expense_date,
        )
        db.add(expense)
        imported += 1

    if imported > 0:
        db.commit()

    return CsvImportResponse(imported=imported, skipped=skipped, errors=errors)
