from datetime import datetime, timezone
from enum import StrEnum
from uuid import uuid4

from datetime import date

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
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


class WorkoutActivity(StrEnum):
    strength = "strength"
    run = "run"
    sprint = "sprint"


class WorkoutSource(StrEnum):
    manual = "manual"
    v1_import = "v1_import"


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
    workouts: Mapped[list["Workout"]] = relationship(back_populates="training_space")


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


class Workout(Base):
    __tablename__ = "workouts"
    __table_args__ = (
        UniqueConstraint("training_space_id", "original_v1_id", name="uq_workouts_space_original_v1_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    training_space_id: Mapped[str] = mapped_column(ForeignKey("training_spaces.id"), nullable=False, index=True)
    activity: Mapped[str] = mapped_column(String(32), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    distance: Mapped[float | None] = mapped_column(Float, nullable=True)
    time: Mapped[str | None] = mapped_column(String(32), nullable=True)
    pace: Mapped[float | None] = mapped_column(Float, nullable=True)
    sprint_feeling: Mapped[str | None] = mapped_column(String(64), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    source: Mapped[str] = mapped_column(String(32), nullable=False, default=WorkoutSource.manual.value)
    coach_editable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    original_v1_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)

    training_space: Mapped[TrainingSpace] = relationship(back_populates="workouts")
    strength_exercises: Mapped[list["WorkoutStrengthExercise"]] = relationship(
        back_populates="workout",
        cascade="all, delete-orphan",
    )
    sprint_sets: Mapped[list["SprintSet"]] = relationship(back_populates="workout", cascade="all, delete-orphan")


class WorkoutStrengthExercise(Base):
    __tablename__ = "workout_strength_exercises"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    workout_id: Mapped[str] = mapped_column(ForeignKey("workouts.id"), nullable=False, index=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)

    workout: Mapped[Workout] = relationship(back_populates="strength_exercises")
    sets: Mapped[list["WorkoutSet"]] = relationship(back_populates="strength_exercise", cascade="all, delete-orphan")


class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    strength_exercise_id: Mapped[str] = mapped_column(ForeignKey("workout_strength_exercises.id"), nullable=False, index=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    reps: Mapped[int] = mapped_column(Integer, nullable=False)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    load_type: Mapped[str] = mapped_column(String(32), nullable=False, default="kg")
    band_color: Mapped[str] = mapped_column(String(32), nullable=False, default="")

    strength_exercise: Mapped[WorkoutStrengthExercise] = relationship(back_populates="sets")


class SprintSet(Base):
    __tablename__ = "sprint_sets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    workout_id: Mapped[str] = mapped_column(ForeignKey("workouts.id"), nullable=False, index=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    distance_m: Mapped[int] = mapped_column(Integer, nullable=False)
    time_sec: Mapped[float] = mapped_column(Float, nullable=False)

    workout: Mapped[Workout] = relationship(back_populates="sprint_sets")
