import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.auth.routes import register_user
from app.auth.schemas import RegisterRequest
from app.db.base import Base
from app.db.models import PlannedSession, PlannedSessionSource, ProgramInstance, ProgramTemplate, User, Workout
from app.imports.routes import commit_v1_backup
from app.imports.schemas import V1ImportCommitRequest
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


def test_commit_v1_backup_imports_planned_sessions_as_historical_data(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)
    backup = load_sample_backup()
    backup["plannedSessions"][0] = {
        **backup["plannedSessions"][0],
        "linkedWorkoutId": "workout-1",
        "source": "phase-generated",
        "phaseTemplateId": "phase-template-1",
        "phaseInstanceId": "phase-instance-1",
        "phaseSlotId": "slot-a",
        "phaseWeekIndex": 2,
        "generatedDate": "2026-05-20",
        "dateMovedManually": True,
        "status": "completed",
        "modificationNote": "Moved",
        "actual": {"distance": 5, "pace": 4.4},
        "createdAt": 1779451200000,
    }

    response = commit_v1_backup(commit_payload(space.id, backup), owner, db_session)

    assert response.imported_planned_session_count == 1
    assert response.skipped_planned_session_count == 0
    assert response.existing_planned_session_count == 0

    planned_session = db_session.scalar(select(PlannedSession).where(PlannedSession.original_v1_id == "planned-1"))
    assert planned_session is not None
    assert planned_session.type == "run"
    assert planned_session.title == "Easy run"
    assert planned_session.source == PlannedSessionSource.v1_import.value
    assert planned_session.coach_editable is False
    program_template = db_session.scalar(select(ProgramTemplate).where(ProgramTemplate.original_v1_id == "phase-template-1"))
    program_instance = db_session.scalar(select(ProgramInstance).where(ProgramInstance.original_v1_id == "phase-instance-1"))
    assert program_template is not None
    assert program_instance is not None
    assert planned_session.phase_template_id == program_template.id
    assert planned_session.phase_instance_id == program_instance.id
    assert planned_session.phase_slot_id == "slot-a"
    assert planned_session.phase_week_index == 2
    assert planned_session.date_moved_manually is True
    assert planned_session.status == "completed"
    assert planned_session.modification_note == "Moved"
    assert planned_session.actual_json == {"distance": 5, "pace": 4.4}
    assert planned_session.details_json == {"distance": 5}

    linked_workout = db_session.scalar(select(Workout).where(Workout.original_v1_id == "workout-1"))
    assert linked_workout is not None
    assert planned_session.linked_workout_id == linked_workout.id


def test_commit_v1_backup_is_idempotent_for_planned_sessions(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)

    first = commit_v1_backup(commit_payload(space.id), owner, db_session)
    second = commit_v1_backup(commit_payload(space.id), owner, db_session)

    assert first.imported_planned_session_count == 1
    assert second.imported_planned_session_count == 0
    assert second.existing_planned_session_count == 1
    assert len(db_session.scalars(select(PlannedSession)).all()) == 1


def test_commit_v1_backup_warns_when_planned_session_link_is_missing(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)
    backup = load_sample_backup()
    backup["plannedSessions"][0]["linkedWorkoutId"] = "missing-workout"

    response = commit_v1_backup(commit_payload(space.id, backup), owner, db_session)

    assert response.imported_planned_session_count == 1
    assert "plannedSessions[0] linkedWorkoutId missing-workout was not found; link skipped." in response.warnings
    planned_session = db_session.scalar(select(PlannedSession).where(PlannedSession.original_v1_id == "planned-1"))
    assert planned_session is not None
    assert planned_session.linked_workout_id is None


def test_commit_v1_backup_skips_invalid_planned_session_rows(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)
    backup = load_sample_backup()
    backup["plannedSessions"].append({"id": "bad-session", "date": "not-a-date"})

    response = commit_v1_backup(commit_payload(space.id, backup), owner, db_session)

    assert response.imported_planned_session_count == 1
    assert response.skipped_planned_session_count == 1
    assert "plannedSessions[1] has invalid date; skipped." in response.warnings
