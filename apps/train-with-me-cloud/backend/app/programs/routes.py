from datetime import date, timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.db.models import PlannedSession, PlannedSessionSource, ProgramInstance, ProgramTemplate, User
from app.db.session import get_db_session
from app.programs.schemas import (
    ProgramInstanceResponse,
    ProgramScheduleRequest,
    ProgramTemplateCreateRequest,
    ProgramTemplateResponse,
)
from app.workouts.routes import require_membership, workouts_error

router = APIRouter()


def program_template_response(template: ProgramTemplate) -> ProgramTemplateResponse:
    return ProgramTemplateResponse(
        id=template.id,
        training_space_id=template.training_space_id,
        name=template.name,
        duration_weeks=template.duration_weeks,
        template_json=template.template_json,
        notes=template.notes,
        created_at=template.created_at,
        updated_at=template.updated_at,
    )


def program_instance_response(instance: ProgramInstance) -> ProgramInstanceResponse:
    return ProgramInstanceResponse(
        id=instance.id,
        training_space_id=instance.training_space_id,
        template_id=instance.template_id,
        template_name=instance.template_name,
        start_date=instance.start_date,
        duration_weeks=instance.duration_weeks,
        generated_session_ids=instance.generated_session_ids,
        created_at=instance.created_at,
    )


def get_template(db: Session, training_space_id: str, template_id: str) -> ProgramTemplate:
    template = db.scalar(
        select(ProgramTemplate).where(
            ProgramTemplate.id == template_id,
            ProgramTemplate.training_space_id == training_space_id,
        ),
    )
    if not template:
        raise workouts_error("program_template_not_found", "Program template was not found.", status.HTTP_404_NOT_FOUND)
    return template


def require_date(value: Any, field_name: str) -> date:
    if not isinstance(value, str) or not value:
        raise workouts_error("invalid_program_template", f"Program template needs {field_name}.", status.HTTP_400_BAD_REQUEST)
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise workouts_error("invalid_program_template", f"Program template {field_name} is invalid.", status.HTTP_400_BAD_REQUEST) from exc


def program_weekday(value: date) -> int:
    return value.isoweekday()


def generated_session_date(start_date: date, week_index: int, weekday: int) -> date:
    start_weekday = program_weekday(start_date)
    slot_offset = (weekday - start_weekday + 7) % 7
    return start_date + timedelta(days=(week_index * 7) + slot_offset)


def template_slots(template: ProgramTemplate) -> list[dict[str, Any]]:
    raw_slots = template.template_json.get("weekdaySlots")
    if not isinstance(raw_slots, list) or not raw_slots:
        raise workouts_error("invalid_program_template", "Program template needs at least one workout slot.", status.HTTP_400_BAD_REQUEST)
    slots: list[dict[str, Any]] = []
    for index, raw_slot in enumerate(raw_slots):
        if not isinstance(raw_slot, dict):
            continue
        weekday = raw_slot.get("weekday")
        title = raw_slot.get("title")
        blocks = raw_slot.get("blocks")
        if not isinstance(weekday, int) or weekday < 1 or weekday > 7:
            raise workouts_error("invalid_program_template", "Program workout slots need weekdays from 1 to 7.", status.HTTP_400_BAD_REQUEST)
        if not isinstance(title, str) or not title.strip():
            raise workouts_error("invalid_program_template", "Program workout slots need titles.", status.HTTP_400_BAD_REQUEST)
        if not isinstance(blocks, list) or not blocks:
            raise workouts_error("invalid_program_template", "Program workout slots need at least one block.", status.HTTP_400_BAD_REQUEST)
        slots.append(
            {
                "id": raw_slot.get("id") if isinstance(raw_slot.get("id"), str) else f"{weekday}-{index}",
                "weekday": weekday,
                "title": title.strip(),
                "notes": raw_slot.get("notes") if isinstance(raw_slot.get("notes"), str) else "",
                "blocks": blocks,
            },
        )
    if not slots:
        raise workouts_error("invalid_program_template", "Program template needs valid workout slots.", status.HTTP_400_BAD_REQUEST)
    return slots


def build_program_sessions(template: ProgramTemplate, instance: ProgramInstance, start_date: date) -> list[PlannedSession]:
    sessions: list[PlannedSession] = []
    for week_index in range(template.duration_weeks):
        for slot in template_slots(template):
            session_date = generated_session_date(start_date, week_index, slot["weekday"])
            sessions.append(
                PlannedSession(
                    training_space_id=template.training_space_id,
                    type="strength",
                    title=slot["title"],
                    date=session_date,
                    phase_template_id=template.id,
                    phase_instance_id=instance.id,
                    phase_slot_id=slot["id"],
                    phase_week_index=week_index,
                    generated_date=session_date,
                    date_moved_manually=False,
                    details_json={"blocks": slot["blocks"], "notes": slot["notes"]},
                    source=PlannedSessionSource.phase_generated.value,
                    coach_editable=True,
                ),
            )
    return sessions


@router.post("", status_code=status.HTTP_201_CREATED)
def create_program_template(
    training_space_id: str,
    payload: ProgramTemplateCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> ProgramTemplateResponse:
    require_membership(db, training_space_id, current_user.id)
    template = ProgramTemplate(
        training_space_id=training_space_id,
        name=payload.name,
        duration_weeks=payload.duration_weeks,
        template_json=payload.template_json,
        notes=payload.notes,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return program_template_response(template)


@router.get("")
def list_program_templates(
    training_space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[ProgramTemplateResponse]:
    require_membership(db, training_space_id, current_user.id)
    templates = db.scalars(
        select(ProgramTemplate)
        .where(ProgramTemplate.training_space_id == training_space_id)
        .order_by(ProgramTemplate.created_at.desc(), ProgramTemplate.id),
    ).all()
    return [program_template_response(template) for template in templates]


@router.get("/instances")
def list_program_instances(
    training_space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[ProgramInstanceResponse]:
    require_membership(db, training_space_id, current_user.id)
    instances = db.scalars(
        select(ProgramInstance)
        .where(ProgramInstance.training_space_id == training_space_id)
        .order_by(ProgramInstance.created_at.desc(), ProgramInstance.id),
    ).all()
    return [program_instance_response(instance) for instance in instances]


@router.post("/{template_id}/schedule", status_code=status.HTTP_201_CREATED)
def schedule_program_template(
    training_space_id: str,
    template_id: str,
    payload: ProgramScheduleRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> ProgramInstanceResponse:
    require_membership(db, training_space_id, current_user.id)
    template = get_template(db, training_space_id, template_id)
    start_date = payload.start_date or require_date(template.template_json.get("startDate"), "start date")
    instance = ProgramInstance(
        training_space_id=training_space_id,
        template_id=template.id,
        template_name=template.name,
        start_date=start_date,
        duration_weeks=template.duration_weeks,
        generated_session_ids=[],
    )
    db.add(instance)
    db.flush()

    sessions = build_program_sessions(template, instance, start_date)
    for session in sessions:
        db.add(session)
    db.flush()
    instance.generated_session_ids = [session.id for session in sessions]

    db.commit()
    db.refresh(instance)
    return program_instance_response(instance)


@router.delete("/instances/{instance_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_program_instance(
    training_space_id: str,
    instance_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> None:
    require_membership(db, training_space_id, current_user.id)
    instance = db.scalar(
        select(ProgramInstance).where(
            ProgramInstance.id == instance_id,
            ProgramInstance.training_space_id == training_space_id,
        ),
    )
    if not instance:
        raise workouts_error("program_instance_not_found", "Scheduled program was not found.", status.HTTP_404_NOT_FOUND)

    planned_sessions = db.scalars(
        select(PlannedSession).where(
            PlannedSession.training_space_id == training_space_id,
            PlannedSession.phase_instance_id == instance.id,
            PlannedSession.status == "planned",
        ),
    ).all()
    for session in planned_sessions:
        db.delete(session)
    db.delete(instance)
    db.commit()
