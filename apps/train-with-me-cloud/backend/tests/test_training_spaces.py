import pytest
from fastapi import HTTPException
from fastapi.routing import APIRoute
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth.routes import register_user
from app.auth.schemas import RegisterRequest
from app.db.base import Base
from app.db.models import TrainingSpaceMembership, TrainingSpaceRole, User
from app.main import app
from app.spaces.routes import create_training_space, list_my_training_spaces, read_training_space
from app.spaces.schemas import TrainingSpaceCreateRequest


@pytest.fixture()
def db_session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


def create_user(db: Session, email: str) -> User:
    registered = register_user(
        RegisterRequest(
            email=email,
            password="correct-password",
            display_name=email.split("@", 1)[0],
        ),
        db,
    )
    return db.get(User, registered.user.id)


def test_new_user_can_create_training_space(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")

    response = create_training_space(
        TrainingSpaceCreateRequest(name="Base Season"),
        user,
        db_session,
    )

    assert response.name == "Base Season"
    assert response.owner_user_id == user.id
    assert response.my_role == TrainingSpaceRole.owner.value


def test_owner_membership_is_created(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")

    response = create_training_space(
        TrainingSpaceCreateRequest(name="Base Season"),
        user,
        db_session,
    )

    membership = db_session.query(TrainingSpaceMembership).filter_by(
        training_space_id=response.id,
        user_id=user.id,
    ).one()
    assert membership.role == TrainingSpaceRole.owner.value


def test_owner_can_list_and_view_own_training_space(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    created = create_training_space(
        TrainingSpaceCreateRequest(name="Base Season"),
        user,
        db_session,
    )

    spaces = list_my_training_spaces(user, db_session)
    viewed = read_training_space(created.id, user, db_session)

    assert [space.id for space in spaces] == [created.id]
    assert viewed.id == created.id
    assert viewed.name == "Base Season"
    assert viewed.my_role == TrainingSpaceRole.owner.value


def test_other_user_cannot_view_private_training_space(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    other_user = create_user(db_session, "other@example.com")
    created = create_training_space(
        TrainingSpaceCreateRequest(name="Base Season"),
        owner,
        db_session,
    )

    with pytest.raises(HTTPException) as exc_info:
        read_training_space(created.id, other_user, db_session)

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == {
        "error": {
            "code": "training_space_not_found",
            "message": "Training space was not found.",
        },
    }


def test_training_space_routes_are_registered() -> None:
    route_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }

    assert "/api/training-spaces" in route_paths
    assert "/api/training-spaces/{training_space_id}" in route_paths
