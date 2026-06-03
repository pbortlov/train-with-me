from datetime import datetime

from pydantic import BaseModel


class CoachInviteResponse(BaseModel):
    token: str
    training_space_id: str
    training_space_name: str
    expires_at: datetime
    accepted_at: datetime | None


class CoachInviteAcceptResponse(BaseModel):
    training_space_id: str
    training_space_name: str
    role: str
