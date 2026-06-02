from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class V1BackupSummaryResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    version: int | None
    exported_at: str | None = Field(alias="exportedAt")
    workout_count: int = Field(alias="workoutCount")
    planned_session_count: int = Field(alias="plannedSessionCount")
    goal_count: int = Field(alias="goalCount")
    phase_template_count: int = Field(alias="phaseTemplateCount")
    phase_instance_count: int = Field(alias="phaseInstanceCount")


class V1ImportPreviewResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    valid: bool
    summary: V1BackupSummaryResponse | None
    warnings: list[str]
    unsupported_fields: list[str] = Field(alias="unsupportedFields")


class V1ImportCommitRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    training_space_id: str = Field(alias="trainingSpaceId")
    backup: dict[str, Any]


class V1ImportCommitResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    imported_workout_count: int = Field(alias="importedWorkoutCount")
    skipped_workout_count: int = Field(alias="skippedWorkoutCount")
    existing_workout_count: int = Field(alias="existingWorkoutCount")
    imported_planned_session_count: int = Field(alias="importedPlannedSessionCount")
    skipped_planned_session_count: int = Field(alias="skippedPlannedSessionCount")
    existing_planned_session_count: int = Field(alias="existingPlannedSessionCount")
    imported_goal_count: int = Field(alias="importedGoalCount")
    existing_goal_count: int = Field(alias="existingGoalCount")
    imported_phase_template_count: int = Field(alias="importedPhaseTemplateCount")
    existing_phase_template_count: int = Field(alias="existingPhaseTemplateCount")
    imported_phase_instance_count: int = Field(alias="importedPhaseInstanceCount")
    existing_phase_instance_count: int = Field(alias="existingPhaseInstanceCount")
    warnings: list[str]


class V1BackfillResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    linked_planned_session_count: int = Field(alias="linkedPlannedSessionCount")


class ImportedV1MetadataResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    entity_type: str = Field(alias="entityType")
    original_v1_id: str = Field(alias="originalV1Id")
    payload: dict[str, Any]
