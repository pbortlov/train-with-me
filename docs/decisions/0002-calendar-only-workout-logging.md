# 0002: Calendar-only add training workflow

## Status
Accepted

## Context
Workout logging was split across Calendar and Review. Calendar handled planned session completion through `Log & Complete`, while Review also exposed a standalone `Log Actual Workout` form. Moving the logger to Calendar removed that split, but left two adjacent Calendar forms: one for actual workout logs and one for manual plans.

## Decision
Calendar is the single operational surface for adding training.

- `Add Training` has two modes: `Log actual` and `Plan session`.
- `Log actual` is the unified standalone logger for strength, run, and sprint.
- `Log actual` creates actual-only `workout` records and does not create `plannedSession` records.
- `Plan session` creates manual run/sprint `plannedSession` records.
- Strength planning remains program-based in Programs.
- `Log & Complete` remains the completion flow for planned sessions and is the only way planned training updates adherence and program progress.
- Review is read-only and only compares planned vs actual outcomes for completed, modified, and missed planned sessions.
- Workout history management lives outside Review.

## Consequences
- Standalone strength logs can be used independently from strength programming.
- Program adherence remains based only on planned sessions.
- Calendar avoids duplicate top-level forms for planning vs logging.
- Calendar must avoid showing linked completion workouts as duplicate standalone workout cards.
