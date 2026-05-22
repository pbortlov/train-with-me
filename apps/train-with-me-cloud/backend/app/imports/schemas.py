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
