from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.db.models import ProgramTemplate, User
from app.db.session import get_db_session
from app.programs.schemas import ProgramTemplateCreateRequest, ProgramTemplateResponse
from app.workouts.routes import require_membership

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
