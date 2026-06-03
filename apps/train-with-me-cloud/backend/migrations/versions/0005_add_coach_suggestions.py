"""add coach suggestions

Revision ID: 0005_add_coach_suggestions
Revises: 0004_add_planned_sessions
Create Date: 2026-05-22
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0005_add_coach_suggestions"
down_revision: str | None = "0004_add_planned_sessions"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "coach_suggestions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("training_space_id", sa.String(length=36), nullable=False),
        sa.Column("target_entity_type", sa.String(length=64), nullable=False),
        sa.Column("target_entity_id", sa.String(length=36), nullable=False),
        sa.Column("suggested_change_json", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_by_user_id", sa.String(length=36), nullable=False),
        sa.Column("resolved_by_user_id", sa.String(length=36), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["resolved_by_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["training_space_id"], ["training_spaces.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_coach_suggestions_created_by_user_id", "coach_suggestions", ["created_by_user_id"])
    op.create_index("ix_coach_suggestions_resolved_by_user_id", "coach_suggestions", ["resolved_by_user_id"])
    op.create_index("ix_coach_suggestions_target_entity_id", "coach_suggestions", ["target_entity_id"])
    op.create_index("ix_coach_suggestions_training_space_id", "coach_suggestions", ["training_space_id"])

    op.create_table(
        "audit_events",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("training_space_id", sa.String(length=36), nullable=False),
        sa.Column("actor_user_id", sa.String(length=36), nullable=False),
        sa.Column("event_type", sa.String(length=80), nullable=False),
        sa.Column("entity_type", sa.String(length=64), nullable=False),
        sa.Column("entity_id", sa.String(length=36), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["training_space_id"], ["training_spaces.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_events_actor_user_id", "audit_events", ["actor_user_id"])
    op.create_index("ix_audit_events_entity_id", "audit_events", ["entity_id"])
    op.create_index("ix_audit_events_training_space_id", "audit_events", ["training_space_id"])


def downgrade() -> None:
    op.drop_index("ix_audit_events_training_space_id", table_name="audit_events")
    op.drop_index("ix_audit_events_entity_id", table_name="audit_events")
    op.drop_index("ix_audit_events_actor_user_id", table_name="audit_events")
    op.drop_table("audit_events")
    op.drop_index("ix_coach_suggestions_training_space_id", table_name="coach_suggestions")
    op.drop_index("ix_coach_suggestions_target_entity_id", table_name="coach_suggestions")
    op.drop_index("ix_coach_suggestions_resolved_by_user_id", table_name="coach_suggestions")
    op.drop_index("ix_coach_suggestions_created_by_user_id", table_name="coach_suggestions")
    op.drop_table("coach_suggestions")
