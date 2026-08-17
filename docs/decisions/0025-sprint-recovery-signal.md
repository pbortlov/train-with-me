# 0025 - Present Sprint Recovery as a Data-Gated Signal

- Date: 2026-07-30
- Status: accepted

## Context

Actual rest is now recorded before sprint reps. Athletes and coaches need a
useful indication of whether one observed rest duration has produced faster
times than another, without mistaking sparse or mixed-context logs for proof.

## Decision

- Analyse only one exact sprint profile, distance, surface, and slope at a
  time. All-context selections keep the recovery panel in collection mode.
- Require at least eight actual-rest-to-next-rep pairs across three sessions
  before comparing recovery durations.
- Round actual rests into 30-second bands, and only compare bands with at least
  three reps across two sessions.
- Use median sprint time for each band. Show a best-supported signal only when
  it is at least 0.05 seconds and 1% faster than the next supported band.
- Otherwise say that there is no clear recovery edge and continue collecting
  data. Present the evidence and an explicit contextual caveat with every
  signal.

## Consequences

- The recommendation remains understandable for athletes while exposing its
  sample size to coaches.
- Older workouts remain valid; they simply do not contribute pairs until actual
  rest is logged.
- The app does not prescribe a universal rest interval or infer causation from
  a small number of sessions.
