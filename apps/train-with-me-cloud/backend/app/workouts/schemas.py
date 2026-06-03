from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

Activity = Literal["strength", "run", "sprint"]
LoadType = Literal["kg", "bodyweight", "band"]


class WorkoutSetPayload(BaseModel):
    reps: int = Field(ge=0)
    weight: float | None = Field(default=None, ge=0)
    load_type: LoadType = "kg"
    band_color: str = Field(default="", max_length=32)


class StrengthExercisePayload(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    sets: list[WorkoutSetPayload] = Field(min_length=1)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        return value.strip()


class SprintSetPayload(BaseModel):
    distance_m: int = Field(gt=0)
    time_sec: float = Field(gt=0)


class WorkoutCreateRequest(BaseModel):
    activity: Activity
    date: date
    distance: float | None = Field(default=None, gt=0)
    time: str | None = Field(default=None, max_length=32)
    pace: float | None = Field(default=None, gt=0)
    sprint_feeling: str | None = Field(default=None, max_length=64)
    sprint_sets: list[SprintSetPayload] = Field(default_factory=list)
    strength_exercises: list[StrengthExercisePayload] = Field(default_factory=list)
    notes: str = ""

    @model_validator(mode="after")
    def validate_activity_payload(self) -> "WorkoutCreateRequest":
        if self.activity == "strength" and not self.strength_exercises:
            raise ValueError("Strength workouts require at least one strength exercise.")
        if self.activity == "run" and (self.distance is None or not self.time or self.pace is None):
            raise ValueError("Run workouts require distance, time, and pace.")
        if self.activity == "sprint" and not self.sprint_sets:
            raise ValueError("Sprint workouts require at least one sprint set.")
        return self


class WorkoutUpdateRequest(BaseModel):
    notes: str = ""


class WorkoutSetResponse(BaseModel):
    order: int
    reps: int
    weight: float | None
    load_type: str
    band_color: str


class StrengthExerciseResponse(BaseModel):
    order: int
    name: str
    sets: list[WorkoutSetResponse]


class SprintSetResponse(BaseModel):
    order: int
    distance_m: int
    time_sec: float


class WorkoutResponse(BaseModel):
    id: str
    training_space_id: str
    activity: str
    date: date
    distance: float | None
    time: str | None
    pace: float | None
    sprint_feeling: str | None
    sprint_sets: list[SprintSetResponse]
    strength_exercises: list[StrengthExerciseResponse]
    notes: str
    source: str
    coach_editable: bool
    original_v1_id: str | None
    created_at: datetime
