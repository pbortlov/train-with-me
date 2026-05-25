"""add imported v1 metadata

Revision ID: 0006_add_imported_v1_metadata
Revises: 0005_add_coach_suggestions
Create Date: 2026-05-25
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0006_add_imported_v1_metadata"
down_revision: str | None = "0005_add_coach_suggestions"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "imported_v1_metadata",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("training_space_id", sa.String(length=36), nullable=False),
        sa.Column("entity_type", sa.String(length=64), nullable=False),
        sa.Column("original_v1_id", sa.String(length=128), nullable=False),
        sa.Column("payload_json", sa.JSON(), nullable=False),
        sa.Column("source", sa.String(length=32), nullable=False),
        sa.Column("coach_editable", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["training_space_id"], ["training_spaces.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "training_space_id",
            "entity_type",
            "original_v1_id",
            name="uq_imported_v1_metadata_space_type_original",
        ),
    )
    op.create_index("ix_imported_v1_metadata_training_space_id", "imported_v1_metadata", ["training_space_id"])


def downgrade() -> None:
    op.drop_index("ix_imported_v1_metadata_training_space_id", table_name="imported_v1_metadata")
    op.drop_table("imported_v1_metadata")
