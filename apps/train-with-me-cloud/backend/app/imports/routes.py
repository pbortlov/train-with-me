from typing import Any

from fastapi import APIRouter, Body

from app.imports.schemas import V1BackupSummaryResponse, V1ImportPreviewResponse
from app.imports.v1_parser import V1BackupParseError, parse_v1_backup_summary

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
