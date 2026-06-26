# 0007 - Add Progress Hub Over Existing Metrics

- Date: 2026-06-25
- Status: accepted

## Context

Stats already contains goals, adherence, program progress, and activity charts,
but mobile users need a faster top-level answer before drilling into detail.
The product needs a progress overview without redefining adherence, goal, or
activity-chart semantics.

## Decision

- Add a Progress Hub at the top of Stats.
- Summarize existing local data: total workouts, last workout date, training
  mix, planned-session completion, active goals, and achieved goals.
- Keep goals, adherence, program progress, and activity charts as the detailed
  source sections below the hub.
- Add hub shortcuts that scroll to existing detail sections.
- Do not add new storage keys, backup fields, synced state, or new metric
  definitions.

## Consequences

- Athletes get a faster mobile progress overview.
- Existing statistics remain the source of detail and keep their current
  meanings.
- The hub must stay presentation-only unless a later MVP explicitly changes
  metric semantics with tests and documentation.
