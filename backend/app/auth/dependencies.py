import uuid

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.jwt import decode_access_token
from app.database import get_db
from app.exceptions import AppException
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    user_id = decode_access_token(token)
    if user_id is None:
        raise AppException(401, "Invalid or expired token")
    user = db.get(User, uuid.UUID(user_id))
    if user is None:
        raise AppException(401, "User not found")
    return user
