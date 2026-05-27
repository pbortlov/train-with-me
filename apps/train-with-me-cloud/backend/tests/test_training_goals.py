from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from fastapi.routing import APIRoute

from app.auth.routes import register_user
from app.auth.schemas import RegisterRequest
from app.db.base import Base
from app.db.models import User
from app.goals.routes import list_training_goals, upsert_training_goal
from app.goals.schemas import TrainingGoalUpsertRequest
from app.main import app
from app.spaces.routes import create_training_space
from app.spaces.schemas import TrainingSpaceCreateRequest


def db_session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return Session(engine)


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


def test_upsert_training_goal_creates_and_updates() -> None:
    with db_session() as db:
        user = create_user(db, "athlete@example.com")
        space = create_training_space(TrainingSpaceCreateRequest(name="Base Season"), user, db)

        created = upsert_training_goal(
            space.id,
            "run",
            TrainingGoalUpsertRequest(target_json={"distance": 5, "time": "22:00"}, notes="First target"),
            user,
            db,
        )
        updated = upsert_training_goal(
            space.id,
            "run",
            TrainingGoalUpsertRequest(target_json={"distance": 10, "time": "45:00"}, notes="Updated target"),
            user,
            db,
        )
        goals = list_training_goals(space.id, user, db)

        assert created.id == updated.id
        assert updated.target_json == {"distance": 10, "time": "45:00"}
        assert updated.notes == "Updated target"
        assert len(goals) == 1


def test_training_goal_routes_are_registered() -> None:
    route_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }

    assert "/api/training-spaces/{training_space_id}/goals" in route_paths
    assert "/api/training-spaces/{training_space_id}/goals/{activity}" in route_paths
