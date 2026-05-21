"""add coach invites

Revision ID: 0002_add_coach_invites
Revises: 0001_initial_user_training_space_schema
Create Date: 2026-05-21
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0002_add_coach_invites"
down_revision: str | None = "0001_initial_user_training_space_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "coach_invites",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("training_space_id", sa.String(length=36), nullable=False),
        sa.Column("token", sa.String(length=128), nullable=False),
        sa.Column("created_by_user_id", sa.String(length=36), nullable=False),
        sa.Column("accepted_by_user_id", sa.String(length=36), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["accepted_by_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["training_space_id"], ["training_spaces.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token"),
    )
    op.create_index("ix_coach_invites_accepted_by_user_id", "coach_invites", ["accepted_by_user_id"])
    op.create_index("ix_coach_invites_created_by_user_id", "coach_invites", ["created_by_user_id"])
    op.create_index("ix_coach_invites_token", "coach_invites", ["token"])
    op.create_index("ix_coach_invites_training_space_id", "coach_invites", ["training_space_id"])


def downgrade() -> None:
    op.drop_index("ix_coach_invites_training_space_id", table_name="coach_invites")
    op.drop_index("ix_coach_invites_token", table_name="coach_invites")
    op.drop_index("ix_coach_invites_created_by_user_id", table_name="coach_invites")
    op.drop_index("ix_coach_invites_accepted_by_user_id", table_name="coach_invites")
    op.drop_table("coach_invites")
