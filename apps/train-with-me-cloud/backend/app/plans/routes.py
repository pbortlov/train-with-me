from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.db.models import PlannedSession, User, Workout
from app.db.session import get_db_session
from app.workouts.routes import workouts_error
from app.plans.schemas import PlannedSessionCreateRequest, PlannedSessionResponse

router = APIRouter()


def planned_session_response(session: PlannedSession) -> PlannedSessionResponse:
    return PlannedSessionResponse(
        id=session.id,
        training_space_id=session.training_space_id,
        type=session.type,
        title=session.title,
        date=session.date,
        phase_template_id=session.phase_template_id,
        phase_instance_id=session.phase_instance_id,
        phase_slot_id=session.phase_slot_id,
        phase_week_index=session.phase_week_index,
        generated_date=session.generated_date,
        date_moved_manually=session.date_moved_manually,
        modification_note=session.modification_note,
        actual_json=session.actual_json,
        details_json=session.details_json,
        linked_workout_id=session.linked_workout_id,
        status=session.status,
        source=session.source,
        coach_editable=session.coach_editable,
        original_v1_id=session.original_v1_id,
        created_at=session.created_at,
    )


def validate_linked_workout(db: Session, training_space_id: str, workout_id: str | None) -> None:
    if not workout_id:
        return
    exists = db.scalar(
        select(Workout.id).where(
            Workout.id == workout_id,
            Workout.training_space_id == training_space_id,
        ),
    )
    if not exists:
        raise workouts_error("workout_not_found", "Workout was not found.", status.HTTP_404_NOT_FOUND)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_planned_session(
    training_space_id: str,
    payload: PlannedSessionCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> PlannedSessionResponse:
    from app.workouts.routes import require_membership

    require_membership(db, training_space_id, current_user.id)
    validate_linked_workout(db, training_space_id, payload.linked_workout_id)

    planned_session = PlannedSession(
        training_space_id=training_space_id,
        type=payload.type,
        title=payload.title,
        date=payload.date,
        phase_template_id=payload.phase_template_id,
        phase_instance_id=payload.phase_instance_id,
        phase_slot_id=payload.phase_slot_id,
        phase_week_index=payload.phase_week_index,
        generated_date=payload.generated_date,
        date_moved_manually=payload.date_moved_manually,
        modification_note=payload.modification_note,
        actual_json=payload.actual_json,
        details_json=payload.details_json,
        linked_workout_id=payload.linked_workout_id,
        status=payload.status,
        source=payload.source,
        coach_editable=payload.coach_editable,
        original_v1_id=payload.original_v1_id,
    )
    db.add(planned_session)
    db.commit()
    db.refresh(planned_session)
    return planned_session_response(planned_session)


@router.get("")
def list_planned_sessions(
    training_space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[PlannedSessionResponse]:
    from app.workouts.routes import require_membership

    require_membership(db, training_space_id, current_user.id)
    sessions = db.scalars(
        select(PlannedSession)
        .where(PlannedSession.training_space_id == training_space_id)
        .order_by(PlannedSession.date, PlannedSession.created_at, PlannedSession.id),
    ).all()
    return [planned_session_response(session) for session in sessions]
