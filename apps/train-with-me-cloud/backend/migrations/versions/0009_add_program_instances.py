"""add program instances

Revision ID: 0009_add_program_instances
Revises: 0008_add_program_templates
Create Date: 2026-05-27
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0009_add_program_instances"
down_revision: str | None = "0008_add_program_templates"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "program_instances",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("training_space_id", sa.String(length=36), nullable=False),
        sa.Column("template_id", sa.String(length=36), nullable=False),
        sa.Column("template_name", sa.String(length=160), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("duration_weeks", sa.Integer(), nullable=False),
        sa.Column("generated_session_ids", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["template_id"], ["program_templates.id"]),
        sa.ForeignKeyConstraint(["training_space_id"], ["training_spaces.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_program_instances_template_id", "program_instances", ["template_id"])
    op.create_index("ix_program_instances_training_space_id", "program_instances", ["training_space_id"])


def downgrade() -> None:
    op.drop_index("ix_program_instances_training_space_id", table_name="program_instances")
    op.drop_index("ix_program_instances_template_id", table_name="program_instances")
    op.drop_table("program_instances")
