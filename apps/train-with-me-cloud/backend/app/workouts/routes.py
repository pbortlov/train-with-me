from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.db.models import (
    PlannedSession,
    SprintSet,
    TrainingSpaceMembership,
    TrainingSpaceRole,
    User,
    Workout,
    WorkoutActivity,
    WorkoutSet,
    WorkoutSource,
    WorkoutStrengthExercise,
)
from app.db.session import get_db_session
from app.spaces.routes import get_membership
from app.workouts.schemas import (
    SprintSetResponse,
    StrengthExerciseResponse,
    WorkoutCreateRequest,
    WorkoutResponse,
    WorkoutSetResponse,
    WorkoutUpdateRequest,
)

router = APIRouter()


def workouts_error(code: str, message: str, status_code: int) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"error": {"code": code, "message": message}},
    )


def require_membership(db: Session, training_space_id: str, user_id: str) -> TrainingSpaceMembership:
    membership = get_membership(db, training_space_id, user_id)
    if not membership:
        raise workouts_error("training_space_not_found", "Training space was not found.", status.HTTP_404_NOT_FOUND)
    return membership


def get_visible_workout(db: Session, training_space_id: str, workout_id: str, user_id: str) -> tuple[Workout, TrainingSpaceMembership]:
    membership = require_membership(db, training_space_id, user_id)
    workout = db.scalar(
        select(Workout).where(
            Workout.id == workout_id,
            Workout.training_space_id == training_space_id,
        ),
    )
    if not workout:
        raise workouts_error("workout_not_found", "Workout was not found.", status.HTTP_404_NOT_FOUND)
    return workout, membership


def workout_response(workout: Workout) -> WorkoutResponse:
    return WorkoutResponse(
        id=workout.id,
        training_space_id=workout.training_space_id,
        activity=workout.activity,
        date=workout.date,
        distance=workout.distance,
        time=workout.time,
        pace=workout.pace,
        sprint_feeling=workout.sprint_feeling,
        sprint_sets=[
            SprintSetResponse(order=sprint_set.order, distance_m=sprint_set.distance_m, time_sec=sprint_set.time_sec)
            for sprint_set in sorted(workout.sprint_sets, key=lambda item: item.order)
        ],
        strength_exercises=[
            StrengthExerciseResponse(
                order=exercise.order,
                name=exercise.name,
                sets=[
                    WorkoutSetResponse(
                        order=workout_set.order,
                        reps=workout_set.reps,
                        weight=workout_set.weight,
                        load_type=workout_set.load_type,
                        band_color=workout_set.band_color,
                    )
                    for workout_set in sorted(exercise.sets, key=lambda item: item.order)
                ],
            )
            for exercise in sorted(workout.strength_exercises, key=lambda item: item.order)
        ],
        notes=workout.notes,
        source=workout.source,
        coach_editable=workout.coach_editable,
        original_v1_id=workout.original_v1_id,
        created_at=workout.created_at,
    )


def build_workout(training_space_id: str, payload: WorkoutCreateRequest) -> Workout:
    workout = Workout(
        training_space_id=training_space_id,
        activity=payload.activity,
        date=payload.date,
        distance=payload.distance,
        time=payload.time,
        pace=payload.pace,
        sprint_feeling=payload.sprint_feeling,
        notes=payload.notes,
        source=WorkoutSource.manual.value,
        coach_editable=True,
    )

    if payload.activity == WorkoutActivity.strength.value:
        workout.strength_exercises = [
            WorkoutStrengthExercise(
                order=exercise_index + 1,
                name=exercise.name,
                sets=[
                    WorkoutSet(
                        order=set_index + 1,
                        reps=workout_set.reps,
                        weight=workout_set.weight,
                        load_type=workout_set.load_type,
                        band_color=workout_set.band_color,
                    )
                    for set_index, workout_set in enumerate(exercise.sets)
                ],
            )
            for exercise_index, exercise in enumerate(payload.strength_exercises)
        ]

    if payload.activity == WorkoutActivity.sprint.value:
        workout.sprint_sets = [
            SprintSet(order=index + 1, distance_m=sprint_set.distance_m, time_sec=sprint_set.time_sec)
            for index, sprint_set in enumerate(payload.sprint_sets)
        ]

    return workout


@router.post("", status_code=status.HTTP_201_CREATED)
def create_workout(
    training_space_id: str,
    payload: WorkoutCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> WorkoutResponse:
    require_membership(db, training_space_id, current_user.id)
    workout = build_workout(training_space_id, payload)
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout_response(workout)


@router.get("")
def list_workouts(
    training_space_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[WorkoutResponse]:
    require_membership(db, training_space_id, current_user.id)
    workouts = db.scalars(
        select(Workout)
        .where(Workout.training_space_id == training_space_id)
        .order_by(Workout.date.desc(), Workout.created_at.desc(), Workout.id),
    ).all()
    return [workout_response(workout) for workout in workouts]


@router.patch("/{workout_id}")
def update_workout(
    training_space_id: str,
    workout_id: str,
    payload: WorkoutUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> WorkoutResponse:
    workout, membership = get_visible_workout(db, training_space_id, workout_id, current_user.id)
    if (
        membership.role == TrainingSpaceRole.coach.value
        and workout.source == WorkoutSource.v1_import.value
        and not workout.coach_editable
    ):
        raise workouts_error(
            "workout_not_editable",
            "Imported historical workout cannot be edited by a coach.",
            status.HTTP_403_FORBIDDEN,
        )

    workout.notes = payload.notes
    db.commit()
    db.refresh(workout)
    return workout_response(workout)


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(
    training_space_id: str,
    workout_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> None:
    workout, membership = get_visible_workout(db, training_space_id, workout_id, current_user.id)
    if (
        membership.role == TrainingSpaceRole.coach.value
        and workout.source == WorkoutSource.v1_import.value
        and not workout.coach_editable
    ):
        raise workouts_error(
            "workout_not_editable",
            "Imported historical workout cannot be deleted by a coach.",
            status.HTTP_403_FORBIDDEN,
        )

    linked_sessions = db.scalars(
        select(PlannedSession).where(
            PlannedSession.training_space_id == training_space_id,
            PlannedSession.linked_workout_id == workout_id,
        ),
    ).all()
    for session in linked_sessions:
        session.linked_workout_id = None
        session.actual_json = None
        session.status = "planned"

    db.delete(workout)
    db.commit()
