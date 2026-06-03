"""add workout logging schema

Revision ID: 0003_add_workout_logging_schema
Revises: 0002_add_coach_invites
Create Date: 2026-05-21
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0003_add_workout_logging_schema"
down_revision: str | None = "0002_add_coach_invites"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "workouts",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("training_space_id", sa.String(length=36), nullable=False),
        sa.Column("activity", sa.String(length=32), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("distance", sa.Float(), nullable=True),
        sa.Column("time", sa.String(length=32), nullable=True),
        sa.Column("pace", sa.Float(), nullable=True),
        sa.Column("sprint_feeling", sa.String(length=64), nullable=True),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("source", sa.String(length=32), nullable=False),
        sa.Column("coach_editable", sa.Boolean(), nullable=False),
        sa.Column("original_v1_id", sa.String(length=128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["training_space_id"], ["training_spaces.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("training_space_id", "original_v1_id", name="uq_workouts_space_original_v1_id"),
    )
    op.create_index("ix_workouts_training_space_id", "workouts", ["training_space_id"])

    op.create_table(
        "workout_strength_exercises",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("workout_id", sa.String(length=36), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.ForeignKeyConstraint(["workout_id"], ["workouts.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_workout_strength_exercises_workout_id", "workout_strength_exercises", ["workout_id"])

    op.create_table(
        "sprint_sets",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("workout_id", sa.String(length=36), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("distance_m", sa.Integer(), nullable=False),
        sa.Column("time_sec", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["workout_id"], ["workouts.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_sprint_sets_workout_id", "sprint_sets", ["workout_id"])

    op.create_table(
        "workout_sets",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("strength_exercise_id", sa.String(length=36), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("reps", sa.Integer(), nullable=False),
        sa.Column("weight", sa.Float(), nullable=True),
        sa.Column("load_type", sa.String(length=32), nullable=False),
        sa.Column("band_color", sa.String(length=32), nullable=False),
        sa.ForeignKeyConstraint(["strength_exercise_id"], ["workout_strength_exercises.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_workout_sets_strength_exercise_id", "workout_sets", ["strength_exercise_id"])


def downgrade() -> None:
    op.drop_index("ix_workout_sets_strength_exercise_id", table_name="workout_sets")
    op.drop_table("workout_sets")
    op.drop_index("ix_sprint_sets_workout_id", table_name="sprint_sets")
    op.drop_table("sprint_sets")
    op.drop_index("ix_workout_strength_exercises_workout_id", table_name="workout_strength_exercises")
    op.drop_table("workout_strength_exercises")
    op.drop_index("ix_workouts_training_space_id", table_name="workouts")
    op.drop_table("workouts")
