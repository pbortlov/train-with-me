import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.auth.routes import register_user
from app.auth.schemas import RegisterRequest
from app.db.base import Base
from app.db.models import ImportedV1Metadata, PlannedSession, ProgramInstance, ProgramTemplate, TrainingGoal, User, Workout
from app.goals.routes import upsert_training_goal
from app.goals.schemas import TrainingGoalUpsertRequest
from app.imports.routes import commit_v1_backup, commit_v2_cloud_data, export_v1_backup, export_v2_cloud_data, list_v1_metadata
from app.imports.schemas import V1ImportCommitRequest, V2ImportCommitRequest
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


def test_commit_v1_backup_imports_goals_and_phase_metadata(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)
    backup = load_sample_backup()

    response = commit_v1_backup(commit_payload(space.id, backup), owner, db_session)

    assert response.imported_goal_count == 1
    assert response.imported_phase_template_count == 1
    assert response.imported_phase_instance_count == 1
    assert response.existing_goal_count == 0
    assert response.existing_phase_template_count == 0
    assert response.existing_phase_instance_count == 0

    metadata_rows = db_session.scalars(
        select(ImportedV1Metadata).order_by(ImportedV1Metadata.entity_type, ImportedV1Metadata.original_v1_id),
    ).all()
    assert [(row.entity_type, row.original_v1_id) for row in metadata_rows] == [
        ("goals", "goals"),
        ("phase_instance", "phase-instance-1"),
        ("phase_template", "phase-template-1"),
    ]
    assert {row.source for row in metadata_rows} == {"v1_import"}
    assert {row.coach_editable for row in metadata_rows} == {False}

    goals = next(row for row in metadata_rows if row.entity_type == "goals")
    assert goals.payload_json == backup["goals"]

    phase_template = next(row for row in metadata_rows if row.entity_type == "phase_template")
    assert phase_template.payload_json == backup["phaseTemplates"][0]

    phase_instance = next(row for row in metadata_rows if row.entity_type == "phase_instance")
    assert phase_instance.payload_json == backup["phaseInstances"][0]

    program_template = db_session.scalar(select(ProgramTemplate).where(ProgramTemplate.original_v1_id == "phase-template-1"))
    assert program_template is not None
    assert program_template.name == "Phase 1"
    assert program_template.duration_weeks == 4
    assert program_template.template_json["weekdaySlots"] == backup["phaseTemplates"][0]["weekdaySlots"]
    assert program_template.template_json["v1PhaseTemplateId"] == "phase-template-1"

    program_instance = db_session.scalar(select(ProgramInstance).where(ProgramInstance.original_v1_id == "phase-instance-1"))
    assert program_instance is not None
    assert program_instance.template_id == program_template.id
    assert program_instance.template_name == "Phase 1"
    assert program_instance.start_date.isoformat() == "2026-05-20"
    assert program_instance.duration_weeks == 4

    planned_session = db_session.scalar(select(PlannedSession).where(PlannedSession.original_v1_id == "planned-1"))
    assert planned_session is not None
    assert planned_session.phase_template_id == program_template.id
    assert planned_session.phase_instance_id == program_instance.id
    assert program_instance.generated_session_ids == [planned_session.id]


def test_commit_v1_backup_is_idempotent_for_goals_and_phase_metadata(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)

    first = commit_v1_backup(commit_payload(space.id), owner, db_session)
    second = commit_v1_backup(commit_payload(space.id), owner, db_session)

    assert first.imported_goal_count == 1
    assert first.imported_phase_template_count == 1
    assert first.imported_phase_instance_count == 1
    assert second.imported_goal_count == 0
    assert second.imported_phase_template_count == 0
    assert second.imported_phase_instance_count == 0
    assert second.existing_goal_count == 1
    assert second.existing_phase_template_count == 1
    assert second.existing_phase_instance_count == 1
    assert len(db_session.scalars(select(ImportedV1Metadata)).all()) == 3
    assert len(db_session.scalars(select(ProgramTemplate)).all()) == 1
    assert len(db_session.scalars(select(ProgramInstance)).all()) == 1


def test_commit_v1_backup_warns_for_invalid_phase_metadata_rows(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)
    backup = load_sample_backup()
    backup["phaseTemplates"].append({"name": "Missing id"})
    backup["phaseInstances"].append("bad-row")

    response = commit_v1_backup(commit_payload(space.id, backup), owner, db_session)

    assert response.imported_phase_template_count == 1
    assert response.imported_phase_instance_count == 1
    assert "phaseTemplates[1] is missing id; skipped." in response.warnings
    assert "phaseInstances[1] is not an object; skipped." in response.warnings


def test_list_v1_metadata_returns_imported_phase_rows(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)
    commit_v1_backup(commit_payload(space.id), owner, db_session)

    rows = list_v1_metadata(space.id, owner, db_session)

    assert [(row.entity_type, row.original_v1_id) for row in rows] == [
        ("goals", "goals"),
        ("phase_instance", "phase-instance-1"),
        ("phase_template", "phase-template-1"),
    ]
    phase_template = next(row for row in rows if row.entity_type == "phase_template")
    assert phase_template.payload["name"] == "Phase 1"


def test_export_v1_backup_returns_importable_shape(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)
    commit_v1_backup(commit_payload(space.id), owner, db_session)

    exported = export_v1_backup(space.id, owner, db_session)

    assert exported["version"] == 2
    assert exported["exportFormat"] == "train-with-me-cloud-v2"
    assert exported["appVersion"] == "v2"
    assert exported["sourceApp"] == "train-with-me-cloud"
    assert exported["exportedAt"]
    assert len(exported["workouts"]) == 2
    assert len(exported["plannedSessions"]) == 1
    assert len(exported["phaseTemplates"]) == 1
    assert len(exported["phaseInstances"]) == 1
    assert exported["goals"]["version"] == 2


def test_export_v2_cloud_data_returns_native_shape(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    space = create_space(db_session, owner)
    commit_v1_backup(commit_payload(space.id), owner, db_session)
    upsert_training_goal(
        space.id,
        "run",
        TrainingGoalUpsertRequest(target_json={"distance": 10, "time": "45:00"}, notes="Cloud goal"),
        owner,
        db_session,
    )

    exported = export_v2_cloud_data(space.id, owner, db_session)

    assert exported["version"] == 2
    assert exported["exportFormat"] == "train-with-me-cloud-v2-native"
    assert exported["sourceApp"] == "train-with-me-cloud"
    assert exported["trainingSpace"] == {"id": space.id, "role": "owner"}
    assert len(exported["workouts"]) == 2
    assert len(exported["plannedSessions"]) == 1
    assert len(exported["trainingGoals"]) == 1
    assert len(exported["programTemplates"]) == 1
    assert len(exported["programInstances"]) == 1

    planned_session = exported["plannedSessions"][0]
    program_instance = exported["programInstances"][0]
    assert planned_session["id"] in program_instance["generatedSessionIds"]
    assert planned_session["phaseInstanceId"] == program_instance["id"]
    assert exported["programTemplates"][0]["id"] == program_instance["templateId"]
    assert exported["workouts"][0]["trainingSpaceId"] == space.id
    assert exported["trainingGoals"][0]["target"]


def test_commit_v2_cloud_data_imports_native_export_idempotently(db_session: Session) -> None:
    owner = create_user(db_session, "athlete@example.com")
    source_space = create_space(db_session, owner)
    target_space = create_training_space(TrainingSpaceCreateRequest(name="Imported Season"), owner, db_session)
    commit_v1_backup(commit_payload(source_space.id), owner, db_session)
    upsert_training_goal(
        source_space.id,
        "run",
        TrainingGoalUpsertRequest(target_json={"distance": 10, "time": "45:00"}, notes="Cloud goal"),
        owner,
        db_session,
    )
    exported = export_v2_cloud_data(source_space.id, owner, db_session)

    first = commit_v2_cloud_data(V2ImportCommitRequest(trainingSpaceId=target_space.id, exportData=exported), owner, db_session)
    second = commit_v2_cloud_data(V2ImportCommitRequest(trainingSpaceId=target_space.id, exportData=exported), owner, db_session)

    assert first.imported_workout_count == 2
    assert first.imported_planned_session_count == 1
    assert first.imported_training_goal_count == 1
    assert first.imported_program_template_count == 1
    assert first.imported_program_instance_count == 1
    assert second.imported_workout_count == 0
    assert second.existing_workout_count == 2
    assert second.existing_planned_session_count == 1
    assert second.existing_training_goal_count == 1
    assert second.existing_program_template_count == 1
    assert second.existing_program_instance_count == 1

    target_program_instance = db_session.scalar(select(ProgramInstance).where(ProgramInstance.training_space_id == target_space.id))
    target_planned_session = db_session.scalar(select(PlannedSession).where(PlannedSession.training_space_id == target_space.id))
    assert target_program_instance is not None
    assert target_planned_session is not None
    assert target_planned_session.id in target_program_instance.generated_session_ids
    assert target_planned_session.phase_instance_id == target_program_instance.id
    assert db_session.query(Workout).filter(Workout.training_space_id == target_space.id).count() == 2
    assert db_session.query(TrainingGoal).filter(TrainingGoal.training_space_id == target_space.id).count() == 1
