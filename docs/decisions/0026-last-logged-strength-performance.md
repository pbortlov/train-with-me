# 0026 - Show Last Logged Strength Performance in the Logger

- Date: 2026-08-20
- Status: accepted

## Context

Strength workouts already store each exercise's ordered sets, reps, and load.
Athletes should not need to remember those numbers before starting the next
session. The existing Strength Insights section is useful for review, but it
does not place the prior exercise result in the logging flow.

The current workout data has no reliable working-set, variation, equipment, or
recovery context. Treating historical sets as a progression prescription would
therefore overstate what the app knows.

## Decision

- When an athlete enters a known exercise in actual strength logging, show the
  latest matching strength workout's recorded set sequence and date.
- Match exercise names after trimming and case normalization. Ignore non-strength
  workouts. For same-day records, use the newer creation time.
- Show the highest kg set across matching strength history separately from the
  latest set sequence.
- Hide the card for a new or blank exercise name.
- Keep this slice presentation-only: do not create storage, targets, readiness
  suggestions, program changes, or automatic set copying.

## Consequences

- Athletes can begin the next session with concrete prior evidence while keeping
  full control of their new entry.
- The wording remains `Last time` and `Best kg set`, not `working set` or a
  progression verdict, until later slices collect the missing comparison context.
- Existing workouts and backups remain unchanged.
