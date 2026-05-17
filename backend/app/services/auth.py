from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.jwt import create_access_token
from app.auth.passwords import hash_password, verify_password
from app.exceptions import AlreadyExists, AppException
from app.models.user import User
from app.schemas.user import Token, UserCreate


def signup(db: Session, data: UserCreate) -> Token:
    existing = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none()
    if existing:
        raise AlreadyExists("Email already registered")
    user = User(email=data.email, hashed_password=hash_password(data.password), name=data.name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return Token(access_token=create_access_token(str(user.id)))


def login(db: Session, email: str, password: str) -> Token:
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        raise AppException(401, "Invalid email or password")
    return Token(access_token=create_access_token(str(user.id)))
