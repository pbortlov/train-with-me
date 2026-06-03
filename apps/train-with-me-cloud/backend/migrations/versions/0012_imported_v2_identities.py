"""add imported v2 identities

Revision ID: 0012_imported_v2_identities
Revises: 0011_program_instance_v1_id
Create Date: 2026-06-02
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0012_imported_v2_identities"
down_revision: str | None = "0011_program_instance_v1_id"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "imported_v2_identities",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("training_space_id", sa.String(length=36), nullable=False),
        sa.Column("entity_type", sa.String(length=64), nullable=False),
        sa.Column("source_id", sa.String(length=128), nullable=False),
        sa.Column("target_id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["training_space_id"], ["training_spaces.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "training_space_id",
            "entity_type",
            "source_id",
            name="uq_imported_v2_identities_space_type_source",
        ),
    )
    op.create_index("ix_imported_v2_identities_training_space_id", "imported_v2_identities", ["training_space_id"])
    op.create_index("ix_imported_v2_identities_target_id", "imported_v2_identities", ["target_id"])


def downgrade() -> None:
    op.drop_index("ix_imported_v2_identities_target_id", table_name="imported_v2_identities")
    op.drop_index("ix_imported_v2_identities_training_space_id", table_name="imported_v2_identities")
    op.drop_table("imported_v2_identities")
