from datetime import date

import pytest
from fastapi import HTTPException
from fastapi.routing import APIRoute
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth.routes import register_user
from app.auth.schemas import RegisterRequest
from app.db.base import Base
from app.db.models import (
    PlannedSession,
    TrainingSpaceMembership,
    TrainingSpaceRole,
    User,
    Workout,
    WorkoutSource,
)
from app.main import app
from app.spaces.routes import create_training_space
from app.spaces.schemas import TrainingSpaceCreateRequest
from app.workouts.routes import create_workout, delete_workout, list_workouts, update_workout
from app.workouts.schemas import (
    SprintSetPayload,
    StrengthExercisePayload,
    WorkoutCreateRequest,
    WorkoutSetPayload,
    WorkoutUpdateRequest,
)


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


def test_create_strength_workout(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, user)

    response = create_workout(
        space.id,
        WorkoutCreateRequest(
            activity="strength",
            date=date(2026, 5, 21),
            strength_exercises=[
                StrengthExercisePayload(
                    name="Back squat",
                    sets=[
                        WorkoutSetPayload(reps=5, weight=100, load_type="kg"),
                        WorkoutSetPayload(reps=5, weight=105, load_type="kg"),
                    ],
                ),
            ],
            notes="Heavy but clean.",
        ),
        user,
        db_session,
    )

    assert response.activity == "strength"
    assert response.notes == "Heavy but clean."
    assert response.strength_exercises[0].name == "Back squat"
    assert response.strength_exercises[0].sets[1].weight == 105
    assert response.source == WorkoutSource.manual.value
    assert response.coach_editable is True


def test_create_run_workout(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, user)

    response = create_workout(
        space.id,
        WorkoutCreateRequest(
            activity="run",
            date=date(2026, 5, 21),
            distance=5,
            time="22:00",
            pace=4.4,
            notes="Tempo.",
        ),
        user,
        db_session,
    )

    assert response.activity == "run"
    assert response.distance == 5
    assert response.time == "22:00"
    assert response.pace == 4.4


def test_create_sprint_workout(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, user)

    response = create_workout(
        space.id,
        WorkoutCreateRequest(
            activity="sprint",
            date=date(2026, 5, 21),
            sprint_feeling="sharp",
            sprint_sets=[
                SprintSetPayload(distance_m=100, time_sec=13.8),
                SprintSetPayload(distance_m=100, time_sec=13.7),
            ],
        ),
        user,
        db_session,
    )

    assert response.activity == "sprint"
    assert response.sprint_feeling == "sharp"
    assert [sprint_set.time_sec for sprint_set in response.sprint_sets] == [13.8, 13.7]


def test_list_workouts(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, user)
    create_workout(
        space.id,
        WorkoutCreateRequest(
            activity="run",
            date=date(2026, 5, 20),
            distance=5,
            time="23:00",
            pace=4.6,
        ),
        user,
        db_session,
    )
    create_workout(
        space.id,
        WorkoutCreateRequest(
            activity="sprint",
            date=date(2026, 5, 21),
            sprint_sets=[SprintSetPayload(distance_m=60, time_sec=7.4)],
        ),
        user,
        db_session,
    )

    workouts = list_workouts(space.id, user, db_session)

    assert [workout.activity for workout in workouts] == ["sprint", "run"]


def test_update_workout_notes(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, user)
    workout = create_workout(
        space.id,
        WorkoutCreateRequest(
            activity="run",
            date=date(2026, 5, 21),
            distance=5,
            time="22:00",
            pace=4.4,
            notes="Initial notes",
        ),
        user,
        db_session,
    )

    response = update_workout(
        space.id,
        workout.id,
        WorkoutUpdateRequest(notes="Updated after review"),
        user,
        db_session,
    )

    assert response.notes == "Updated after review"


def test_coach_cannot_mutate_historical_imported_workout(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    coach = create_user(db_session, "coach@example.com")
    space = create_space(db_session, owner)
    db_session.add(
        TrainingSpaceMembership(
            training_space_id=space.id,
            user_id=coach.id,
            role=TrainingSpaceRole.coach.value,
        ),
    )
    imported_workout = Workout(
        training_space_id=space.id,
        activity="run",
        date=date(2026, 5, 21),
        distance=5,
        time="22:00",
        pace=4.4,
        notes="Imported",
        source=WorkoutSource.v1_import.value,
        coach_editable=False,
        original_v1_id="v1-workout-1",
    )
    db_session.add(imported_workout)
    db_session.commit()
    db_session.refresh(imported_workout)

    with pytest.raises(HTTPException) as exc_info:
        update_workout(
            space.id,
            imported_workout.id,
            WorkoutUpdateRequest(notes="Coach edit"),
            coach,
            db_session,
        )

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == {
        "error": {
            "code": "workout_not_editable",
            "message": "Imported historical workout cannot be edited by a coach.",
        },
    }


def test_delete_workout_unlinks_planned_session(db_session: Session) -> None:
    user = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, user)
    workout = create_workout(
        space.id,
        WorkoutCreateRequest(
            activity="run",
            date=date(2026, 5, 21),
            distance=5,
            time="22:00",
            pace=4.4,
        ),
        user,
        db_session,
    )
    planned_session = PlannedSession(
        training_space_id=space.id,
        type="run",
        title="Easy run",
        date=date(2026, 5, 21),
        linked_workout_id=workout.id,
        actual_json={"distance": 5},
        details_json={"distance": 5},
        status="completed",
    )
    db_session.add(planned_session)
    db_session.commit()

    delete_workout(space.id, workout.id, user, db_session)

    assert db_session.get(Workout, workout.id) is None
    db_session.refresh(planned_session)
    assert planned_session.linked_workout_id is None
    assert planned_session.actual_json is None
    assert planned_session.status == "planned"


def test_workout_routes_are_registered() -> None:
    route_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }

    assert "/api/training-spaces/{training_space_id}/workouts" in route_paths
    assert "/api/training-spaces/{training_space_id}/workouts/{workout_id}" in route_paths
