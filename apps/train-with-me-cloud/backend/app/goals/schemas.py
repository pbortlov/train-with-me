from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


GoalActivity = Literal["strength", "run", "sprint"]


class TrainingGoalUpsertRequest(BaseModel):
    target_json: dict[str, Any] = Field(default_factory=dict)
    notes: str = ""


class TrainingGoalResponse(BaseModel):
    id: str
    training_space_id: str
    activity: str
    target_json: dict[str, Any]
    notes: str
    created_at: datetime
    updated_at: datetime
