# 0019 - Compare Sprint Session Bests by Profile and Distance

- Date: 2026-07-29
- Status: accepted

## Context

Sprint Insights shows distance-specific records, but the existing rep chart
still places different distances on one axis. Athletes need a focused way to
answer whether a repeated sprint training type is improving without comparing
10 m, 40 m, and 100 m times.

## Decision

- Add Sprint Performance as a focused dialog opened from the existing Sprint
  card in Stats, rather than expanding the main Stats page or adding a primary
  navigation item.
- Require a session profile and exact sprint distance. Each chart point is the
  fastest valid rep at that distance within one workout.
- Display a chronological line chart, latest best, change versus the previous
  comparable session, all-time best, and a session-best evidence table.
- Default surface and slope filters to all values, show the context on every
  session, and warn when selected sessions mix surface or slope contexts.
- Do not convert, estimate, or rank times across different distances,
  profiles, surfaces, or slopes.

## Consequences

- Athletes can see a clear best-time trend for a chosen sprint training type.
- Coaches can narrow the history to a matched surface and slope when needed.
- Rep-consistency and actual-rest analysis remain separate incremental MVPs.
