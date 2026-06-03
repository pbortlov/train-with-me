from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.db.models import (
    AuditEvent,
    CoachSuggestion,
    CoachSuggestionStatus,
    TrainingSpaceMembership,
    TrainingSpaceRole,
    User,
    Workout,
    utc_now,
)
from app.db.session import get_db_session
from app.spaces.routes import get_membership
from app.suggestions.schemas import CoachSuggestionCreateRequest, CoachSuggestionResponse

router = APIRouter()


def suggestion_error(code: str, message: str, status_code: int) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"error": {"code": code, "message": message}},
    )


def require_owner(db: Session, training_space_id: str, user_id: str) -> TrainingSpaceMembership:
    membership = get_membership(db, training_space_id, user_id)
    if not membership or membership.role != TrainingSpaceRole.owner.value:
        raise suggestion_error("training_space_not_found", "Training space was not found.", status.HTTP_404_NOT_FOUND)
    return membership


def require_coach(db: Session, training_space_id: str, user_id: str) -> TrainingSpaceMembership:
    membership = get_membership(db, training_space_id, user_id)
    if not membership or membership.role != TrainingSpaceRole.coach.value:
        raise suggestion_error("coach_permission_required", "Coach membership is required.", status.HTTP_403_FORBIDDEN)
    return membership


def suggestion_response(suggestion: CoachSuggestion) -> CoachSuggestionResponse:
    return CoachSuggestionResponse(
        id=suggestion.id,
        training_space_id=suggestion.training_space_id,
        target_entity_type=suggestion.target_entity_type,
        target_entity_id=suggestion.target_entity_id,
        suggested_change_json=suggestion.suggested_change_json,
        status=suggestion.status,
        created_by_user_id=suggestion.created_by_user_id,
        resolved_by_user_id=suggestion.resolved_by_user_id,
        resolved_at=suggestion.resolved_at,
        created_at=suggestion.created_at,
    )


def get_pending_suggestion(db: Session, training_space_id: str, suggestion_id: str) -> CoachSuggestion:
    suggestion = db.scalar(
        select(CoachSuggestion).where(
            CoachSuggestion.id == suggestion_id,
            CoachSuggestion.training_space_id == training_space_id,
        ),
    )
    if not suggestion:
        raise suggestion_error("coach_suggestion_not_found", "Coach suggestion was not found.", status.HTTP_404_NOT_FOUND)
    if suggestion.status != CoachSuggestionStatus.pending.value:
        raise suggestion_error("coach_suggestion_resolved", "Coach suggestion is already resolved.", status.HTTP_409_CONFLICT)
    return suggestion


def validate_target(db: Session, training_space_id: str, target_entity_type: str, target_entity_id: str) -> None:
    if target_entity_type != "workout":
        raise suggestion_error("unsupported_target", "Suggestion target is unsupported.", status.HTTP_400_BAD_REQUEST)
    workout_exists = db.scalar(
        select(Workout.id).where(
            Workout.id == target_entity_id,
            Workout.training_space_id == training_space_id,
        ),
    )
    if not workout_exists:
        raise suggestion_error("workout_not_found", "Workout was not found.", status.HTTP_404_NOT_FOUND)


def apply_suggestion(db: Session, suggestion: CoachSuggestion) -> None:
    if suggestion.target_entity_type != "workout":
        raise suggestion_error("unsupported_target", "Suggestion target is unsupported.", status.HTTP_400_BAD_REQUEST)
    workout = db.get(Workout, suggestion.target_entity_id)
    if not workout or workout.training_space_id != suggestion.training_space_id:
        raise suggestion_error("workout_not_found", "Workout was not found.", status.HTTP_404_NOT_FOUND)
    if "notes" in suggestion.suggested_change_json:
        workout.notes = str(suggestion.suggested_change_json["notes"])


def add_audit_event(db: Session, suggestion: CoachSuggestion, actor: User, event_type: str) -> None:
    db.add(
        AuditEvent(
            training_space_id=suggestion.training_space_id,
            actor_user_id=actor.id,
            event_type=event_type,
            entity_type="coach_suggestion",
            entity_id=suggestion.id,
            metadata_json={
                "target_entity_type": suggestion.target_entity_type,
                "target_entity_id": suggestion.target_entity_id,
            },
        ),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_coach_suggestion(
    training_space_id: str,
    payload: CoachSuggestionCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CoachSuggestionResponse:
    require_coach(db, training_space_id, current_user.id)
    validate_target(db, training_space_id, payload.target_entity_type, payload.target_entity_id)
    suggestion = CoachSuggestion(
        training_space_id=training_space_id,
        target_entity_type=payload.target_entity_type,
        target_entity_id=payload.target_entity_id,
        suggested_change_json=payload.suggested_change_json,
        created_by_user_id=current_user.id,
    )
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return suggestion_response(suggestion)


@router.get("")
def list_coach_suggestions(
    training_space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[CoachSuggestionResponse]:
    require_owner(db, training_space_id, current_user.id)
    suggestions = db.scalars(
        select(CoachSuggestion)
        .where(CoachSuggestion.training_space_id == training_space_id)
        .order_by(CoachSuggestion.created_at, CoachSuggestion.id),
    ).all()
    return [suggestion_response(suggestion) for suggestion in suggestions]


@router.post("/{suggestion_id}/accept")
def accept_coach_suggestion(
    training_space_id: str,
    suggestion_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CoachSuggestionResponse:
    require_owner(db, training_space_id, current_user.id)
    suggestion = get_pending_suggestion(db, training_space_id, suggestion_id)
    apply_suggestion(db, suggestion)
    suggestion.status = CoachSuggestionStatus.accepted.value
    suggestion.resolved_by_user_id = current_user.id
    suggestion.resolved_at = utc_now()
    add_audit_event(db, suggestion, current_user, "coach_suggestion.accepted")
    db.commit()
    db.refresh(suggestion)
    return suggestion_response(suggestion)


@router.post("/{suggestion_id}/reject")
def reject_coach_suggestion(
    training_space_id: str,
    suggestion_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CoachSuggestionResponse:
    require_owner(db, training_space_id, current_user.id)
    suggestion = get_pending_suggestion(db, training_space_id, suggestion_id)
    suggestion.status = CoachSuggestionStatus.rejected.value
    suggestion.resolved_by_user_id = current_user.id
    suggestion.resolved_at = utc_now()
    add_audit_event(db, suggestion, current_user, "coach_suggestion.rejected")
    db.commit()
    db.refresh(suggestion)
    return suggestion_response(suggestion)
