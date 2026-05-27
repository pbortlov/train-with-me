from fastapi.routing import APIRoute
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth.routes import register_user
from app.auth.schemas import RegisterRequest
from app.db.base import Base
from app.db.models import User
from app.main import app
from app.programs.routes import create_program_template, list_program_templates
from app.programs.schemas import ProgramTemplateCreateRequest
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


def test_create_and_list_program_templates() -> None:
    with db_session() as db:
        user = create_user(db, "athlete@example.com")
        space = create_training_space(TrainingSpaceCreateRequest(name="Base Season"), user, db)

        created = create_program_template(
            space.id,
            ProgramTemplateCreateRequest(
                name="Base strength",
                duration_weeks=4,
                template_json={"weekdaySlots": []},
                notes="Cloud template",
            ),
            user,
            db,
        )
        templates = list_program_templates(space.id, user, db)

        assert created.name == "Base strength"
        assert created.duration_weeks == 4
        assert created.template_json == {"weekdaySlots": []}
        assert created.notes == "Cloud template"
        assert [template.id for template in templates] == [created.id]


def test_program_template_routes_are_registered() -> None:
    route_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }

    assert "/api/training-spaces/{training_space_id}/program-templates" in route_paths
