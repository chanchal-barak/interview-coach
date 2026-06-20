import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from services.auth_service import decode_access_token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency. Decodes the Bearer token, loads the user from DB.
    Raises 401 if missing, invalid, expired, or user no longer exists.
    Use on any route that requires authentication:

        @app.get("/me")
        def me(current_user: User = Depends(get_current_user)):
            ...
    """
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if token is None:
        raise credentials_error

    try:
        user_id = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise credentials_error

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_error

    return user


def get_current_user_optional(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    """
    Like get_current_user, but returns None instead of raising when no
    valid token is present. Use on routes that must keep working for
    anonymous users but should persist results when a user IS logged in
    (e.g. /upload-resume, /match-job).
    """
    if token is None:
        return None

    try:
        user_id = decode_access_token(token)
    except jwt.PyJWTError:
        return None

    return db.query(User).filter(User.id == user_id).first()