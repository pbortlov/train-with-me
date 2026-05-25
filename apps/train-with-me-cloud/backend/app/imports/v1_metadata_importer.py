from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import ImportedV1Metadata

V1_IMPORT_SOURCE = "v1_import"


def import_v1_metadata(db: Session, training_space_id: str, backup: dict[str, Any]) -> tuple[int, int, int, int, int, int, list[str]]:
    goal_imported, goal_existing, goal_warnings = import_goal_metadata(db, training_space_id, backup.get("goals"))
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
        [*goal_warnings, *template_warnings, *instance_warnings],
    )


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
