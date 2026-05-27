from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.db.models import TrainingGoal, TrainingGoalActivity, User
from app.db.session import get_db_session
from app.goals.schemas import GoalActivity, TrainingGoalResponse, TrainingGoalUpsertRequest
from app.workouts.routes import require_membership

router = APIRouter()


def goals_error(code: str, message: str, status_code: int) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"error": {"code": code, "message": message}},
    )


def goal_response(goal: TrainingGoal) -> TrainingGoalResponse:
    return TrainingGoalResponse(
        id=goal.id,
        training_space_id=goal.training_space_id,
        activity=goal.activity,
        target_json=goal.target_json,
        notes=goal.notes,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
    )


@router.get("")
def list_training_goals(
    training_space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[TrainingGoalResponse]:
    require_membership(db, training_space_id, current_user.id)
    goals = db.scalars(
        select(TrainingGoal)
        .where(TrainingGoal.training_space_id == training_space_id)
        .order_by(TrainingGoal.activity, TrainingGoal.created_at),
    ).all()
    return [goal_response(goal) for goal in goals]


@router.put("/{activity}")
def upsert_training_goal(
    training_space_id: str,
    activity: GoalActivity,
    payload: TrainingGoalUpsertRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> TrainingGoalResponse:
    require_membership(db, training_space_id, current_user.id)
    if activity not in {item.value for item in TrainingGoalActivity}:
        raise goals_error("invalid_goal_activity", "Goal activity is not supported.", status.HTTP_400_BAD_REQUEST)

    goal = db.scalar(
        select(TrainingGoal).where(
            TrainingGoal.training_space_id == training_space_id,
            TrainingGoal.activity == activity,
        ),
    )
    if goal is None:
        goal = TrainingGoal(
            training_space_id=training_space_id,
            activity=activity,
            target_json=payload.target_json,
            notes=payload.notes,
        )
        db.add(goal)
    else:
        goal.target_json = payload.target_json
        goal.notes = payload.notes

    db.commit()
    db.refresh(goal)
    return goal_response(goal)
