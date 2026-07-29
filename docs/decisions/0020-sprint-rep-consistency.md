# 0020 - Show Sprint Rep Consistency Within Comparable Sessions

- Date: 2026-07-29
- Status: accepted

## Context

A session-best trend can show progress between sessions, but it cannot explain
whether the athlete warmed into the work, repeated consistently, or slowed
across reps. Sprint reps already have a saved order, enabling a complementary
within-session view.

## Decision

- Add Rep Consistency beneath the session-best progression in Sprint
  Performance.
- Use the same selected profile, distance, surface, and slope filters as the
  progression chart.
- Draw the latest matching session in rep order and show its date in tooltips.
- List all matching sessions with first rep, best rep, last rep, and the signed
  first-to-last time change; expand the latest session by default.
- Describe patterns as evidence only. Do not infer readiness, fatigue, injury,
  or a training prescription.

## Consequences

- Athletes and coaches can inspect the shape of a sprint session without
  comparing unlike distances or training contexts.
- Actual rest and recovery guidance remain a separate MVP once rest data exists.
