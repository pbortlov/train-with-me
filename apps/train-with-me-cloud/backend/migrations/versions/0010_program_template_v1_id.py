"""add program template v1 identity

Revision ID: 0010_program_template_v1_id
Revises: 0009_add_program_instances
Create Date: 2026-06-01
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0010_program_template_v1_id"
down_revision: str | None = "0009_add_program_instances"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("program_templates") as batch_op:
        batch_op.add_column(sa.Column("original_v1_id", sa.String(length=128), nullable=True))
        batch_op.create_unique_constraint(
            "uq_program_templates_space_original_v1_id",
            ["training_space_id", "original_v1_id"],
        )


def downgrade() -> None:
    with op.batch_alter_table("program_templates") as batch_op:
        batch_op.drop_constraint("uq_program_templates_space_original_v1_id", type_="unique")
        batch_op.drop_column("original_v1_id")
