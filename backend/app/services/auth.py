from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.jwt import create_access_token
from app.auth.passwords import hash_password, verify_password
from app.exceptions import AlreadyExists, AppException
from app.models.category import Category
from app.models.user import User
from app.schemas.user import Token, UserCreate

DEFAULT_CATEGORIES = [
    {"name": "Food", "color": "#FF6B6B", "emoji": "🍕"},
    {"name": "Coffee", "color": "#8B4513", "emoji": "☕"},
    {"name": "Groceries", "color": "#4CAF50", "emoji": "🛒"},
    {"name": "Shopping", "color": "#E91E63", "emoji": "🛍️"},
    {"name": "Transport", "color": "#2196F3", "emoji": "🚗"},
    {"name": "Entertainment", "color": "#9C27B0", "emoji": "🎬"},
    {"name": "Bills", "color": "#FF9800", "emoji": "💡"},
    {"name": "Health", "color": "#00BCD4", "emoji": "💊"},
    {"name": "Dining", "color": "#F44336", "emoji": "🍽️"},
    {"name": "Gas", "color": "#607D8B", "emoji": "⛽"},
    {"name": "Subscriptions", "color": "#673AB7", "emoji": "📱"},
    {"name": "Rent", "color": "#795548", "emoji": "🏠"},
    {"name": "Other", "color": "#9E9E9E", "emoji": "📦"},
]


def signup(db: Session, data: UserCreate) -> Token:
    existing = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none()
    if existing:
        raise AlreadyExists("Email already registered")
    user = User(email=data.email, hashed_password=hash_password(data.password), name=data.name)
    db.add(user)
    db.flush()

    # Create default categories for the new user
    for cat_data in DEFAULT_CATEGORIES:
        db.add(Category(user_id=user.id, **cat_data))

    db.commit()
    db.refresh(user)
    return Token(access_token=create_access_token(str(user.id)))


def login(db: Session, email: str, password: str) -> Token:
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        raise AppException(401, "Invalid email or password")
    return Token(access_token=create_access_token(str(user.id)))
