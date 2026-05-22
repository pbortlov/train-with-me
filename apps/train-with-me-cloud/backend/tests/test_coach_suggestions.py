from datetime import date

import pytest
from fastapi import HTTPException
from fastapi.routing import APIRoute
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth.routes import register_user
from app.auth.schemas import RegisterRequest
from app.db.base import Base
from app.db.models import AuditEvent, TrainingSpaceMembership, TrainingSpaceRole, User, Workout
from app.main import app
from app.spaces.routes import create_training_space
from app.spaces.schemas import TrainingSpaceCreateRequest
from app.suggestions.routes import (
    accept_coach_suggestion,
    create_coach_suggestion,
    list_coach_suggestions,
    reject_coach_suggestion,
)
from app.suggestions.schemas import CoachSuggestionCreateRequest
from app.workouts.routes import create_workout
from app.workouts.schemas import WorkoutCreateRequest


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


def create_space(db: Session, owner: User):
    return create_training_space(
        TrainingSpaceCreateRequest(name="Base Season"),
        owner,
        db,
    )


def add_coach_membership(db: Session, training_space_id: str, coach: User) -> None:
    db.add(
        TrainingSpaceMembership(
            training_space_id=training_space_id,
            user_id=coach.id,
            role=TrainingSpaceRole.coach.value,
        ),
    )
    db.commit()


def create_run_workout(db: Session, training_space_id: str, owner: User):
    return create_workout(
        training_space_id,
        WorkoutCreateRequest(
            activity="run",
            date=date(2026, 5, 22),
            distance=5,
            time="22:00",
            pace=4.4,
            notes="Original notes",
        ),
        owner,
        db,
    )


def suggestion_payload(workout_id: str, notes: str = "Coach suggested notes") -> CoachSuggestionCreateRequest:
    return CoachSuggestionCreateRequest(
        target_entity_type="workout",
        target_entity_id=workout_id,
        suggested_change_json={"notes": notes},
    )


def test_coach_can_create_suggestion(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    coach = create_user(db_session, "coach@example.com")
    space = create_space(db_session, owner)
    add_coach_membership(db_session, space.id, coach)
    workout = create_run_workout(db_session, space.id, owner)

    suggestion = create_coach_suggestion(space.id, suggestion_payload(workout.id), coach, db_session)

    assert suggestion.target_entity_type == "workout"
    assert suggestion.target_entity_id == workout.id
    assert suggestion.suggested_change_json == {"notes": "Coach suggested notes"}
    assert suggestion.status == "pending"
    assert suggestion.created_by_user_id == coach.id


def test_non_coach_cannot_create_suggestion(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    other_user = create_user(db_session, "other@example.com")
    space = create_space(db_session, owner)
    workout = create_run_workout(db_session, space.id, owner)

    with pytest.raises(HTTPException) as exc_info:
        create_coach_suggestion(space.id, suggestion_payload(workout.id), other_user, db_session)

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == {
        "error": {
            "code": "coach_permission_required",
            "message": "Coach membership is required.",
        },
    }


def test_owner_can_list_and_accept_suggestion(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    coach = create_user(db_session, "coach@example.com")
    space = create_space(db_session, owner)
    add_coach_membership(db_session, space.id, coach)
    workout = create_run_workout(db_session, space.id, owner)
    suggestion = create_coach_suggestion(space.id, suggestion_payload(workout.id, "Accepted notes"), coach, db_session)

    listed = list_coach_suggestions(space.id, owner, db_session)
    accepted = accept_coach_suggestion(space.id, suggestion.id, owner, db_session)
    saved_workout = db_session.get(Workout, workout.id)

    assert [item.id for item in listed] == [suggestion.id]
    assert accepted.status == "accepted"
    assert accepted.resolved_by_user_id == owner.id
    assert saved_workout.notes == "Accepted notes"


def test_owner_can_reject_suggestion_without_applying_change(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    coach = create_user(db_session, "coach@example.com")
    space = create_space(db_session, owner)
    add_coach_membership(db_session, space.id, coach)
    workout = create_run_workout(db_session, space.id, owner)
    suggestion = create_coach_suggestion(space.id, suggestion_payload(workout.id, "Rejected notes"), coach, db_session)

    rejected = reject_coach_suggestion(space.id, suggestion.id, owner, db_session)
    saved_workout = db_session.get(Workout, workout.id)

    assert rejected.status == "rejected"
    assert rejected.resolved_by_user_id == owner.id
    assert saved_workout.notes == "Original notes"


def test_accept_and_reject_create_audit_events(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    coach = create_user(db_session, "coach@example.com")
    space = create_space(db_session, owner)
    add_coach_membership(db_session, space.id, coach)
    accepted_workout = create_run_workout(db_session, space.id, owner)
    rejected_workout = create_run_workout(db_session, space.id, owner)
    accepted_suggestion = create_coach_suggestion(
        space.id,
        suggestion_payload(accepted_workout.id, "Accepted notes"),
        coach,
        db_session,
    )
    rejected_suggestion = create_coach_suggestion(
        space.id,
        suggestion_payload(rejected_workout.id, "Rejected notes"),
        coach,
        db_session,
    )

    accept_coach_suggestion(space.id, accepted_suggestion.id, owner, db_session)
    reject_coach_suggestion(space.id, rejected_suggestion.id, owner, db_session)

    events = db_session.query(AuditEvent).order_by(AuditEvent.created_at, AuditEvent.id).all()
    assert [event.event_type for event in events] == [
        "coach_suggestion.accepted",
        "coach_suggestion.rejected",
    ]
    assert all(event.actor_user_id == owner.id for event in events)
    assert events[0].metadata_json["target_entity_id"] == accepted_workout.id
    assert events[1].metadata_json["target_entity_id"] == rejected_workout.id


def test_suggestion_routes_are_registered() -> None:
    route_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }

    assert "/api/training-spaces/{training_space_id}/coach-suggestions" in route_paths
    assert "/api/training-spaces/{training_space_id}/coach-suggestions/{suggestion_id}/accept" in route_paths
    assert "/api/training-spaces/{training_space_id}/coach-suggestions/{suggestion_id}/reject" in route_paths
