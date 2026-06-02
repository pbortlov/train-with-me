from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import PlannedSession, PlannedSessionSource, PlannedSessionStatus, Workout, WorkoutActivity, WorkoutSource
from app.imports.v1_workout_importer import parse_created_at, parse_date
from app.workouts.routes import strength_workout_meets_plan, workout_actual_json

SUPPORTED_SESSION_TYPES = {"run", "sprint", "strength"}
SUPPORTED_STATUSES = {"planned", "completed", "modified", "missed"}


def import_v1_planned_sessions(db: Session, training_space_id: str, backup: dict[str, Any]) -> tuple[int, int, int, list[str]]:
    raw_sessions = backup.get("plannedSessions")
    if raw_sessions is None:
        return 0, 0, 0, []
    if not isinstance(raw_sessions, list):
        return 0, 0, 0, ["Backup plannedSessions is not an array; skipped planned session import."]

    imported_count = 0
    skipped_count = 0
    existing_count = 0
    warnings: list[str] = []
    workout_id_map = imported_workout_id_map(db, training_space_id)

    for index, raw_session in enumerate(raw_sessions):
        planned_session, session_warnings = build_imported_planned_session(
            training_space_id,
            raw_session,
            index,
            workout_id_map,
        )
        warnings.extend(session_warnings)
        if planned_session is None:
            skipped_count += 1
            continue

        exists = db.scalar(
            select(PlannedSession.id).where(
                PlannedSession.training_space_id == training_space_id,
                PlannedSession.original_v1_id == planned_session.original_v1_id,
            ),
        )
        if exists:
            existing_count += 1
            continue

        db.add(planned_session)
        imported_count += 1

    db.commit()
    return imported_count, skipped_count, existing_count, warnings


def consolidate_v1_planned_sessions_with_workouts(db: Session, training_space_id: str) -> int:
    planned_sessions = db.scalars(
        select(PlannedSession)
        .where(PlannedSession.training_space_id == training_space_id)
        .where(PlannedSession.source == PlannedSessionSource.v1_import.value)
        .where(PlannedSession.original_v1_id.is_not(None))
        .where(PlannedSession.linked_workout_id.is_(None)),
    ).all()
    linked_count = 0
    for planned_session in planned_sessions:
        candidates = [
            workout
            for workout in db.scalars(
                select(Workout)
                .where(Workout.training_space_id == training_space_id)
                .where(Workout.source == WorkoutSource.v1_import.value)
                .where(Workout.original_v1_id.is_not(None))
                .where(Workout.date == planned_session.date)
                .where(Workout.activity == planned_session.type),
            ).all()
            if not db.scalar(
                select(PlannedSession.id).where(
                    PlannedSession.training_space_id == training_space_id,
                    PlannedSession.linked_workout_id == workout.id,
                ),
            )
        ]
        if len(candidates) != 1:
            continue

        workout = candidates[0]
        planned_session.linked_workout_id = workout.id
        planned_session.actual_json = workout_actual_json(workout)
        if planned_session.type != workout.activity:
            planned_session.status = PlannedSessionStatus.modified.value
        elif workout.activity == WorkoutActivity.strength.value:
            planned_session.status = (
                PlannedSessionStatus.completed.value
                if strength_workout_meets_plan(workout, planned_session)
                else PlannedSessionStatus.modified.value
            )
        else:
            planned_session.status = PlannedSessionStatus.completed.value
        linked_count += 1

    if linked_count:
        db.commit()
    return linked_count


def imported_workout_id_map(db: Session, training_space_id: str) -> dict[str, str]:
    rows = db.execute(
        select(Workout.original_v1_id, Workout.id).where(
            Workout.training_space_id == training_space_id,
            Workout.original_v1_id.is_not(None),
        ),
    ).all()
    return {original_v1_id: workout_id for original_v1_id, workout_id in rows if original_v1_id}


def build_imported_planned_session(
    training_space_id: str,
    raw_session: Any,
    index: int,
    workout_id_map: dict[str, str],
) -> tuple[PlannedSession | None, list[str]]:
    label = f"plannedSessions[{index}]"
    warnings: list[str] = []
    if not isinstance(raw_session, dict):
        return None, [f"{label} is not an object; skipped."]

    original_v1_id = raw_session.get("id")
    if not isinstance(original_v1_id, str) or not original_v1_id.strip():
        return None, [f"{label} is missing id; skipped."]

    session_date = parse_date(raw_session.get("date"))
    if session_date is None:
        return None, [f"{label} has invalid date; skipped."]

    linked_workout_id = None
    original_linked_workout_id = raw_session.get("linkedWorkoutId")
    if isinstance(original_linked_workout_id, str) and original_linked_workout_id:
        linked_workout_id = workout_id_map.get(original_linked_workout_id)
        if linked_workout_id is None:
            warnings.append(f"{label} linkedWorkoutId {original_linked_workout_id} was not found; link skipped.")

    return PlannedSession(
        training_space_id=training_space_id,
        type=session_type(raw_session.get("type")),
        title=session_title(raw_session.get("title")),
        date=session_date,
        phase_template_id=string_or_default(raw_session.get("phaseTemplateId")),
        phase_instance_id=string_or_default(raw_session.get("phaseInstanceId")),
        phase_slot_id=string_or_default(raw_session.get("phaseSlotId")),
        phase_week_index=number_to_int(raw_session.get("phaseWeekIndex")),
        generated_date=parse_date(raw_session.get("generatedDate")),
        date_moved_manually=bool(raw_session.get("dateMovedManually")),
        modification_note=string_or_default(raw_session.get("modificationNote")),
        actual_json=raw_session.get("actual") if isinstance(raw_session.get("actual"), dict) else None,
        details_json=raw_session.get("details") if isinstance(raw_session.get("details"), dict) else {},
        linked_workout_id=linked_workout_id,
        status=session_status(raw_session.get("status")),
        source=PlannedSessionSource.v1_import.value,
        coach_editable=False,
        original_v1_id=original_v1_id,
        created_at=parse_created_at(raw_session.get("createdAt")),
    ), warnings


def session_type(value: Any) -> str:
    return value if value in SUPPORTED_SESSION_TYPES else "run"


def session_status(value: Any) -> str:
    return value if value in SUPPORTED_STATUSES else "planned"


def session_title(value: Any) -> str:
    if isinstance(value, str) and value.strip():
        return value.strip()
    return "Planned session"


def string_or_default(value: Any) -> str:
    return value if isinstance(value, str) else ""


def number_to_int(value: Any) -> int | None:
    if isinstance(value, int | float):
        return int(value)
    return None
