# 0021 - Explore Sprint Records Before Narrowing Comparison

- Date: 2026-07-29
- Status: accepted

## Context

Requiring the athlete to choose a session profile before displaying distances
hides valid 10 m, 40 m, or 100 m history that belongs to another profile. A
new athlete may not know which combination to select before seeing the data.

## Decision

- Default Sprint Performance to `All profiles` and `All distances`.
- In any broad filter state, show a record explorer table grouped by profile
  and exact distance. Each row shows that group’s best time, date, surface,
  and slope.
- Keep 10 m, 40 m, and 100 m records separate; broad selections never draw a
  shared time trend.
- Reveal progression and rep-consistency charts only after the athlete chooses
  exactly one profile and one distance.
- Simplify ordered rep labels to the list number plus time, such as
  `1. 5.1 s`, rather than duplicating `1` and `Rep 1`.

## Consequences

- Athletes can discover their whole sprint history before narrowing it.
- The basic flow stays safe and readable for new users, while coaches can still
  select a precise context for trend analysis.
