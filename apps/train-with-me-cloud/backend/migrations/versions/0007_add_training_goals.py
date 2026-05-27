"""add training goals

Revision ID: 0007_add_training_goals
Revises: 0006_add_imported_v1_metadata
Create Date: 2026-05-27
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0007_add_training_goals"
down_revision: str | None = "0006_add_imported_v1_metadata"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "training_goals",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("training_space_id", sa.String(length=36), nullable=False),
        sa.Column("activity", sa.String(length=32), nullable=False),
        sa.Column("target_json", sa.JSON(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["training_space_id"], ["training_spaces.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("training_space_id", "activity", name="uq_training_goals_space_activity"),
    )
    op.create_index("ix_training_goals_training_space_id", "training_goals", ["training_space_id"])


def downgrade() -> None:
    op.drop_index("ix_training_goals_training_space_id", table_name="training_goals")
    op.drop_table("training_goals")
