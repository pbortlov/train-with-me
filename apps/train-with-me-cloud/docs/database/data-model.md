# Initial Data Model

This document sketches the starting V2 data model. It is not a migration file;
schema changes should be introduced later with focused Alembic migrations.

## Core Ownership

### `users`

- `id`
- `email`
- `password_hash`
- `display_name`
- `created_at`
- `updated_at`

### `training_spaces`

- `id`
- `name`
- `owner_user_id`
- `created_at`
- `updated_at`

### `training_space_memberships`

- `id`
- `training_space_id`
- `user_id`
- `role`: `owner`, `athlete`, or `coach`
- `created_at`

## Initial Migration

The first Alembic migration creates only the core ownership tables:

- `users`
- `training_spaces`
- `training_space_memberships`

Coach collaboration and training data tables are intentionally deferred to later
focused commits.

## Coach Collaboration

### `coach_invites`

- `id`
- `training_space_id`
- `token`
- `created_by_user_id`
- `accepted_by_user_id`
- `expires_at`
- `accepted_at`
- `created_at`

### `coach_suggestions`

- `id`
- `training_space_id`
- `target_entity_type`
- `target_entity_id`
- `suggested_change_json`
- `status`: `pending`, `accepted`, or `rejected`
- `created_by_user_id`
- `resolved_by_user_id`
- `resolved_at`
- `created_at`

### `audit_events`

- `id`
- `training_space_id`
- `actor_user_id`
- `event_type`
- `entity_type`
- `entity_id`
- `metadata_json`
- `created_at`

## Training Data

### `workouts`

Preserve V1 fields:

- `activity`
- `date`
- `distance`
- `time`
- `pace`
- `sprint_feeling`
- `notes`
- `created_at`

V2 import metadata:

- `source`
- `coach_editable`
- `original_v1_id`

Related child tables:

- `workout_strength_exercises`
- `workout_sets`
- `sprint_sets`

### `planned_sessions`

Preserve V1-compatible fields:

- `type`
- `title`
- `date`
- `phase_template_id`
- `phase_instance_id`
- `phase_slot_id`
- `phase_week_index`
- `generated_date`
- `date_moved_manually`
- `modification_note`
- `actual_json`
- `details_json`
- `created_at`

V2 fields:

- `linked_workout_id`
- `status`
- `source`
- `coach_editable`
- `original_v1_id`

## Date And Time Rules

- Training dates are date-only fields.
- Audit and system timestamps are UTC timestamps.
- Imported V1 millisecond timestamps should be converted explicitly.

## Revert Notes

This document is a planning artifact. Later schema commits should include their
own migration and rollback notes.
