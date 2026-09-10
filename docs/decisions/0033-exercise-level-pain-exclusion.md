# 0033 - Preserve Pain-Affected Exercises Without Progression Credit

- Date: 2026-09-09
- Status: accepted

## Context

An athlete may finish some exercises while stopping another because of pain or
concerning discomfort. The app should preserve what was performed and celebrate
the unaffected work without treating the affected exercise as a comparable
strength performance.

## Decision

Each newly logged strength exercise can be marked `painAffected`. The marker is
stored on that exercise, while its exact sets remain unchanged in the workout.
Affected exercises are excluded from last-performance recall, automatic target
updates, progression review/achievements, and Strength Insights. Other exercises
in the same saved workout remain eligible. The existing session-wide pain flag
remains supported for legacy saved/imported workouts, but is no longer exposed
for new logging; new entries use the exercise-level choice.

The field is optional and defaults to absent/false, so old saved and imported
workouts retain their previous meaning without migration.
