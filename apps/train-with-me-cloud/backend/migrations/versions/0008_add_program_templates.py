"""add program templates

Revision ID: 0008_add_program_templates
Revises: 0007_add_training_goals
Create Date: 2026-05-27
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0008_add_program_templates"
down_revision: str | None = "0007_add_training_goals"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "program_templates",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("training_space_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("duration_weeks", sa.Integer(), nullable=False),
        sa.Column("template_json", sa.JSON(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["training_space_id"], ["training_spaces.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_program_templates_training_space_id", "program_templates", ["training_space_id"])


def downgrade() -> None:
    op.drop_index("ix_program_templates_training_space_id", table_name="program_templates")
    op.drop_table("program_templates")
