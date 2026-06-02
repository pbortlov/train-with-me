from typing import Any
from datetime import timezone

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.routes import get_current_user
from app.db.models import ImportedV1Metadata, PlannedSession, TrainingSpaceRole, User, Workout
from app.db.session import get_db_session
from app.imports.schemas import (
    ImportedV1MetadataResponse,
    V1BackfillResponse,
    V1BackupSummaryResponse,
    V1ImportCommitRequest,
    V1ImportCommitResponse,
    V1ImportPreviewResponse,
)
from app.imports.v1_metadata_importer import import_v1_metadata
from app.imports.v1_planned_session_importer import consolidate_v1_planned_sessions_with_workouts, import_v1_planned_sessions
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
        consolidate_v1_planned_sessions_with_workouts(db, payload.training_space_id)
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


@router.post("/v1/backfill/{training_space_id}", response_model=V1BackfillResponse, response_model_by_alias=True)
def backfill_v1_import(
    training_space_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> V1BackfillResponse:
    membership = get_membership(db, training_space_id, current_user.id)
    if not membership:
        raise imports_error("training_space_not_found", "Training space was not found.", status.HTTP_404_NOT_FOUND)
    if membership.role == TrainingSpaceRole.coach.value:
        raise imports_error("import_forbidden", "Coach members cannot backfill athlete history.", status.HTTP_403_FORBIDDEN)

    linked_count = consolidate_v1_planned_sessions_with_workouts(db, training_space_id)
    return V1BackfillResponse(linked_planned_session_count=linked_count)


@router.get("/v1/export/{training_space_id}")
def export_v1_backup(
    training_space_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> dict[str, Any]:
    membership = get_membership(db, training_space_id, current_user.id)
    if not membership:
        raise imports_error("training_space_not_found", "Training space was not found.", status.HTTP_404_NOT_FOUND)

    workouts = db.scalars(
        select(Workout)
        .where(Workout.training_space_id == training_space_id)
        .order_by(Workout.date, Workout.created_at, Workout.id),
    ).all()
    planned_sessions = db.scalars(
        select(PlannedSession)
        .where(PlannedSession.training_space_id == training_space_id)
        .order_by(PlannedSession.date, PlannedSession.created_at, PlannedSession.id),
    ).all()
    metadata_rows = db.scalars(
        select(ImportedV1Metadata).where(ImportedV1Metadata.training_space_id == training_space_id),
    ).all()

    metadata_by_type = {(row.entity_type, row.original_v1_id): row.payload_json for row in metadata_rows}
    phase_templates = [row.payload_json for row in metadata_rows if row.entity_type == "phase_template"]
    phase_instances = [row.payload_json for row in metadata_rows if row.entity_type == "phase_instance"]

    return {
        "version": 2,
        "exportFormat": "train-with-me-cloud-v2",
        "appVersion": "v2",
        "sourceApp": "train-with-me-cloud",
        "exportedAt": utc_iso_now(),
        "workouts": [export_workout(workout) for workout in workouts],
        "goals": metadata_by_type.get(("goals", "goals"), {"version": 2, "active": {}, "history": []}),
        "plannedSessions": [export_planned_session(session, workouts) for session in planned_sessions],
        "phaseTemplates": phase_templates,
        "phaseInstances": phase_instances,
        "uiSettings": {"currentView": "calendar", "coachMode": False},
    }


def utc_iso_now() -> str:
    from datetime import datetime

    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def export_workout(workout: Workout) -> dict[str, Any]:
    exported: dict[str, Any] = {
        "id": workout.original_v1_id or workout.id,
        "date": workout.date.isoformat(),
        "activity": workout.activity,
        "notes": workout.notes,
        "createdAt": int(workout.created_at.timestamp() * 1000),
    }
    if workout.activity == "run":
        exported.update({"distance": workout.distance, "time": workout.time, "pace": workout.pace})
    if workout.activity == "sprint":
        exported["sprintFeeling"] = workout.sprint_feeling
        exported["sprintSets"] = [
            {"distance": sprint_set.distance_m, "time": sprint_set.time_sec}
            for sprint_set in sorted(workout.sprint_sets, key=lambda item: item.order)
        ]
    if workout.activity == "strength":
        exported["strengthExercises"] = [
            {
                "name": exercise.name,
                "sets": [
                    {
                        "order": workout_set.order,
                        "reps": workout_set.reps,
                        "weight": workout_set.weight,
                        "loadType": workout_set.load_type,
                        "bandColor": workout_set.band_color,
                    }
                    for workout_set in sorted(exercise.sets, key=lambda item: item.order)
                ],
            }
            for exercise in sorted(workout.strength_exercises, key=lambda item: item.order)
        ]
    return exported


def export_planned_session(session: PlannedSession, workouts: list[Workout]) -> dict[str, Any]:
    linked_workout_original_id = ""
    if session.linked_workout_id:
        linked_workout = next((workout for workout in workouts if workout.id == session.linked_workout_id), None)
        linked_workout_original_id = (linked_workout.original_v1_id or linked_workout.id) if linked_workout else ""

    exported: dict[str, Any] = {
        "id": session.original_v1_id or session.id,
        "date": session.date.isoformat(),
        "type": session.type,
        "title": session.title,
        "status": session.status,
        "details": session.details_json,
        "actual": session.actual_json,
        "linkedWorkoutId": linked_workout_original_id,
        "phaseTemplateId": session.phase_template_id,
        "phaseInstanceId": session.phase_instance_id,
        "phaseSlotId": session.phase_slot_id,
        "phaseWeekIndex": session.phase_week_index,
        "generatedDate": session.generated_date.isoformat() if session.generated_date else None,
        "dateMovedManually": session.date_moved_manually,
        "modificationNote": session.modification_note,
        "createdAt": int(session.created_at.timestamp() * 1000),
    }
    return exported


def imports_error(code: str, message: str, status_code: int) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"error": {"code": code, "message": message}},
    )
