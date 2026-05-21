from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.coach_invites.schemas import CoachInviteAcceptResponse, CoachInviteResponse
from app.db.models import CoachInvite, TrainingSpaceMembership, TrainingSpaceRole, User, utc_now
from app.db.session import get_db_session
from app.spaces.routes import get_membership

router = APIRouter()


def invite_error(code: str, message: str, status_code: int) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"error": {"code": code, "message": message}},
    )


def coach_invite_response(invite: CoachInvite) -> CoachInviteResponse:
    return CoachInviteResponse(
        token=invite.token,
        training_space_id=invite.training_space_id,
        training_space_name=invite.training_space.name,
        expires_at=invite.expires_at,
        accepted_at=invite.accepted_at,
    )


def as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def get_valid_invite(token: str, db: Session) -> CoachInvite:
    invite = db.scalar(select(CoachInvite).where(CoachInvite.token == token))
    if not invite:
        raise invite_error("coach_invite_not_found", "Coach invite was not found.", status.HTTP_404_NOT_FOUND)
    if invite.accepted_at:
        raise invite_error("coach_invite_already_accepted", "Coach invite has already been accepted.", status.HTTP_409_CONFLICT)
    if as_utc(invite.expires_at) <= utc_now():
        raise invite_error("coach_invite_expired", "Coach invite has expired.", status.HTTP_410_GONE)
    return invite


@router.post(
    "/training-spaces/{training_space_id}/coach-invites",
    status_code=status.HTTP_201_CREATED,
)
def create_coach_invite(
    training_space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CoachInviteResponse:
    membership = get_membership(db, training_space_id, current_user.id)
    if not membership or membership.role != TrainingSpaceRole.owner.value:
        raise invite_error("training_space_not_found", "Training space was not found.", status.HTTP_404_NOT_FOUND)

    invite = CoachInvite(
        training_space=membership.training_space,
        token=token_urlsafe(32),
        created_by=current_user,
        expires_at=utc_now() + timedelta(days=14),
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    return coach_invite_response(invite)


@router.get("/coach-invites/{token}")
def read_coach_invite(token: str, db: Annotated[Session, Depends(get_db_session)]) -> CoachInviteResponse:
    return coach_invite_response(get_valid_invite(token, db))


@router.post("/coach-invites/{token}/accept")
def accept_coach_invite(
    token: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CoachInviteAcceptResponse:
    invite = get_valid_invite(token, db)
    membership = get_membership(db, invite.training_space_id, current_user.id)
    if membership:
        membership.role = TrainingSpaceRole.coach.value if membership.role != TrainingSpaceRole.owner.value else membership.role
    else:
        membership = TrainingSpaceMembership(
            training_space=invite.training_space,
            user=current_user,
            role=TrainingSpaceRole.coach.value,
        )
        db.add(membership)

    invite.accepted_by = current_user
    invite.accepted_at = utc_now()
    db.commit()
    db.refresh(invite)

    return CoachInviteAcceptResponse(
        training_space_id=invite.training_space_id,
        training_space_name=invite.training_space.name,
        role=membership.role,
    )
