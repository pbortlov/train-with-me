from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator

TargetEntityType = Literal["workout"]


class CoachSuggestionCreateRequest(BaseModel):
    target_entity_type: TargetEntityType
    target_entity_id: str = Field(min_length=1, max_length=36)
    suggested_change_json: dict[str, Any]

    @model_validator(mode="after")
    def validate_suggested_change(self) -> "CoachSuggestionCreateRequest":
        if self.target_entity_type == "workout" and "notes" not in self.suggested_change_json:
            raise ValueError("Workout suggestions must include notes.")
        return self


class CoachSuggestionResponse(BaseModel):
    id: str
    training_space_id: str
    target_entity_type: str
    target_entity_id: str
    suggested_change_json: dict[str, Any]
    status: str
    created_by_user_id: str
    resolved_by_user_id: str | None
    resolved_at: datetime | None
    created_at: datetime
