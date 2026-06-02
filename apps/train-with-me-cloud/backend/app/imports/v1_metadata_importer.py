from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.db.models import ImportedV1Metadata, PlannedSession, ProgramInstance, ProgramTemplate
from app.imports.v1_workout_importer import parse_date

V1_IMPORT_SOURCE = "v1_import"


def import_v1_metadata(db: Session, training_space_id: str, backup: dict[str, Any]) -> tuple[int, int, int, int, int, int, list[str]]:
    goal_imported, goal_existing, goal_warnings = import_goal_metadata(db, training_space_id, backup.get("goals"))
    import_v1_program_templates(db, training_space_id, backup.get("phaseTemplates"))
    native_instance_warnings = import_v1_program_instances(db, training_space_id, backup.get("phaseInstances"))
    template_imported, template_existing, template_warnings = import_collection_metadata(
        db,
        training_space_id,
        backup.get("phaseTemplates"),
        "phase_template",
        "phaseTemplates",
    )
    instance_imported, instance_existing, instance_warnings = import_collection_metadata(
        db,
        training_space_id,
        backup.get("phaseInstances"),
        "phase_instance",
        "phaseInstances",
    )
    db.commit()
    return (
        goal_imported,
        goal_existing,
        template_imported,
        template_existing,
        instance_imported,
        instance_existing,
        [*goal_warnings, *native_instance_warnings, *template_warnings, *instance_warnings],
    )


def import_v1_program_templates(db: Session, training_space_id: str, raw_templates: Any) -> None:
    if not isinstance(raw_templates, list):
        return
    for raw_template in raw_templates:
        if not isinstance(raw_template, dict):
            continue
        original_v1_id = raw_template.get("id")
        if not isinstance(original_v1_id, str) or not original_v1_id.strip():
            continue
        exists = db.scalar(
            select(ProgramTemplate.id).where(
                ProgramTemplate.training_space_id == training_space_id,
                ProgramTemplate.original_v1_id == original_v1_id,
            ),
        )
        if exists:
            continue
        db.add(build_program_template(training_space_id, original_v1_id, raw_template))


def build_program_template(training_space_id: str, original_v1_id: str, raw_template: dict[str, Any]) -> ProgramTemplate:
    name = raw_template.get("name") if isinstance(raw_template.get("name"), str) and raw_template.get("name").strip() else original_v1_id
    duration_weeks = raw_template.get("durationWeeks")
    if not isinstance(duration_weeks, int) or duration_weeks < 1:
        duration_weeks = 1
    template_json: dict[str, Any] = {
        "weekdaySlots": raw_template.get("weekdaySlots") if isinstance(raw_template.get("weekdaySlots"), list) else [],
        "v1PhaseTemplateId": original_v1_id,
    }
    if isinstance(raw_template.get("startDate"), str):
        template_json["startDate"] = raw_template["startDate"]
    notes = raw_template.get("notes") if isinstance(raw_template.get("notes"), str) else ""
    return ProgramTemplate(
        training_space_id=training_space_id,
        name=name.strip(),
        duration_weeks=duration_weeks,
        template_json=template_json,
        notes=notes,
        original_v1_id=original_v1_id,
    )


def import_v1_program_instances(db: Session, training_space_id: str, raw_instances: Any) -> list[str]:
    if not isinstance(raw_instances, list):
        return []
    warnings: list[str] = []
    for index, raw_instance in enumerate(raw_instances):
        if not isinstance(raw_instance, dict):
            continue
        warning = import_v1_program_instance(db, training_space_id, raw_instance, index)
        if warning:
            warnings.append(warning)
    return warnings


def import_v1_program_instance(db: Session, training_space_id: str, raw_instance: dict[str, Any], index: int) -> str:
    label = f"phaseInstances[{index}]"
    original_v1_id = raw_instance.get("id")
    if not isinstance(original_v1_id, str) or not original_v1_id.strip():
        return ""

    exists = db.scalar(
        select(ProgramInstance.id).where(
            ProgramInstance.training_space_id == training_space_id,
            ProgramInstance.original_v1_id == original_v1_id,
        ),
    )
    if exists:
        return ""

    template_original_v1_id = raw_instance.get("templateId")
    if not isinstance(template_original_v1_id, str) or not template_original_v1_id.strip():
        return f"{label} is missing templateId; skipped native scheduled program import."
    template = db.scalar(
        select(ProgramTemplate).where(
            ProgramTemplate.training_space_id == training_space_id,
            ProgramTemplate.original_v1_id == template_original_v1_id,
        ),
    )
    if not template:
        return f"{label} templateId {template_original_v1_id} was not found; skipped native scheduled program import."

    start_date = parse_date(raw_instance.get("startDate"))
    if start_date is None:
        return f"{label} has invalid startDate; skipped native scheduled program import."
    duration_weeks = raw_instance.get("durationWeeks")
    if not isinstance(duration_weeks, int) or duration_weeks < 1:
        duration_weeks = template.duration_weeks

    linked_sessions = native_program_sessions(db, training_space_id, raw_instance)
    instance = ProgramInstance(
        training_space_id=training_space_id,
        template_id=template.id,
        template_name=template.name,
        start_date=start_date,
        duration_weeks=duration_weeks,
        generated_session_ids=[session.id for session in linked_sessions],
        original_v1_id=original_v1_id,
    )
    db.add(instance)
    db.flush()

    for session in linked_sessions:
        session.phase_template_id = template.id
        session.phase_instance_id = instance.id

    return ""


def native_program_sessions(db: Session, training_space_id: str, raw_instance: dict[str, Any]) -> list[PlannedSession]:
    original_session_ids = string_set(raw_instance.get("generatedSessionIds"))
    original_instance_id = raw_instance.get("id")
    conditions = []
    if original_session_ids:
        conditions.append(PlannedSession.original_v1_id.in_(original_session_ids))
    if isinstance(original_instance_id, str) and original_instance_id:
        conditions.append(PlannedSession.phase_instance_id == original_instance_id)
    if not conditions:
        return []
    return db.scalars(
        select(PlannedSession)
        .where(PlannedSession.training_space_id == training_space_id)
        .where(or_(*conditions))
        .order_by(PlannedSession.date, PlannedSession.created_at, PlannedSession.id),
    ).all()


def string_set(value: Any) -> set[str]:
    if not isinstance(value, list):
        return set()
    return {item for item in value if isinstance(item, str) and item}


def import_goal_metadata(db: Session, training_space_id: str, goals: Any) -> tuple[int, int, list[str]]:
    if not isinstance(goals, dict):
        return 0, 0, ["Backup goals is not an object; skipped goal metadata import."]
    imported = add_metadata_row(db, training_space_id, "goals", "goals", goals)
    return (1, 0, []) if imported else (0, 1, [])


def import_collection_metadata(
    db: Session,
    training_space_id: str,
    raw_items: Any,
    entity_type: str,
    backup_key: str,
) -> tuple[int, int, list[str]]:
    if raw_items is None:
        return 0, 0, []
    if not isinstance(raw_items, list):
        return 0, 0, [f"Backup {backup_key} is not an array; skipped {entity_type} metadata import."]

    imported_count = 0
    existing_count = 0
    warnings: list[str] = []
    for index, raw_item in enumerate(raw_items):
        if not isinstance(raw_item, dict):
            warnings.append(f"{backup_key}[{index}] is not an object; skipped.")
            continue
        original_v1_id = raw_item.get("id")
        if not isinstance(original_v1_id, str) or not original_v1_id.strip():
            warnings.append(f"{backup_key}[{index}] is missing id; skipped.")
            continue
        if add_metadata_row(db, training_space_id, entity_type, original_v1_id, raw_item):
            imported_count += 1
        else:
            existing_count += 1
    return imported_count, existing_count, warnings


def add_metadata_row(
    db: Session,
    training_space_id: str,
    entity_type: str,
    original_v1_id: str,
    payload: dict[str, Any],
) -> bool:
    exists = db.scalar(
        select(ImportedV1Metadata.id).where(
            ImportedV1Metadata.training_space_id == training_space_id,
            ImportedV1Metadata.entity_type == entity_type,
            ImportedV1Metadata.original_v1_id == original_v1_id,
        ),
    )
    if exists:
        return False

    db.add(
        ImportedV1Metadata(
            training_space_id=training_space_id,
            entity_type=entity_type,
            original_v1_id=original_v1_id,
            payload_json=payload,
            source=V1_IMPORT_SOURCE,
            coach_editable=False,
        ),
    )
    return True
