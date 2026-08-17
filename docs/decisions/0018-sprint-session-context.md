# 0018 - Add Sprint Session Context

- Date: 2026-07-29
- Status: accepted

## Context

Sprint time comparisons are only useful when the work is meaningfully alike.
The existing log records time, distance, rep order, and session feeling, but
does not record the type of sprint work, the surface, slope, or warm-up.

## Decision

- Keep sprint context optional and additive so older local data and backups stay
  valid.
- Record a session profile, optional custom profile name, surface, and slope on
  direct sprint workouts and planned sprint sessions.
- Profiles are Acceleration, Max velocity, Speed endurance, Repeat sprint, Hill
  sprint, and Custom. The UI explains the rugby purpose of each option.
- Record surface independently from slope. Supported surfaces are natural grass,
  artificial turf/3G, hybrid grass, synthetic track/tartan, indoor synthetic
  track, and Other; slopes are flat, uphill, and downhill.
- Show a warm-up section before main sprint reps. It captures an optional
  completed state and note, without changing sprint completion validation or
  time metrics.
- Preserve the existing sprint feelings and show their emoji meanings wherever
  a feeling is recorded.
- Planned sprint completion copies the planned context into the linked workout
  and records the actual warm-up state/note alongside its existing feeling.

## Consequences

- Later performance analysis can compare same-profile, same-distance sessions
  and clearly filter surface/slope without retroactively changing past times.
- Legacy sprint records show unclassified or unknown context until edited.
- This slice deliberately does not add per-rep actual rest or performance
  charts; those remain separate MVPs.
