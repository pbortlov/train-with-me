from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator, model_validator

PlannedSessionType = Literal["run", "sprint", "strength"]
PlannedSessionStatusValue = Literal["planned", "completed", "modified", "missed"]
PlannedSessionSourceValue = Literal["manual", "phase-generated", "v1_import"]


class PlannedSessionCreateRequest(BaseModel):
    type: PlannedSessionType
    title: str = Field(min_length=1, max_length=160)
    date: date
    phase_template_id: str = Field(default="", max_length=128)
    phase_instance_id: str = Field(default="", max_length=128)
    phase_slot_id: str = Field(default="", max_length=128)
    phase_week_index: int | None = None
    generated_date: date | None = None
    date_moved_manually: bool = False
    modification_note: str = ""
    actual_json: dict[str, Any] | None = None
    details_json: dict[str, Any] = Field(default_factory=dict)
    linked_workout_id: str | None = None
    status: PlannedSessionStatusValue = "planned"
    source: PlannedSessionSourceValue = "manual"
    coach_editable: bool = True
    original_v1_id: str | None = Field(default=None, max_length=128)

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def validate_generated_metadata(self) -> "PlannedSessionCreateRequest":
        if self.source == "phase-generated" and not self.generated_date:
            raise ValueError("Phase-generated planned sessions require generated_date.")
        return self


class PlannedSessionResponse(BaseModel):
    id: str
    training_space_id: str
    type: str
    title: str
    date: date
    phase_template_id: str
    phase_instance_id: str
    phase_slot_id: str
    phase_week_index: int | None
    generated_date: date | None
    date_moved_manually: bool
    modification_note: str
    actual_json: dict[str, Any] | None
    details_json: dict[str, Any]
    linked_workout_id: str | None
    status: str
    source: str
    coach_editable: bool
    original_v1_id: str | None
    created_at: datetime
