import pytest
from fastapi import HTTPException
from fastapi.routing import APIRoute
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.auth.routes import register_user
from app.auth.schemas import RegisterRequest
from app.db.base import Base
from app.db.models import TrainingSpaceMembership, TrainingSpaceRole, User, Workout, WorkoutSource
from app.imports.routes import commit_v1_backup
from app.imports.schemas import V1ImportCommitRequest
from app.main import app
from app.spaces.routes import create_training_space
from app.spaces.schemas import TrainingSpaceCreateRequest
from tests.test_v1_parser import load_sample_backup


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
    user = db.get(User, registered.user.id)
    assert user is not None
    return user


def create_space(db: Session, owner: User):
    return create_training_space(TrainingSpaceCreateRequest(name="Base Season"), owner, db)


def commit_payload(training_space_id: str, backup: dict | None = None) -> V1ImportCommitRequest:
    return V1ImportCommitRequest(trainingSpaceId=training_space_id, backup=backup or load_sample_backup())


def test_commit_v1_backup_imports_workouts_as_historical_data(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)

    response = commit_v1_backup(commit_payload(space.id), owner, db_session)

    assert response.imported_workout_count == 2
    assert response.skipped_workout_count == 0
    assert response.existing_workout_count == 0
    assert response.imported_planned_session_count == 1
    assert response.skipped_planned_session_count == 0
    assert response.existing_planned_session_count == 0
    assert response.imported_goal_count == 1
    assert response.imported_phase_template_count == 1
    assert response.imported_phase_instance_count == 1
    assert response.warnings == []

    workouts = db_session.scalars(select(Workout).order_by(Workout.original_v1_id)).all()
    assert [workout.original_v1_id for workout in workouts] == ["workout-1", "workout-2"]
    assert {workout.source for workout in workouts} == {WorkoutSource.v1_import.value}
    assert {workout.coach_editable for workout in workouts} == {False}

    run = workouts[0]
    assert run.activity == "run"
    assert run.time == "00:22:00"
    assert run.pace == 4.4

    strength = workouts[1]
    assert strength.strength_exercises[0].name == "Back squat"
    assert strength.strength_exercises[0].sets[0].reps == 5
    assert strength.strength_exercises[0].sets[0].weight == 100


def test_commit_v1_backup_is_idempotent_by_original_v1_id(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)

    first = commit_v1_backup(commit_payload(space.id), owner, db_session)
    second = commit_v1_backup(commit_payload(space.id), owner, db_session)

    assert first.imported_workout_count == 2
    assert second.imported_workout_count == 0
    assert second.existing_workout_count == 2
    assert second.imported_planned_session_count == 0
    assert second.existing_planned_session_count == 1
    assert second.imported_goal_count == 0
    assert second.existing_goal_count == 1
    assert len(db_session.scalars(select(Workout)).all()) == 2


def test_commit_v1_backup_skips_invalid_workout_rows(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)
    backup = load_sample_backup()
    backup["workouts"].append({"id": "bad-workout", "activity": "swim", "date": "2026-05-22"})

    response = commit_v1_backup(commit_payload(space.id, backup), owner, db_session)

    assert response.imported_workout_count == 2
    assert response.skipped_workout_count == 1
    assert response.warnings == ["workouts[2] has unsupported activity swim; skipped."]


def test_commit_v1_backup_rejects_invalid_backup(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)

    with pytest.raises(HTTPException) as exc_info:
        commit_v1_backup(commit_payload(space.id, {"goals": {}}), owner, db_session)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == {
        "error": {
            "code": "invalid_v1_backup",
            "message": "V1 backup requires workouts to be an array.",
        },
    }


def test_coach_cannot_commit_v1_backup(db_session: Session) -> None:
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
    db_session.commit()

    with pytest.raises(HTTPException) as exc_info:
        commit_v1_backup(commit_payload(space.id), coach, db_session)

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == {
        "error": {
            "code": "import_forbidden",
            "message": "Coach members cannot import athlete history.",
        },
    }


def test_v1_import_commit_route_is_registered() -> None:
    route_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }

    assert "/api/imports/v1/commit" in route_paths
