"""add planned sessions

Revision ID: 0004_add_planned_sessions
Revises: 0003_add_workout_logging_schema
Create Date: 2026-05-22
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0004_add_planned_sessions"
down_revision: str | None = "0003_add_workout_logging_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "planned_sessions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("training_space_id", sa.String(length=36), nullable=False),
        sa.Column("type", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("phase_template_id", sa.String(length=128), nullable=False),
        sa.Column("phase_instance_id", sa.String(length=128), nullable=False),
        sa.Column("phase_slot_id", sa.String(length=128), nullable=False),
        sa.Column("phase_week_index", sa.Integer(), nullable=True),
        sa.Column("generated_date", sa.Date(), nullable=True),
        sa.Column("date_moved_manually", sa.Boolean(), nullable=False),
        sa.Column("modification_note", sa.Text(), nullable=False),
        sa.Column("actual_json", sa.JSON(), nullable=True),
        sa.Column("details_json", sa.JSON(), nullable=False),
        sa.Column("linked_workout_id", sa.String(length=36), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("source", sa.String(length=32), nullable=False),
        sa.Column("coach_editable", sa.Boolean(), nullable=False),
        sa.Column("original_v1_id", sa.String(length=128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["linked_workout_id"], ["workouts.id"]),
        sa.ForeignKeyConstraint(["training_space_id"], ["training_spaces.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("training_space_id", "original_v1_id", name="uq_planned_sessions_space_original_v1_id"),
    )
    op.create_index("ix_planned_sessions_linked_workout_id", "planned_sessions", ["linked_workout_id"])
    op.create_index("ix_planned_sessions_training_space_id", "planned_sessions", ["training_space_id"])


def downgrade() -> None:
    op.drop_index("ix_planned_sessions_training_space_id", table_name="planned_sessions")
    op.drop_index("ix_planned_sessions_linked_workout_id", table_name="planned_sessions")
    op.drop_table("planned_sessions")
