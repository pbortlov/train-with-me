from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.models import TrainingSpace, TrainingSpaceMembership, TrainingSpaceRole, User


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
