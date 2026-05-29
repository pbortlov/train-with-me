from fastapi.routing import APIRoute
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth.routes import register_user
from app.auth.schemas import RegisterRequest
from app.db.base import Base
from app.db.models import PlannedSession, User
from app.main import app
from app.programs.routes import (
    create_program_template,
    list_program_instances,
    list_program_templates,
    remove_program_instance,
    schedule_program_template,
    update_program_template,
)
from app.programs.schemas import ProgramScheduleRequest, ProgramTemplateCreateRequest, ProgramTemplateUpdateRequest
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


def test_schedule_and_remove_program_template_generates_strength_sessions() -> None:
    with db_session() as db:
        user = create_user(db, "athlete@example.com")
        space = create_training_space(TrainingSpaceCreateRequest(name="Base Season"), user, db)
        template = create_program_template(
            space.id,
            ProgramTemplateCreateRequest(
                name="Base strength",
                duration_weeks=2,
                template_json={
                    "startDate": "2026-06-01",
                    "weekdaySlots": [
                        {
                            "id": "slot-a",
                            "weekday": 1,
                            "title": "Strength A",
                            "notes": "Main day",
                            "blocks": [
                                {
                                    "id": "block-a",
                                    "label": "Squat",
                                    "sets": "3",
                                    "exercises": [
                                        {"code": "E1", "name": "Back squat", "reps": "5", "notes": "", "weight": 80},
                                    ],
                                },
                            ],
                        },
                    ],
                },
                notes="Cloud template",
            ),
            user,
            db,
        )

        instance = schedule_program_template(space.id, template.id, ProgramScheduleRequest(), user, db)
        sessions = db.query(PlannedSession).filter(PlannedSession.phase_instance_id == instance.id).order_by(PlannedSession.date).all()

        assert instance.template_id == template.id
        assert instance.generated_session_ids == [session.id for session in sessions]
        assert [session.date.isoformat() for session in sessions] == ["2026-06-01", "2026-06-08"]
        assert sessions[0].source == "phase-generated"
        assert sessions[0].details_json["blocks"][0]["exercises"][0]["name"] == "Back squat"
        assert list_program_instances(space.id, user, db)[0].id == instance.id

        remove_program_instance(space.id, instance.id, user, db)

        assert list_program_instances(space.id, user, db) == []
        assert db.query(PlannedSession).filter(PlannedSession.phase_instance_id == instance.id).count() == 0


def test_update_program_template_changes_future_schedules_only() -> None:
    with db_session() as db:
        user = create_user(db, "athlete@example.com")
        space = create_training_space(TrainingSpaceCreateRequest(name="Base Season"), user, db)
        template = create_program_template(
            space.id,
            ProgramTemplateCreateRequest(
                name="Base strength",
                duration_weeks=1,
                template_json={
                    "startDate": "2026-06-01",
                    "weekdaySlots": [
                        {
                            "id": "slot-a",
                            "weekday": 1,
                            "title": "Strength A",
                            "blocks": [
                                {
                                    "id": "block-a",
                                    "label": "Squat",
                                    "sets": "3",
                                    "exercises": [{"code": "E1", "name": "Back squat", "reps": "5"}],
                                },
                            ],
                        },
                    ],
                },
            ),
            user,
            db,
        )
        first_instance = schedule_program_template(space.id, template.id, ProgramScheduleRequest(), user, db)

        updated = update_program_template(
            space.id,
            template.id,
            ProgramTemplateUpdateRequest(
                name="Edited strength",
                duration_weeks=1,
                template_json={
                    "startDate": "2026-06-01",
                    "weekdaySlots": [
                        {
                            "id": "slot-a",
                            "weekday": 1,
                            "title": "Strength A",
                            "blocks": [
                                {
                                    "id": "block-a",
                                    "label": "Squat",
                                    "sets": "4",
                                    "exercises": [{"code": "E1", "name": "Front squat", "reps": "6"}],
                                },
                            ],
                        },
                    ],
                },
                notes="Edited",
            ),
            user,
            db,
        )
        second_instance = schedule_program_template(space.id, template.id, ProgramScheduleRequest(), user, db)
        first_session = db.query(PlannedSession).filter(PlannedSession.phase_instance_id == first_instance.id).one()
        second_session = db.query(PlannedSession).filter(PlannedSession.phase_instance_id == second_instance.id).one()

        assert updated.name == "Edited strength"
        assert first_session.details_json["blocks"][0]["exercises"][0]["name"] == "Back squat"
        assert second_session.details_json["blocks"][0]["exercises"][0]["name"] == "Front squat"


def test_program_template_routes_are_registered() -> None:
    route_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }

    assert "/api/training-spaces/{training_space_id}/program-templates" in route_paths
    assert "/api/training-spaces/{training_space_id}/program-templates/instances" in route_paths
    assert "/api/training-spaces/{training_space_id}/program-templates/{template_id}/schedule" in route_paths
