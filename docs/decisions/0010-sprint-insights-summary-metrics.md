# 0010 - Add Sprint Insights Summary Metrics

- Date: 2026-06-29
- Status: accepted

## Context

Sprint charts already plot every sprint rep time, and sprint goals are
distance-specific. Athletes also need a fast sprint overview that respects the
fact that sprint times are only comparable at the same distance.

## Decision

- Add Sprint Insights as a presentation-only section in Stats.
- Summarize sprint workout count, total valid reps, unique distances, latest
  sprint date, overall fastest rep, distance-specific best times, recent
  sessions, and session feeling counts.
- Treat distance-specific bests as the trustworthy record metric.
- Show overall fastest rep only as a quick highlight, not as a cross-distance
  performance ranking.
- Keep existing sprint goal semantics, Sprint chart behavior, storage keys, and
  backup shape unchanged.

## Consequences

- Athletes can see sprint volume and bests without reading the detailed chart.
- Sprint records remain distance-specific, avoiding misleading comparisons
  between different sprint distances.
- Later sprint MVPs can add trend charts or feeling analysis, but must document
  any new metric semantics separately.
