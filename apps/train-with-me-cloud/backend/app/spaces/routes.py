from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.db.models import TrainingSpace, TrainingSpaceMembership, TrainingSpaceRole, User
from app.db.session import get_db_session
from app.spaces.schemas import TrainingSpaceCreateRequest, TrainingSpaceResponse

router = APIRouter()


def spaces_error(code: str, message: str, status_code: int) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"error": {"code": code, "message": message}},
    )


def training_space_response(training_space: TrainingSpace, role: str) -> TrainingSpaceResponse:
    return TrainingSpaceResponse(
        id=training_space.id,
        name=training_space.name,
        owner_user_id=training_space.owner_user_id,
        my_role=role,
    )


def get_membership(db: Session, training_space_id: str, user_id: str) -> TrainingSpaceMembership | None:
    return db.scalar(
        select(TrainingSpaceMembership).where(
            TrainingSpaceMembership.training_space_id == training_space_id,
            TrainingSpaceMembership.user_id == user_id,
        ),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_training_space(
    payload: TrainingSpaceCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> TrainingSpaceResponse:
    training_space = TrainingSpace(name=payload.name, owner=current_user)
    membership = TrainingSpaceMembership(
        training_space=training_space,
        user=current_user,
        role=TrainingSpaceRole.owner.value,
    )
    db.add_all([training_space, membership])
    db.commit()
    db.refresh(training_space)

    return training_space_response(training_space, TrainingSpaceRole.owner.value)


@router.get("")
def list_my_training_spaces(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[TrainingSpaceResponse]:
    memberships = db.scalars(
        select(TrainingSpaceMembership)
        .where(TrainingSpaceMembership.user_id == current_user.id)
        .order_by(TrainingSpaceMembership.created_at, TrainingSpaceMembership.id),
    ).all()

    return [
        training_space_response(membership.training_space, membership.role)
        for membership in memberships
    ]


@router.get("/{training_space_id}")
def read_training_space(
    training_space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> TrainingSpaceResponse:
    membership = get_membership(db, training_space_id, current_user.id)
    if not membership:
        raise spaces_error("training_space_not_found", "Training space was not found.", status.HTTP_404_NOT_FOUND)

    return training_space_response(membership.training_space, membership.role)
