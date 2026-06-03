# V2 MVP Scope

V2 is a separate cloud-backed Train With Me app built next to the current static
GitHub Pages app. The MVP should preserve the V1 training concepts while adding
accounts, training spaces, coach collaboration, database persistence, and V1
backup import.

## In Scope

- React, Vite, TypeScript, and PWA frontend under `apps/train-with-me-cloud/`.
- FastAPI backend under `apps/train-with-me-cloud/`.
- PostgreSQL persistence.
- Local container workflow before OpenShift deployment.
- User registration and login.
- Owner-created training spaces.
- Coach invites and coach memberships.
- Workout history for strength, run, and sprint.
- Planned sessions with V1-compatible metadata.
- Coach suggestions that athletes accept or reject.
- Audit events for important changes.
- V1 backup preview before import commit.
- Idempotent V1 import for historical workouts, planned sessions, goals, and
  phase metadata.

## V1 Compatibility Scope

The V2 MVP must understand these V1 backup entities:

- `workouts`
- `goals`
- `plannedSessions`
- `phaseTemplates`
- `phaseInstances`
- `uiSettings`

Imported historical rows should retain their original V1 identifiers and be
marked as not coach-editable.

## Initial Success Criteria

- V1 remains deployable from the repository root.
- V2 can run locally with containers.
- Backend tests cover health checks, permissions, imports, and core entities.
- Frontend can authenticate, select a training space, and show workouts and
  planned sessions.
- V1 backup import supports preview before commit and can be rerun safely.

## Revert Notes

This document is architecture planning only and can be reverted independently.
