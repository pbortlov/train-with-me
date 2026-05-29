from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


class ProgramTemplateCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    duration_weeks: int = Field(ge=1, le=52)
    template_json: dict[str, Any] = Field(default_factory=dict)
    notes: str = ""

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        return value.strip()


class ProgramTemplateUpdateRequest(ProgramTemplateCreateRequest):
    pass


class ProgramTemplateResponse(BaseModel):
    id: str
    training_space_id: str
    name: str
    duration_weeks: int
    template_json: dict[str, Any]
    notes: str
    created_at: datetime
    updated_at: datetime


class ProgramScheduleRequest(BaseModel):
    start_date: date | None = None


class ProgramInstanceResponse(BaseModel):
    id: str
    training_space_id: str
    template_id: str
    template_name: str
    start_date: date
    duration_weeks: int
    generated_session_ids: list[str]
    created_at: datetime
