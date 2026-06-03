import pytest
from fastapi import HTTPException
from fastapi.routing import APIRoute
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth.routes import register_user
from app.auth.schemas import RegisterRequest
from app.coach_invites.routes import accept_coach_invite, create_coach_invite, read_coach_invite
from app.db.base import Base
from app.db.models import CoachInvite, TrainingSpaceMembership, TrainingSpaceRole, User
from app.main import app
from app.spaces.routes import create_training_space
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


def create_owned_space(db: Session, owner: User):
    return create_training_space(
        TrainingSpaceCreateRequest(name="Base Season"),
        owner,
        db,
    )


def test_owner_creates_coach_invite(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_owned_space(db_session, owner)

    invite = create_coach_invite(space.id, owner, db_session)

    saved_invite = db_session.query(CoachInvite).filter_by(token=invite.token).one()
    assert invite.training_space_id == space.id
    assert invite.training_space_name == "Base Season"
    assert saved_invite.created_by_user_id == owner.id
    assert saved_invite.accepted_at is None


def test_non_owner_cannot_create_coach_invite(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    other_user = create_user(db_session, "other@example.com")
    space = create_owned_space(db_session, owner)

    with pytest.raises(HTTPException) as exc_info:
        create_coach_invite(space.id, other_user, db_session)

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == {
        "error": {
            "code": "training_space_not_found",
            "message": "Training space was not found.",
        },
    }


def test_coach_can_preview_and_accept_invite(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    coach = create_user(db_session, "coach@example.com")
    space = create_owned_space(db_session, owner)
    invite = create_coach_invite(space.id, owner, db_session)

    preview = read_coach_invite(invite.token, db_session)
    accepted = accept_coach_invite(invite.token, coach, db_session)

    assert preview.training_space_id == space.id
    assert accepted.training_space_id == space.id
    assert accepted.training_space_name == "Base Season"
    assert accepted.role == TrainingSpaceRole.coach.value


def test_accept_invite_creates_coach_membership(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    coach = create_user(db_session, "coach@example.com")
    space = create_owned_space(db_session, owner)
    invite = create_coach_invite(space.id, owner, db_session)

    accept_coach_invite(invite.token, coach, db_session)

    membership = db_session.query(TrainingSpaceMembership).filter_by(
        training_space_id=space.id,
        user_id=coach.id,
    ).one()
    saved_invite = db_session.query(CoachInvite).filter_by(token=invite.token).one()
    assert membership.role == TrainingSpaceRole.coach.value
    assert saved_invite.accepted_by_user_id == coach.id
    assert saved_invite.accepted_at is not None


def test_accepted_invite_cannot_be_reused(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    coach = create_user(db_session, "coach@example.com")
    second_coach = create_user(db_session, "second-coach@example.com")
    space = create_owned_space(db_session, owner)
    invite = create_coach_invite(space.id, owner, db_session)
    accept_coach_invite(invite.token, coach, db_session)

    with pytest.raises(HTTPException) as exc_info:
        accept_coach_invite(invite.token, second_coach, db_session)

    assert exc_info.value.status_code == 409
    assert exc_info.value.detail == {
        "error": {
            "code": "coach_invite_already_accepted",
            "message": "Coach invite has already been accepted.",
        },
    }


def test_coach_invite_routes_are_registered() -> None:
    route_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }

    assert "/api/training-spaces/{training_space_id}/coach-invites" in route_paths
    assert "/api/coach-invites/{token}" in route_paths
    assert "/api/coach-invites/{token}/accept" in route_paths
