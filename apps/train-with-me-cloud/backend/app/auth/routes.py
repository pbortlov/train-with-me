from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.core.security import TokenError, create_access_token, decode_jwt, hash_password, verify_password
from app.db.models import User
from app.db.session import get_db_session

router = APIRouter()


def auth_error(code: str, message: str, status_code: int) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"error": {"code": code, "message": message}},
    )


def user_response(user: User) -> UserResponse:
    return UserResponse(id=user.id, email=user.email, display_name=user.display_name)


def token_response(user: User) -> TokenResponse:
    return TokenResponse(access_token=create_access_token(user.id), user=user_response(user))


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest, db: Annotated[Session, Depends(get_db_session)]) -> TokenResponse:
    existing_user = db.scalar(select(User).where(User.email == payload.email))
    if existing_user:
        raise auth_error("email_already_registered", "Email is already registered.", status.HTTP_409_CONFLICT)

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        display_name=payload.display_name,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise auth_error("email_already_registered", "Email is already registered.", status.HTTP_409_CONFLICT) from exc

    db.refresh(user)
    return token_response(user)


@router.post("/login")
def login_user(payload: LoginRequest, db: Annotated[Session, Depends(get_db_session)]) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise auth_error("invalid_credentials", "Email or password is incorrect.", status.HTTP_401_UNAUTHORIZED)

    return token_response(user)


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db_session),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise auth_error("not_authenticated", "Bearer token is required.", status.HTTP_401_UNAUTHORIZED)

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = decode_jwt(token)
    except (TokenError, ValueError) as exc:
        raise auth_error("invalid_token", "Bearer token is invalid.", status.HTTP_401_UNAUTHORIZED) from exc

    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        raise auth_error("invalid_token", "Bearer token is invalid.", status.HTTP_401_UNAUTHORIZED)

    user = db.get(User, user_id)
    if not user:
        raise auth_error("invalid_token", "Bearer token is invalid.", status.HTTP_401_UNAUTHORIZED)

    return user


@router.get("/me")
def read_current_user(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    return user_response(current_user)
