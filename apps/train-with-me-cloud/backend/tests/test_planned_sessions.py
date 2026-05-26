from datetime import date

import pytest
from fastapi import HTTPException
from fastapi.routing import APIRoute
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth.routes import register_user
from app.auth.schemas import RegisterRequest
from app.db.base import Base
from app.db.models import PlannedSession, User
from app.main import app
from app.plans.routes import create_planned_session, delete_planned_session, list_planned_sessions, update_planned_session
from app.plans.schemas import PlannedSessionCreateRequest, PlannedSessionUpdateRequest
from app.spaces.routes import create_training_space
from app.spaces.schemas import TrainingSpaceCreateRequest
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


def test_create_planned_session_preserves_v1_metadata(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, user)

    response = create_planned_session(
        space.id,
        PlannedSessionCreateRequest(
            type="strength",
            title="Strength A",
            date=date(2026, 5, 22),
            phase_template_id="phase-template-1",
            phase_instance_id="phase-instance-1",
            phase_slot_id="slot-a",
            phase_week_index=2,
            generated_date=date(2026, 5, 20),
            date_moved_manually=True,
            modification_note="Moved for travel",
            actual_json={"status": "partial"},
            details_json={"blocks": [{"label": "A"}]},
            status="modified",
            source="phase-generated",
            coach_editable=False,
            original_v1_id="planned-v1-1",
        ),
        user,
        db_session,
    )

    assert response.type == "strength"
    assert response.title == "Strength A"
    assert response.phase_template_id == "phase-template-1"
    assert response.phase_instance_id == "phase-instance-1"
    assert response.phase_slot_id == "slot-a"
    assert response.phase_week_index == 2
    assert response.generated_date == date(2026, 5, 20)
    assert response.date_moved_manually is True
    assert response.modification_note == "Moved for travel"
    assert response.actual_json == {"status": "partial"}
    assert response.details_json == {"blocks": [{"label": "A"}]}
    assert response.status == "modified"
    assert response.source == "phase-generated"
    assert response.coach_editable is False
    assert response.original_v1_id == "planned-v1-1"


def test_list_planned_sessions(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, user)
    create_planned_session(
        space.id,
        PlannedSessionCreateRequest(type="run", title="Easy run", date=date(2026, 5, 23), details_json={"distance": 5}),
        user,
        db_session,
    )
    create_planned_session(
        space.id,
        PlannedSessionCreateRequest(type="sprint", title="Starts", date=date(2026, 5, 22), details_json={"reps": 4}),
        user,
        db_session,
    )

    sessions = list_planned_sessions(space.id, user, db_session)

    assert [session.title for session in sessions] == ["Starts", "Easy run"]


def test_create_planned_session_links_workout(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, user)
    workout = create_workout(
        space.id,
        WorkoutCreateRequest(
            activity="run",
            date=date(2026, 5, 22),
            distance=5,
            time="22:00",
            pace=4.4,
        ),
        user,
        db_session,
    )

    response = create_planned_session(
        space.id,
        PlannedSessionCreateRequest(
            type="run",
            title="Linked run",
            date=date(2026, 5, 22),
            linked_workout_id=workout.id,
            status="completed",
            actual_json={"pace": 4.4},
            details_json={"distance": 5},
        ),
        user,
        db_session,
    )

    assert response.linked_workout_id == workout.id
    assert response.status == "completed"
    assert response.actual_json == {"pace": 4.4}


def test_create_planned_session_rejects_cross_space_workout_link(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    other_user = create_user(db_session, "other@example.com")
    space = create_space(db_session, user)
    other_space = create_space(db_session, other_user)
    workout = create_workout(
        other_space.id,
        WorkoutCreateRequest(
            activity="run",
            date=date(2026, 5, 22),
            distance=5,
            time="22:00",
            pace=4.4,
        ),
        other_user,
        db_session,
    )

    with pytest.raises(HTTPException) as exc_info:
        create_planned_session(
            space.id,
            PlannedSessionCreateRequest(
                type="run",
                title="Bad link",
                date=date(2026, 5, 22),
                linked_workout_id=workout.id,
                details_json={"distance": 5},
            ),
            user,
            db_session,
        )

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == {
        "error": {
            "code": "workout_not_found",
            "message": "Workout was not found.",
        },
    }


def test_update_planned_session_links_completed_workout(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, user)
    session = create_planned_session(
        space.id,
        PlannedSessionCreateRequest(type="run", title="Easy run", date=date(2026, 5, 22), details_json={"distance": 5}),
        user,
        db_session,
    )
    workout = create_workout(
        space.id,
        WorkoutCreateRequest(
            activity="run",
            date=date(2026, 5, 22),
            distance=5,
            time="22:00",
            pace=4.4,
        ),
        user,
        db_session,
    )

    response = update_planned_session(
        space.id,
        session.id,
        PlannedSessionUpdateRequest(
            linked_workout_id=workout.id,
            status="completed",
            actual_json={"distance": 5, "time": "22:00", "pace": 4.4},
            modification_note="Felt easy",
        ),
        user,
        db_session,
    )

    assert response.linked_workout_id == workout.id
    assert response.status == "completed"
    assert response.actual_json == {"distance": 5, "time": "22:00", "pace": 4.4}
    assert response.modification_note == "Felt easy"


def test_update_planned_session_edits_title_date_and_details(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, user)
    session = create_planned_session(
        space.id,
        PlannedSessionCreateRequest(type="run", title="Easy run", date=date(2026, 5, 22), details_json={"distance": 5}),
        user,
        db_session,
    )

    response = update_planned_session(
        space.id,
        session.id,
        PlannedSessionUpdateRequest(
            title="Long run",
            date=date(2026, 5, 24),
            details_json={"distance": 12, "paceGoal": 5.2},
        ),
        user,
        db_session,
    )

    assert response.title == "Long run"
    assert response.date == date(2026, 5, 24)
    assert response.details_json == {"distance": 12, "paceGoal": 5.2}


def test_update_planned_session_rejects_cross_space_workout_link(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    other_user = create_user(db_session, "other@example.com")
    space = create_space(db_session, user)
    other_space = create_space(db_session, other_user)
    session = create_planned_session(
        space.id,
        PlannedSessionCreateRequest(type="run", title="Easy run", date=date(2026, 5, 22), details_json={"distance": 5}),
        user,
        db_session,
    )
    workout = create_workout(
        other_space.id,
        WorkoutCreateRequest(
            activity="run",
            date=date(2026, 5, 22),
            distance=5,
            time="22:00",
            pace=4.4,
        ),
        other_user,
        db_session,
    )

    with pytest.raises(HTTPException) as exc_info:
        update_planned_session(
            space.id,
            session.id,
            PlannedSessionUpdateRequest(linked_workout_id=workout.id, status="completed"),
            user,
            db_session,
        )

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == {
        "error": {
            "code": "workout_not_found",
            "message": "Workout was not found.",
        },
    }


def test_delete_planned_session(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, user)
    session = create_planned_session(
        space.id,
        PlannedSessionCreateRequest(type="run", title="Easy run", date=date(2026, 5, 22), details_json={"distance": 5}),
        user,
        db_session,
    )

    delete_planned_session(space.id, session.id, user, db_session)

    assert db_session.get(PlannedSession, session.id) is None


def test_planned_session_routes_are_registered() -> None:
    route_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }

    assert "/api/training-spaces/{training_space_id}/planned-sessions" in route_paths
    assert "/api/training-spaces/{training_space_id}/planned-sessions/{session_id}" in route_paths
