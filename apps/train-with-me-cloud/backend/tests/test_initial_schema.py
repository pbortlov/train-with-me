from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.models import ImportedV1Metadata, ProgramTemplate, TrainingGoal, TrainingSpace, TrainingSpaceMembership, TrainingSpaceRole, User


def alembic_config(database_url: str) -> Config:
    config = Config("alembic.ini")
    config.set_main_option("sqlalchemy.url", database_url)
    return config


def test_initial_migration_applies_cleanly(tmp_path: Path) -> None:
    database_path = tmp_path / "migration.db"
    database_url = f"sqlite:///{database_path}"

    command.upgrade(alembic_config(database_url), "head")

    engine = create_engine(database_url)
    inspector = inspect(engine)

    assert set(inspector.get_table_names()) >= {
        "alembic_version",
        "users",
        "training_spaces",
        "training_space_memberships",
        "coach_invites",
        "workouts",
        "workout_strength_exercises",
        "workout_sets",
        "sprint_sets",
        "planned_sessions",
        "coach_suggestions",
        "audit_events",
        "imported_v1_metadata",
        "training_goals",
        "program_templates",
    }


def test_basic_user_training_space_model_creation() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        user = User(
            email="athlete@example.com",
            password_hash="not-a-real-hash-yet",
            display_name="Athlete",
        )
        training_space = TrainingSpace(name="Base Season", owner=user)
        membership = TrainingSpaceMembership(
            training_space=training_space,
            user=user,
            role=TrainingSpaceRole.owner.value,
        )

        session.add_all([user, training_space, membership])
        session.commit()

        saved_user = session.query(User).filter_by(email="athlete@example.com").one()

        assert saved_user.display_name == "Athlete"
        assert saved_user.owned_training_spaces[0].name == "Base Season"
        assert saved_user.memberships[0].role == TrainingSpaceRole.owner.value


def test_imported_v1_metadata_model_creation() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        user = User(
            email="athlete@example.com",
            password_hash="not-a-real-hash-yet",
            display_name="Athlete",
        )
        training_space = TrainingSpace(name="Base Season", owner=user)
        metadata = ImportedV1Metadata(
            training_space=training_space,
            entity_type="phase_template",
            original_v1_id="phase-template-1",
            payload_json={"name": "Phase 1"},
        )

        session.add_all([user, training_space, metadata])
        session.commit()

        saved_metadata = session.query(ImportedV1Metadata).filter_by(original_v1_id="phase-template-1").one()

        assert saved_metadata.payload_json == {"name": "Phase 1"}
        assert saved_metadata.source == "v1_import"
        assert saved_metadata.coach_editable is False


def test_training_goal_model_creation() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        user = User(
            email="athlete@example.com",
            password_hash="not-a-real-hash-yet",
            display_name="Athlete",
        )
        training_space = TrainingSpace(name="Base Season", owner=user)
        goal = TrainingGoal(
            training_space=training_space,
            activity="run",
            target_json={"distance": 5, "time": "22:00"},
            notes="Race target",
        )

        session.add_all([user, training_space, goal])
        session.commit()

        saved_goal = session.query(TrainingGoal).filter_by(activity="run").one()

        assert saved_goal.target_json == {"distance": 5, "time": "22:00"}
        assert saved_goal.notes == "Race target"


def test_program_template_model_creation() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        user = User(
            email="athlete@example.com",
            password_hash="not-a-real-hash-yet",
            display_name="Athlete",
        )
        training_space = TrainingSpace(name="Base Season", owner=user)
        template = ProgramTemplate(
            training_space=training_space,
            name="Base strength",
            duration_weeks=4,
            template_json={"weekdaySlots": []},
            notes="Cloud template",
        )

        session.add_all([user, training_space, template])
        session.commit()

        saved_template = session.query(ProgramTemplate).filter_by(name="Base strength").one()

        assert saved_template.duration_weeks == 4
        assert saved_template.template_json == {"weekdaySlots": []}
        assert saved_template.notes == "Cloud template"
