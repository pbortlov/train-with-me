# 0004: Activity chart metrics

## Context

The Stats page previously used progress-over-time charts with mixed trend semantics, including run pace and sprint best time. The desired Stats view is simpler: one chart for each activity, with each logged entry visible as its own column.

## Decision

Stats uses three per-entry activity charts:

- Strength plots best workout weight in kilograms.
- Run plots actual run distance in kilometers.
- Sprint plots best set speed in meters per second.

All three charts use workout date on the X axis and render as column charts. Duplicate same-day entries remain separate with suffixed labels such as `2026-05-13 #2`.

Run pace and sprint time goals remain tracked in goal progress and history, but are not overlaid on these activity charts because their units do not match the chart metrics.

## Consequences

- The Stats chart area is easier to scan because each activity has exactly one chart.
- Sprint progress emphasizes speed instead of shortest time, which makes different sprint distances more comparable.
- Goal achievement logic remains unchanged, but goal overlays are omitted from activity charts until compatible metric-specific overlays are introduced.
