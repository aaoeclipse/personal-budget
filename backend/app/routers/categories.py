import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services import category as cat_service

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list:
    return cat_service.list_categories(db, user.id)


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(data: CategoryCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return cat_service.create_category(db, user.id, data)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: uuid.UUID, data: CategoryUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return cat_service.update_category(db, user.id, category_id, data)


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat_service.delete_category(db, user.id, category_id)
