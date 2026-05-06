# 0003: Run and sprint goal achievement

- Date: 2026-05-06
- Status: accepted

## Context
Stats already had simple goal values and run/sprint charts, but goals were not connected to the charted workouts. Goals also had no set date, so the app could not show how long a target took to achieve.

Run goals need to support race-style targets such as `5 km under 22:00`, where both distance and time matter. Sprint goals need a distance because sprint times are not comparable across different distances.

## Decision
Run and sprint goals are versioned goal records with set and achievement metadata.

- Goal setup is activity-scoped: the user clicks a compact Run, Sprint, or Strength button and only sees fields for that activity.
- Saving a selected activity updates that activity's goal and preserves goals for the other activities.
- The default Run goal setup captures distance plus target time.
- Older distance-only and pace-only run goal records remain supported by the data model for compatibility.
- Combined run goals require the logged run to meet or exceed the target distance and finish at or below the target time.
- Sprint goals are distance-specific, such as `100 m under 14.2 sec`.
- Run and sprint chart targets are drawn on compatible charts.
- Achieved goals are marked on charts with a celebration marker.
- Achieved goals move into history with `setAt`, `achievedAt`, linked workout, and celebration state.
- Strength goals remain outside this chart-goal behavior because strength will use a different metric.

## Consequences
- Old flat goal data must be migrated into the versioned goal shape.
- Goal achievement must be evaluated after workout save, workout edit, planned-session completion, goal save, and backup import.
- Goal form state must hide unrelated activity fields so users are not asked for irrelevant variables.
- Sprint goal comparisons must ignore sets at different distances.
- Run distance-only goals are tracked in goal progress and history but do not draw a target line on the pace chart.
