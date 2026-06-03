from pydantic import BaseModel, Field, field_validator


class TrainingSpaceCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        return value.strip()


class TrainingSpaceResponse(BaseModel):
    id: str
    name: str
    owner_user_id: str
    my_role: str
