from datetime import datetime, timezone
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def new_id() -> str:
    return str(uuid4())


class TrainingSpaceRole(StrEnum):
    owner = "owner"
    athlete = "athlete"
    coach = "coach"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    owned_training_spaces: Mapped[list["TrainingSpace"]] = relationship(back_populates="owner")
    memberships: Mapped[list["TrainingSpaceMembership"]] = relationship(back_populates="user")


class TrainingSpace(Base):
    __tablename__ = "training_spaces"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    owner_user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    owner: Mapped[User] = relationship(back_populates="owned_training_spaces")
    memberships: Mapped[list["TrainingSpaceMembership"]] = relationship(back_populates="training_space")
    coach_invites: Mapped[list["CoachInvite"]] = relationship(back_populates="training_space")


class TrainingSpaceMembership(Base):
    __tablename__ = "training_space_memberships"
    __table_args__ = (
        UniqueConstraint("training_space_id", "user_id", name="uq_training_space_memberships_space_user"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    training_space_id: Mapped[str] = mapped_column(ForeignKey("training_spaces.id"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)

    training_space: Mapped[TrainingSpace] = relationship(back_populates="memberships")
    user: Mapped[User] = relationship(back_populates="memberships")


class CoachInvite(Base):
    __tablename__ = "coach_invites"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    training_space_id: Mapped[str] = mapped_column(ForeignKey("training_spaces.id"), nullable=False, index=True)
    token: Mapped[str] = mapped_column(String(128), nullable=False, unique=True, index=True)
    created_by_user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    accepted_by_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)

    training_space: Mapped[TrainingSpace] = relationship(back_populates="coach_invites")
    created_by: Mapped[User] = relationship(foreign_keys=[created_by_user_id])
    accepted_by: Mapped[User | None] = relationship(foreign_keys=[accepted_by_user_id])
