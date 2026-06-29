# 0009 - Add Running Insights Summary Metrics

- Date: 2026-06-29
- Status: accepted

## Context

The existing Stats page charts each run pace entry, and run goals already use
distance plus target time semantics. Athletes also need a fast run-specific
overview without changing goal achievement or chart behavior.

## Decision

- Add Running Insights as a presentation-only section in Stats.
- Summarize run count, latest run date, total distance, longest run, best pace,
  weighted average pace, total run time, and recent valid-distance runs.
- Calculate average pace from total valid duration divided by total valid
  distance, rather than averaging per-run pace values.
- Use existing stored pace when a run has no valid duration but does have a
  valid pace.
- Keep existing run goal semantics, activity chart behavior, storage keys, and
  backup shape unchanged.

## Consequences

- Athletes get a clearer running overview before opening the detailed pace
  chart.
- Average pace remains distance-weighted and is not distorted by short runs
  counting equally with long runs.
- Runs without valid distance are excluded from Running Insights summaries.
