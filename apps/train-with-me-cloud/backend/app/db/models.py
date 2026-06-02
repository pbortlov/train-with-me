from datetime import date, datetime, timezone
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
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


class PlannedSessionStatus(StrEnum):
    planned = "planned"
    completed = "completed"
    modified = "modified"
    missed = "missed"


class PlannedSessionSource(StrEnum):
    manual = "manual"
    phase_generated = "phase-generated"
    v1_import = "v1_import"


class CoachSuggestionStatus(StrEnum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class TrainingGoalActivity(StrEnum):
    strength = "strength"
    run = "run"
    sprint = "sprint"


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
    planned_sessions: Mapped[list["PlannedSession"]] = relationship(back_populates="training_space")
    coach_suggestions: Mapped[list["CoachSuggestion"]] = relationship(back_populates="training_space")
    audit_events: Mapped[list["AuditEvent"]] = relationship(back_populates="training_space")
    imported_v1_metadata: Mapped[list["ImportedV1Metadata"]] = relationship(back_populates="training_space")
    training_goals: Mapped[list["TrainingGoal"]] = relationship(back_populates="training_space")
    program_templates: Mapped[list["ProgramTemplate"]] = relationship(back_populates="training_space")
    program_instances: Mapped[list["ProgramInstance"]] = relationship(back_populates="training_space")


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


class PlannedSession(Base):
    __tablename__ = "planned_sessions"
    __table_args__ = (
        UniqueConstraint("training_space_id", "original_v1_id", name="uq_planned_sessions_space_original_v1_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    training_space_id: Mapped[str] = mapped_column(ForeignKey("training_spaces.id"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    phase_template_id: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    phase_instance_id: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    phase_slot_id: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    phase_week_index: Mapped[int | None] = mapped_column(Integer, nullable=True)
    generated_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    date_moved_manually: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    modification_note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    actual_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    details_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    linked_workout_id: Mapped[str | None] = mapped_column(ForeignKey("workouts.id"), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default=PlannedSessionStatus.planned.value)
    source: Mapped[str] = mapped_column(String(32), nullable=False, default=PlannedSessionSource.manual.value)
    coach_editable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    original_v1_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)

    training_space: Mapped[TrainingSpace] = relationship(back_populates="planned_sessions")
    linked_workout: Mapped[Workout | None] = relationship()


class CoachSuggestion(Base):
    __tablename__ = "coach_suggestions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    training_space_id: Mapped[str] = mapped_column(ForeignKey("training_spaces.id"), nullable=False, index=True)
    target_entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    target_entity_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    suggested_change_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default=CoachSuggestionStatus.pending.value)
    created_by_user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    resolved_by_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)

    training_space: Mapped[TrainingSpace] = relationship(back_populates="coach_suggestions")
    created_by: Mapped[User] = relationship(foreign_keys=[created_by_user_id])
    resolved_by: Mapped[User | None] = relationship(foreign_keys=[resolved_by_user_id])


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    training_space_id: Mapped[str] = mapped_column(ForeignKey("training_spaces.id"), nullable=False, index=True)
    actor_user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(80), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)

    training_space: Mapped[TrainingSpace] = relationship(back_populates="audit_events")
    actor: Mapped[User] = relationship()


class ImportedV1Metadata(Base):
    __tablename__ = "imported_v1_metadata"
    __table_args__ = (
        UniqueConstraint(
            "training_space_id",
            "entity_type",
            "original_v1_id",
            name="uq_imported_v1_metadata_space_type_original",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    training_space_id: Mapped[str] = mapped_column(ForeignKey("training_spaces.id"), nullable=False, index=True)
    entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    original_v1_id: Mapped[str] = mapped_column(String(128), nullable=False)
    payload_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    source: Mapped[str] = mapped_column(String(32), nullable=False, default="v1_import")
    coach_editable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)

    training_space: Mapped[TrainingSpace] = relationship(back_populates="imported_v1_metadata")


class TrainingGoal(Base):
    __tablename__ = "training_goals"
    __table_args__ = (
        UniqueConstraint("training_space_id", "activity", name="uq_training_goals_space_activity"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    training_space_id: Mapped[str] = mapped_column(ForeignKey("training_spaces.id"), nullable=False, index=True)
    activity: Mapped[str] = mapped_column(String(32), nullable=False)
    target_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    training_space: Mapped[TrainingSpace] = relationship(back_populates="training_goals")


class ProgramTemplate(Base):
    __tablename__ = "program_templates"
    __table_args__ = (
        UniqueConstraint("training_space_id", "original_v1_id", name="uq_program_templates_space_original_v1_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    training_space_id: Mapped[str] = mapped_column(ForeignKey("training_spaces.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    duration_weeks: Mapped[int] = mapped_column(Integer, nullable=False)
    template_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    original_v1_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    training_space: Mapped[TrainingSpace] = relationship(back_populates="program_templates")
    instances: Mapped[list["ProgramInstance"]] = relationship(back_populates="template")


class ProgramInstance(Base):
    __tablename__ = "program_instances"
    __table_args__ = (
        UniqueConstraint("training_space_id", "original_v1_id", name="uq_program_instances_space_original_v1_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    training_space_id: Mapped[str] = mapped_column(ForeignKey("training_spaces.id"), nullable=False, index=True)
    template_id: Mapped[str] = mapped_column(ForeignKey("program_templates.id"), nullable=False, index=True)
    template_name: Mapped[str] = mapped_column(String(160), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    duration_weeks: Mapped[int] = mapped_column(Integer, nullable=False)
    generated_session_ids: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    original_v1_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)

    training_space: Mapped[TrainingSpace] = relationship(back_populates="program_instances")
    template: Mapped[ProgramTemplate] = relationship(back_populates="instances")
