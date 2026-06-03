from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import SprintSet, Workout, WorkoutSet, WorkoutSource, WorkoutStrengthExercise
from app.imports.v1_parser import parse_v1_backup_summary


SUPPORTED_ACTIVITIES = {"strength", "run", "sprint"}


def import_v1_workouts(db: Session, training_space_id: str, backup: dict[str, Any]) -> tuple[int, int, int, list[str]]:
    summary = parse_v1_backup_summary(backup)
    warnings = list(summary.warnings)
    imported_count = 0
    existing_count = 0
    skipped_count = 0

    for index, raw_workout in enumerate(backup["workouts"]):
        workout, workout_warnings = build_imported_workout(training_space_id, raw_workout, index)
        warnings.extend(workout_warnings)
        if workout is None:
            skipped_count += 1
            continue

        exists = db.scalar(
            select(Workout.id).where(
                Workout.training_space_id == training_space_id,
                Workout.original_v1_id == workout.original_v1_id,
            ),
        )
        if exists:
            existing_count += 1
            continue

        db.add(workout)
        imported_count += 1

    db.commit()
    return imported_count, skipped_count, existing_count, warnings


def build_imported_workout(training_space_id: str, raw_workout: Any, index: int) -> tuple[Workout | None, list[str]]:
    label = f"workouts[{index}]"
    warnings: list[str] = []
    if not isinstance(raw_workout, dict):
        return None, [f"{label} is not an object; skipped."]

    original_v1_id = raw_workout.get("id")
    if not isinstance(original_v1_id, str) or not original_v1_id.strip():
        return None, [f"{label} is missing id; skipped."]

    activity = raw_workout.get("activity") or "run"
    if activity not in SUPPORTED_ACTIVITIES:
        return None, [f"{label} has unsupported activity {activity}; skipped."]

    workout_date = parse_date(raw_workout.get("date"))
    if workout_date is None:
        return None, [f"{label} has invalid date; skipped."]

    workout = Workout(
        training_space_id=training_space_id,
        activity=activity,
        date=workout_date,
        distance=number_or_none(raw_workout.get("distance")),
        time=normalize_time(activity, raw_workout.get("time")),
        pace=number_or_none(raw_workout.get("pace")),
        sprint_feeling=string_or_none(raw_workout.get("sprintFeeling")),
        notes=raw_workout.get("notes") if isinstance(raw_workout.get("notes"), str) else "",
        source=WorkoutSource.v1_import.value,
        coach_editable=False,
        original_v1_id=original_v1_id,
        created_at=parse_created_at(raw_workout.get("createdAt")),
    )

    if activity == "run":
        workout.pace = calculate_run_pace(workout.distance, workout.time)

    if activity == "strength":
        workout.strength_exercises = build_strength_exercises(raw_workout.get("strengthExercises"))
        if not workout.strength_exercises:
            return None, [f"{label} has no valid strength exercises; skipped."]

    if activity == "sprint":
        workout.sprint_sets = build_sprint_sets(raw_workout.get("sprintSets"))
        if not workout.sprint_sets:
            return None, [f"{label} has no valid sprint sets; skipped."]

    return workout, warnings


def build_strength_exercises(raw_exercises: Any) -> list[WorkoutStrengthExercise]:
    if not isinstance(raw_exercises, list):
        return []

    exercises: list[WorkoutStrengthExercise] = []
    for raw_exercise in raw_exercises:
        if not isinstance(raw_exercise, dict) or not isinstance(raw_exercise.get("name"), str):
            continue

        sets = build_workout_sets(raw_exercise.get("sets"))
        if not sets:
            continue

        exercises.append(
            WorkoutStrengthExercise(
                order=len(exercises) + 1,
                name=raw_exercise["name"].strip(),
                sets=sets,
            ),
        )
    return exercises


def build_workout_sets(raw_sets: Any) -> list[WorkoutSet]:
    if not isinstance(raw_sets, list):
        return []

    sets: list[WorkoutSet] = []
    for raw_set in raw_sets:
        if not isinstance(raw_set, dict):
            continue
        reps = int_or_none(raw_set.get("reps"))
        if reps is None:
            continue
        load_type = raw_set.get("loadType") if raw_set.get("loadType") in {"kg", "bodyweight", "band"} else "kg"
        sets.append(
            WorkoutSet(
                order=len(sets) + 1,
                reps=reps,
                weight=number_or_none(raw_set.get("weight")) if load_type == "kg" else None,
                load_type=load_type,
                band_color=raw_set.get("bandColor") if isinstance(raw_set.get("bandColor"), str) else "",
            ),
        )
    return sets


def build_sprint_sets(raw_sets: Any) -> list[SprintSet]:
    if not isinstance(raw_sets, list):
        return []

    sprint_sets: list[SprintSet] = []
    for raw_set in raw_sets:
        if not isinstance(raw_set, dict):
            continue
        distance_m = int_or_none(raw_set.get("distance"))
        time_sec = number_or_none(raw_set.get("time"))
        if distance_m is None or time_sec is None:
            continue
        sprint_sets.append(SprintSet(order=len(sprint_sets) + 1, distance_m=distance_m, time_sec=time_sec))
    return sprint_sets


def parse_date(value: Any) -> date | None:
    if not isinstance(value, str):
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def parse_created_at(value: Any) -> datetime:
    if isinstance(value, int | float):
        return datetime.fromtimestamp(value / 1000, timezone.utc)
    return datetime.now(timezone.utc)


def number_or_none(value: Any) -> float | None:
    if isinstance(value, int | float):
        return float(value)
    return None


def int_or_none(value: Any) -> int | None:
    if isinstance(value, int | float):
        return int(value)
    return None


def string_or_none(value: Any) -> str | None:
    return value if isinstance(value, str) else None


def normalize_time(activity: str, value: Any) -> str | None:
    if activity == "run":
        if isinstance(value, str):
            return normalize_run_duration(value)
        if isinstance(value, int | float):
            return format_seconds_as_run_duration(value * 60)
        return None
    if isinstance(value, int | float):
        return str(value)
    return value if isinstance(value, str) else None


def normalize_run_duration(value: str) -> str | None:
    parts = value.strip().split(":")
    if len(parts) not in {2, 3} or any(not part.isdigit() for part in parts):
        return None

    numbers = [int(part) for part in parts]
    hours, minutes, seconds = numbers if len(parts) == 3 else [0, numbers[0], numbers[1]]
    if minutes > 59 or seconds > 59:
        return None
    return format_seconds_as_run_duration((hours * 3600) + (minutes * 60) + seconds)


def format_seconds_as_run_duration(total_seconds: float) -> str:
    rounded = round(total_seconds)
    hours = rounded // 3600
    minutes = (rounded % 3600) // 60
    seconds = rounded % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"


def calculate_run_pace(distance: float | None, time: str | None) -> float | None:
    if distance is None or distance <= 0 or time is None:
        return None
    parts = [int(part) for part in time.split(":")]
    total_seconds = (parts[0] * 3600) + (parts[1] * 60) + parts[2]
    if total_seconds <= 0:
        return None
    return total_seconds / 60 / distance
