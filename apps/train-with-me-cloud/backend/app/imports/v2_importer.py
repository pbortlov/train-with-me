from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import (
    ImportedV2Identity,
    PlannedSession,
    ProgramInstance,
    ProgramTemplate,
    SprintSet,
    TrainingGoal,
    Workout,
    WorkoutSet,
    WorkoutStrengthExercise,
)


@dataclass
class V2ImportCounts:
    imported_workouts: int = 0
    existing_workouts: int = 0
    imported_planned_sessions: int = 0
    existing_planned_sessions: int = 0
    imported_training_goals: int = 0
    existing_training_goals: int = 0
    imported_program_templates: int = 0
    existing_program_templates: int = 0
    imported_program_instances: int = 0
    existing_program_instances: int = 0
    warnings: list[str] = field(default_factory=list)


ENTITY_WORKOUT = "workout"
ENTITY_PLANNED_SESSION = "planned_session"
ENTITY_TRAINING_GOAL = "training_goal"
ENTITY_PROGRAM_TEMPLATE = "program_template"
ENTITY_PROGRAM_INSTANCE = "program_instance"


def import_v2_cloud_data(db: Session, training_space_id: str, export_data: dict[str, Any]) -> V2ImportCounts:
    if export_data.get("exportFormat") != "train-with-me-cloud-v2-native":
        raise ValueError("V2 import requires exportFormat train-with-me-cloud-v2-native.")

    counts = V2ImportCounts()
    id_map: dict[str, dict[str, str]] = {
        ENTITY_WORKOUT: {},
        ENTITY_PLANNED_SESSION: {},
        ENTITY_TRAINING_GOAL: {},
        ENTITY_PROGRAM_TEMPLATE: {},
        ENTITY_PROGRAM_INSTANCE: {},
    }
    load_existing_identities(db, training_space_id, id_map)

    import_program_templates(db, training_space_id, export_data.get("programTemplates"), id_map, counts)
    import_workouts(db, training_space_id, export_data.get("workouts"), id_map, counts)
    import_training_goals(db, training_space_id, export_data.get("trainingGoals"), id_map, counts)
    import_program_instances(db, training_space_id, export_data.get("programInstances"), id_map, counts)
    import_planned_sessions(db, training_space_id, export_data.get("plannedSessions"), id_map, counts)
    update_program_instance_session_links(db, training_space_id, export_data.get("programInstances"), id_map)

    db.commit()
    return counts


def load_existing_identities(db: Session, training_space_id: str, id_map: dict[str, dict[str, str]]) -> None:
    rows = db.scalars(select(ImportedV2Identity).where(ImportedV2Identity.training_space_id == training_space_id)).all()
    for row in rows:
        id_map.setdefault(row.entity_type, {})[row.source_id] = row.target_id


def add_identity(db: Session, training_space_id: str, entity_type: str, source_id: str, target_id: str, id_map: dict[str, dict[str, str]]) -> None:
    db.add(
        ImportedV2Identity(
            training_space_id=training_space_id,
            entity_type=entity_type,
            source_id=source_id,
            target_id=target_id,
        ),
    )
    id_map.setdefault(entity_type, {})[source_id] = target_id


def import_program_templates(
    db: Session,
    training_space_id: str,
    raw_templates: Any,
    id_map: dict[str, dict[str, str]],
    counts: V2ImportCounts,
) -> None:
    for index, raw_template in enumerate(list_or_empty(raw_templates)):
        source_id = source_id_for(raw_template)
        if not source_id:
            counts.warnings.append(f"programTemplates[{index}] is missing id; skipped.")
            continue
        if source_id in id_map[ENTITY_PROGRAM_TEMPLATE]:
            counts.existing_program_templates += 1
            continue
        template = ProgramTemplate(
            training_space_id=training_space_id,
            name=string_or_default(raw_template.get("name"), "Program template"),
            duration_weeks=positive_int(raw_template.get("durationWeeks"), 1),
            template_json=dict_or_empty(raw_template.get("template")),
            notes=string_or_default(raw_template.get("notes"), ""),
            original_v1_id=available_original_v1_id(db, ProgramTemplate, training_space_id, raw_template.get("originalV1Id")),
            created_at=parse_datetime(raw_template.get("createdAt")),
            updated_at=parse_datetime(raw_template.get("updatedAt")),
        )
        db.add(template)
        db.flush()
        add_identity(db, training_space_id, ENTITY_PROGRAM_TEMPLATE, source_id, template.id, id_map)
        counts.imported_program_templates += 1


def import_workouts(db: Session, training_space_id: str, raw_workouts: Any, id_map: dict[str, dict[str, str]], counts: V2ImportCounts) -> None:
    for index, raw_workout in enumerate(list_or_empty(raw_workouts)):
        source_id = source_id_for(raw_workout)
        if not source_id:
            counts.warnings.append(f"workouts[{index}] is missing id; skipped.")
            continue
        if source_id in id_map[ENTITY_WORKOUT]:
            counts.existing_workouts += 1
            continue
        workout = Workout(
            training_space_id=training_space_id,
            activity=string_or_default(raw_workout.get("activity"), "run"),
            date=parse_date(raw_workout.get("date")) or date.today(),
            distance=number_or_none(raw_workout.get("distance")),
            time=string_or_none(raw_workout.get("time")),
            pace=number_or_none(raw_workout.get("pace")),
            sprint_feeling=string_or_none(raw_workout.get("sprintFeeling")),
            notes=string_or_default(raw_workout.get("notes"), ""),
            source=string_or_default(raw_workout.get("source"), "manual"),
            coach_editable=bool_or_default(raw_workout.get("coachEditable"), True),
            original_v1_id=available_original_v1_id(db, Workout, training_space_id, raw_workout.get("originalV1Id")),
            created_at=parse_datetime(raw_workout.get("createdAt")),
        )
        workout.strength_exercises = build_strength_exercises(raw_workout.get("strengthExercises"))
        workout.sprint_sets = build_sprint_sets(raw_workout.get("sprintSets"))
        db.add(workout)
        db.flush()
        add_identity(db, training_space_id, ENTITY_WORKOUT, source_id, workout.id, id_map)
        counts.imported_workouts += 1


def import_training_goals(db: Session, training_space_id: str, raw_goals: Any, id_map: dict[str, dict[str, str]], counts: V2ImportCounts) -> None:
    for index, raw_goal in enumerate(list_or_empty(raw_goals)):
        source_id = source_id_for(raw_goal)
        activity = raw_goal.get("activity") if isinstance(raw_goal, dict) else None
        if not source_id or not isinstance(activity, str):
            counts.warnings.append(f"trainingGoals[{index}] is missing id or activity; skipped.")
            continue
        if source_id in id_map[ENTITY_TRAINING_GOAL]:
            counts.existing_training_goals += 1
            continue
        goal = db.scalar(select(TrainingGoal).where(TrainingGoal.training_space_id == training_space_id, TrainingGoal.activity == activity))
        if goal:
            goal.target_json = dict_or_empty(raw_goal.get("target"))
            goal.notes = string_or_default(raw_goal.get("notes"), "")
        else:
            goal = TrainingGoal(
                training_space_id=training_space_id,
                activity=activity,
                target_json=dict_or_empty(raw_goal.get("target")),
                notes=string_or_default(raw_goal.get("notes"), ""),
                created_at=parse_datetime(raw_goal.get("createdAt")),
                updated_at=parse_datetime(raw_goal.get("updatedAt")),
            )
            db.add(goal)
        db.flush()
        add_identity(db, training_space_id, ENTITY_TRAINING_GOAL, source_id, goal.id, id_map)
        counts.imported_training_goals += 1


def import_program_instances(
    db: Session,
    training_space_id: str,
    raw_instances: Any,
    id_map: dict[str, dict[str, str]],
    counts: V2ImportCounts,
) -> None:
    for index, raw_instance in enumerate(list_or_empty(raw_instances)):
        source_id = source_id_for(raw_instance)
        if not source_id:
            counts.warnings.append(f"programInstances[{index}] is missing id; skipped.")
            continue
        if source_id in id_map[ENTITY_PROGRAM_INSTANCE]:
            counts.existing_program_instances += 1
            continue
        source_template_id = raw_instance.get("templateId")
        template_id = id_map[ENTITY_PROGRAM_TEMPLATE].get(source_template_id) if isinstance(source_template_id, str) else None
        if not template_id:
            counts.warnings.append(f"programInstances[{index}] references missing template; skipped.")
            continue
        instance = ProgramInstance(
            training_space_id=training_space_id,
            template_id=template_id,
            template_name=string_or_default(raw_instance.get("templateName"), "Program"),
            start_date=parse_date(raw_instance.get("startDate")) or date.today(),
            duration_weeks=positive_int(raw_instance.get("durationWeeks"), 1),
            generated_session_ids=[],
            original_v1_id=available_original_v1_id(db, ProgramInstance, training_space_id, raw_instance.get("originalV1Id")),
            created_at=parse_datetime(raw_instance.get("createdAt")),
        )
        db.add(instance)
        db.flush()
        add_identity(db, training_space_id, ENTITY_PROGRAM_INSTANCE, source_id, instance.id, id_map)
        counts.imported_program_instances += 1


def import_planned_sessions(
    db: Session,
    training_space_id: str,
    raw_sessions: Any,
    id_map: dict[str, dict[str, str]],
    counts: V2ImportCounts,
) -> None:
    for index, raw_session in enumerate(list_or_empty(raw_sessions)):
        source_id = source_id_for(raw_session)
        if not source_id:
            counts.warnings.append(f"plannedSessions[{index}] is missing id; skipped.")
            continue
        if source_id in id_map[ENTITY_PLANNED_SESSION]:
            counts.existing_planned_sessions += 1
            continue
        session = PlannedSession(
            training_space_id=training_space_id,
            type=string_or_default(raw_session.get("type"), "run"),
            title=string_or_default(raw_session.get("title"), "Planned session"),
            date=parse_date(raw_session.get("date")) or date.today(),
            phase_template_id=mapped_id(id_map, ENTITY_PROGRAM_TEMPLATE, raw_session.get("phaseTemplateId")),
            phase_instance_id=mapped_id(id_map, ENTITY_PROGRAM_INSTANCE, raw_session.get("phaseInstanceId")),
            phase_slot_id=string_or_default(raw_session.get("phaseSlotId"), ""),
            phase_week_index=int_or_none(raw_session.get("phaseWeekIndex")),
            generated_date=parse_date(raw_session.get("generatedDate")),
            date_moved_manually=bool_or_default(raw_session.get("dateMovedManually"), False),
            modification_note=string_or_default(raw_session.get("modificationNote"), ""),
            actual_json=dict_or_none(raw_session.get("actual")),
            details_json=dict_or_empty(raw_session.get("details")),
            linked_workout_id=optional_mapped_id(id_map, ENTITY_WORKOUT, raw_session.get("linkedWorkoutId")),
            status=string_or_default(raw_session.get("status"), "planned"),
            source=string_or_default(raw_session.get("source"), "manual"),
            coach_editable=bool_or_default(raw_session.get("coachEditable"), True),
            original_v1_id=available_original_v1_id(db, PlannedSession, training_space_id, raw_session.get("originalV1Id")),
            created_at=parse_datetime(raw_session.get("createdAt")),
        )
        db.add(session)
        db.flush()
        add_identity(db, training_space_id, ENTITY_PLANNED_SESSION, source_id, session.id, id_map)
        counts.imported_planned_sessions += 1


def update_program_instance_session_links(db: Session, training_space_id: str, raw_instances: Any, id_map: dict[str, dict[str, str]]) -> None:
    for raw_instance in list_or_empty(raw_instances):
        source_id = source_id_for(raw_instance)
        target_id = id_map[ENTITY_PROGRAM_INSTANCE].get(source_id) if source_id else None
        if not target_id:
            continue
        instance = db.get(ProgramInstance, target_id)
        if not instance or instance.training_space_id != training_space_id:
            continue
        source_session_ids = raw_instance.get("generatedSessionIds")
        if not isinstance(source_session_ids, list):
            instance.generated_session_ids = []
            continue
        instance.generated_session_ids = [
            id_map[ENTITY_PLANNED_SESSION][session_id]
            for session_id in source_session_ids
            if isinstance(session_id, str) and session_id in id_map[ENTITY_PLANNED_SESSION]
        ]


def build_strength_exercises(raw_exercises: Any) -> list[WorkoutStrengthExercise]:
    exercises: list[WorkoutStrengthExercise] = []
    for exercise_index, raw_exercise in enumerate(list_or_empty(raw_exercises)):
        name = string_or_default(raw_exercise.get("name"), "")
        if not name:
            continue
        exercises.append(
            WorkoutStrengthExercise(
                order=positive_int(raw_exercise.get("order"), exercise_index + 1),
                name=name,
                sets=[
                    WorkoutSet(
                        order=positive_int(raw_set.get("order"), set_index + 1),
                        reps=positive_int(raw_set.get("reps"), 0),
                        weight=number_or_none(raw_set.get("weight")),
                        load_type=string_or_default(raw_set.get("loadType"), "kg"),
                        band_color=string_or_default(raw_set.get("bandColor"), ""),
                    )
                    for set_index, raw_set in enumerate(list_or_empty(raw_exercise.get("sets")))
                ],
            ),
        )
    return exercises


def build_sprint_sets(raw_sets: Any) -> list[SprintSet]:
    return [
        SprintSet(
            order=positive_int(raw_set.get("order"), index + 1),
            distance_m=positive_int(raw_set.get("distance"), positive_int(raw_set.get("distanceM"), 0)),
            time_sec=float_or_default(raw_set.get("time"), float_or_default(raw_set.get("timeSec"), 0)),
        )
        for index, raw_set in enumerate(list_or_empty(raw_sets))
    ]


def available_original_v1_id(db: Session, model: Any, training_space_id: str, value: Any) -> str | None:
    if not isinstance(value, str) or not value:
        return None
    exists = db.scalar(select(model.id).where(model.training_space_id == training_space_id, model.original_v1_id == value))
    return None if exists else value


def mapped_id(id_map: dict[str, dict[str, str]], entity_type: str, value: Any) -> str:
    return id_map[entity_type].get(value, "") if isinstance(value, str) else ""


def optional_mapped_id(id_map: dict[str, dict[str, str]], entity_type: str, value: Any) -> str | None:
    return id_map[entity_type].get(value) if isinstance(value, str) else None


def list_or_empty(value: Any) -> list[dict[str, Any]]:
    return [item for item in value if isinstance(item, dict)] if isinstance(value, list) else []


def source_id_for(value: Any) -> str:
    return value.get("id") if isinstance(value, dict) and isinstance(value.get("id"), str) else ""


def string_or_default(value: Any, default: str) -> str:
    return value if isinstance(value, str) else default


def string_or_none(value: Any) -> str | None:
    return value if isinstance(value, str) and value else None


def dict_or_empty(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def dict_or_none(value: Any) -> dict[str, Any] | None:
    return value if isinstance(value, dict) else None


def positive_int(value: Any, default: int) -> int:
    if isinstance(value, int | float):
        return max(int(value), 0)
    return default


def int_or_none(value: Any) -> int | None:
    return int(value) if isinstance(value, int | float) else None


def number_or_none(value: Any) -> float | None:
    return float(value) if isinstance(value, int | float) else None


def float_or_default(value: Any, default: float) -> float:
    return float(value) if isinstance(value, int | float) else default


def bool_or_default(value: Any, default: bool) -> bool:
    return value if isinstance(value, bool) else default


def parse_date(value: Any) -> date | None:
    if not isinstance(value, str):
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def parse_datetime(value: Any) -> datetime:
    if isinstance(value, int | float):
        return datetime.fromtimestamp(value / 1000, tz=timezone.utc)
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return datetime.now(timezone.utc)
    return datetime.now(timezone.utc)
