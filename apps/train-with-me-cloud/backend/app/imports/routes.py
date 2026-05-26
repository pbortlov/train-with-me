from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.db.models import ImportedV1Metadata, TrainingSpaceRole, User
from app.db.session import get_db_session
from app.imports.schemas import (
    ImportedV1MetadataResponse,
    V1BackupSummaryResponse,
    V1ImportCommitRequest,
    V1ImportCommitResponse,
    V1ImportPreviewResponse,
)
from app.imports.v1_metadata_importer import import_v1_metadata
from app.imports.v1_planned_session_importer import import_v1_planned_sessions
from app.imports.v1_parser import V1BackupParseError, parse_v1_backup_summary
from app.imports.v1_workout_importer import import_v1_workouts
from app.spaces.routes import get_membership

router = APIRouter()

SUPPORTED_V1_TOP_LEVEL_FIELDS = {
    "version",
    "exportedAt",
    "workouts",
    "goals",
    "plannedSessions",
    "phaseTemplates",
    "phaseInstances",
    "uiSettings",
}


@router.post("/v1/preview", response_model=V1ImportPreviewResponse, response_model_by_alias=True)
def preview_v1_backup(payload: Any = Body(...)) -> V1ImportPreviewResponse:
    try:
        summary = parse_v1_backup_summary(payload)
    except V1BackupParseError as exc:
        return V1ImportPreviewResponse(
            valid=False,
            summary=None,
            warnings=[str(exc)],
            unsupported_fields=unsupported_fields(payload),
        )

    return V1ImportPreviewResponse(
        valid=True,
        summary=V1BackupSummaryResponse(
            version=summary.version,
            exported_at=summary.exported_at,
            workout_count=summary.workout_count,
            planned_session_count=summary.planned_session_count,
            goal_count=summary.goal_count,
            phase_template_count=summary.phase_template_count,
            phase_instance_count=summary.phase_instance_count,
        ),
        warnings=summary.warnings,
        unsupported_fields=unsupported_fields(payload),
    )


def unsupported_fields(payload: Any) -> list[str]:
    if not isinstance(payload, dict):
        return []
    return sorted(set(payload) - SUPPORTED_V1_TOP_LEVEL_FIELDS)


@router.post("/v1/commit", response_model=V1ImportCommitResponse, response_model_by_alias=True)
def commit_v1_backup(
    payload: V1ImportCommitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> V1ImportCommitResponse:
    membership = get_membership(db, payload.training_space_id, current_user.id)
    if not membership:
        raise imports_error("training_space_not_found", "Training space was not found.", status.HTTP_404_NOT_FOUND)
    if membership.role == TrainingSpaceRole.coach.value:
        raise imports_error("import_forbidden", "Coach members cannot import athlete history.", status.HTTP_403_FORBIDDEN)

    try:
        imported_count, skipped_count, existing_count, warnings = import_v1_workouts(
            db,
            payload.training_space_id,
            payload.backup,
        )
        planned_imported_count, planned_skipped_count, planned_existing_count, planned_warnings = import_v1_planned_sessions(
            db,
            payload.training_space_id,
            payload.backup,
        )
        (
            imported_goal_count,
            existing_goal_count,
            imported_phase_template_count,
            existing_phase_template_count,
            imported_phase_instance_count,
            existing_phase_instance_count,
            metadata_warnings,
        ) = import_v1_metadata(db, payload.training_space_id, payload.backup)
    except V1BackupParseError as exc:
        raise imports_error("invalid_v1_backup", str(exc), status.HTTP_400_BAD_REQUEST) from exc

    return V1ImportCommitResponse(
        imported_workout_count=imported_count,
        skipped_workout_count=skipped_count,
        existing_workout_count=existing_count,
        imported_planned_session_count=planned_imported_count,
        skipped_planned_session_count=planned_skipped_count,
        existing_planned_session_count=planned_existing_count,
        imported_goal_count=imported_goal_count,
        existing_goal_count=existing_goal_count,
        imported_phase_template_count=imported_phase_template_count,
        existing_phase_template_count=existing_phase_template_count,
        imported_phase_instance_count=imported_phase_instance_count,
        existing_phase_instance_count=existing_phase_instance_count,
        warnings=[*warnings, *planned_warnings, *metadata_warnings],
    )


@router.get("/v1/metadata/{training_space_id}", response_model=list[ImportedV1MetadataResponse], response_model_by_alias=True)
def list_v1_metadata(
    training_space_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> list[ImportedV1MetadataResponse]:
    membership = get_membership(db, training_space_id, current_user.id)
    if not membership:
        raise imports_error("training_space_not_found", "Training space was not found.", status.HTTP_404_NOT_FOUND)

    rows = db.scalars(
        select(ImportedV1Metadata)
        .where(ImportedV1Metadata.training_space_id == training_space_id)
        .order_by(ImportedV1Metadata.entity_type, ImportedV1Metadata.original_v1_id),
    ).all()
    return [
        ImportedV1MetadataResponse(
            id=row.id,
            entity_type=row.entity_type,
            original_v1_id=row.original_v1_id,
            payload=row.payload_json,
        )
        for row in rows
    ]


def imports_error(code: str, message: str, status_code: int) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"error": {"code": code, "message": message}},
    )
