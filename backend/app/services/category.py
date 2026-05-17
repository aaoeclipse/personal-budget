import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.exceptions import AlreadyExists, AppException, Forbidden, NotFound
from app.models.category import Category
from app.models.expense import Expense
from app.schemas.category import CategoryCreate, CategoryUpdate


def list_categories(db: Session, user_id: uuid.UUID) -> list[Category]:
    return list(db.execute(select(Category).where(Category.user_id == user_id).order_by(Category.name)).scalars().all())


def create_category(db: Session, user_id: uuid.UUID, data: CategoryCreate) -> Category:
    existing = db.execute(
        select(Category).where(Category.user_id == user_id, Category.name == data.name)
    ).scalar_one_or_none()
    if existing:
        raise AlreadyExists("Category with this name already exists")
    cat = Category(user_id=user_id, name=data.name, color=data.color)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def update_category(db: Session, user_id: uuid.UUID, category_id: uuid.UUID, data: CategoryUpdate) -> Category:
    cat = db.get(Category, category_id)
    if not cat:
        raise NotFound("Category not found")
    if cat.user_id != user_id:
        raise Forbidden()
    if data.name is not None:
        dup = db.execute(
            select(Category).where(Category.user_id == user_id, Category.name == data.name, Category.id != category_id)
        ).scalar_one_or_none()
        if dup:
            raise AlreadyExists("Category with this name already exists")
        cat.name = data.name
    if data.color is not None:
        cat.color = data.color
    db.commit()
    db.refresh(cat)
    return cat


def delete_category(db: Session, user_id: uuid.UUID, category_id: uuid.UUID) -> None:
    cat = db.get(Category, category_id)
    if not cat:
        raise NotFound("Category not found")
    if cat.user_id != user_id:
        raise Forbidden()
    has_expenses = db.execute(select(Expense.id).where(Expense.category_id == category_id).limit(1)).first()
    if has_expenses:
        raise AppException(400, "Cannot delete category with existing expenses")
    db.delete(cat)
    db.commit()
