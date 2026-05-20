"""initial user and training space schema

Revision ID: 0001_initial_user_training_space_schema
Revises: 
Create Date: 2026-05-20
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0001_initial_user_training_space_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "training_spaces",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("owner_user_id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_training_spaces_owner_user_id", "training_spaces", ["owner_user_id"])

    op.create_table(
        "training_space_memberships",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("training_space_id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["training_space_id"], ["training_spaces.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "training_space_id",
            "user_id",
            name="uq_training_space_memberships_space_user",
        ),
    )
    op.create_index(
        "ix_training_space_memberships_training_space_id",
        "training_space_memberships",
        ["training_space_id"],
    )
    op.create_index("ix_training_space_memberships_user_id", "training_space_memberships", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_training_space_memberships_user_id", table_name="training_space_memberships")
    op.drop_index(
        "ix_training_space_memberships_training_space_id",
        table_name="training_space_memberships",
    )
    op.drop_table("training_space_memberships")
    op.drop_index("ix_training_spaces_owner_user_id", table_name="training_spaces")
    op.drop_table("training_spaces")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
