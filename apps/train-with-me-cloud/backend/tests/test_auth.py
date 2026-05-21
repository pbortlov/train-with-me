import pytest
from fastapi import HTTPException
from fastapi.routing import APIRoute
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user, login_user, read_current_user, register_user
from app.auth.schemas import LoginRequest, RegisterRequest
from app.core.security import create_access_token, decode_jwt, hash_password, verify_password
from app.db.base import Base
from app.db.models import User
from app.main import app


@pytest.fixture()
def db_session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


def register_payload(
    email: str = "athlete@example.com",
    password: str = "correct-password",
    display_name: str = "Athlete",
) -> RegisterRequest:
    return RegisterRequest(email=email, password=password, display_name=display_name)


def test_password_hash_verification() -> None:
    password_hash = hash_password("correct-password")

    assert password_hash != "correct-password"
    assert verify_password("correct-password", password_hash)
    assert not verify_password("wrong-password", password_hash)


def test_access_token_round_trip() -> None:
    token = create_access_token("user-id")

    assert decode_jwt(token)["sub"] == "user-id"


def test_register_creates_user_and_token(db_session: Session) -> None:
    response = register_user(register_payload(), db_session)

    saved_user = db_session.query(User).filter_by(email="athlete@example.com").one()
    assert saved_user.display_name == "Athlete"
    assert verify_password("correct-password", saved_user.password_hash)
    assert response.token_type == "bearer"
    assert response.user.email == "athlete@example.com"
    assert decode_jwt(response.access_token)["sub"] == saved_user.id


def test_register_rejects_duplicate_email(db_session: Session) -> None:
    register_user(register_payload(), db_session)

    with pytest.raises(HTTPException) as exc_info:
        register_user(register_payload(display_name="Second"), db_session)

    assert exc_info.value.status_code == 409
    assert exc_info.value.detail == {
        "error": {
            "code": "email_already_registered",
            "message": "Email is already registered.",
        },
    }


def test_login_returns_token(db_session: Session) -> None:
    register_user(register_payload(), db_session)

    response = login_user(
        LoginRequest(email="athlete@example.com", password="correct-password"),
        db_session,
    )

    assert response.token_type == "bearer"
    assert response.user.email == "athlete@example.com"
    assert decode_jwt(response.access_token)["sub"] == response.user.id


def test_login_rejects_wrong_password(db_session: Session) -> None:
    register_user(register_payload(), db_session)

    with pytest.raises(HTTPException) as exc_info:
        login_user(LoginRequest(email="athlete@example.com", password="wrong-password"), db_session)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == {
        "error": {
            "code": "invalid_credentials",
            "message": "Email or password is incorrect.",
        },
    }


def test_me_requires_auth(db_session: Session) -> None:
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(None, db_session)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == {
        "error": {
            "code": "not_authenticated",
            "message": "Bearer token is required.",
        },
    }


def test_me_returns_current_user(db_session: Session) -> None:
    registered = register_user(register_payload(), db_session)

    current_user = get_current_user(f"Bearer {registered.access_token}", db_session)
    response = read_current_user(current_user)

    assert response.email == "athlete@example.com"
    assert response.display_name == "Athlete"


def test_auth_routes_are_registered() -> None:
    route_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }

    assert "/api/auth/register" in route_paths
    assert "/api/auth/login" in route_paths
    assert "/api/auth/me" in route_paths
