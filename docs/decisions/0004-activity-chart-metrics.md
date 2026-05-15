# 0004: Activity chart metrics

## Context

The Stats page previously used progress-over-time charts with mixed trend semantics, including run pace and sprint best time. The desired Stats view is simpler: one chart for each activity, with each logged entry visible as its own column.

## Decision

Stats uses per-activity metrics:

- Strength shows a highest-weight table by exercise instead of a column chart. Each row shows the exercise name, highest numeric kg set, and the date it happened.
- Run plots run pace in minutes per kilometer.
- Sprint plots best set speed in meters per second.

Run and sprint use workout date on the X axis and render as column charts. Duplicate same-day entries remain separate while displaying the workout date as the visible label.

The chart period selector applies only to charted activities. Strength uses explicit filters only, so Period does not affect the highest-weight table. Summary and Workout History continue to use only explicit filters so the default chart period does not hide older workouts from shared views.

Run pace and sprint time goals remain tracked in goal progress and history, but are not overlaid on these activity charts because their units do not match the chart metrics.

## Consequences

- Strength is easier to scan by exercise because the metric is no longer compressed into one workout-level column.
- Sprint progress emphasizes speed instead of shortest time, which makes different sprint distances more comparable.
- Goal achievement logic remains unchanged, but goal overlays are omitted from activity charts until compatible metric-specific overlays are introduced.
