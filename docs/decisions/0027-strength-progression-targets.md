# 0027 - Add Explicit Beginner Strength Targets and Readiness

- Date: 2026-08-20
- Status: accepted

## Context

The logger now recalls the prior set sequence, but athletes also need a clear,
editable rule for recognising a stronger session and deciding whether to try a
higher working weight. A single heaviest set cannot describe a gradual shift
from lighter to heavier repeated sets.

## Decision

- Store an optional local `strengthProgression` collection containing gym-wide
  permitted kg jumps and named exercise profiles. Profiles save an editable
  strength goal, working weight, target set count, rep range, and optional
  exercise-specific jump override.
- For a new unplanned kg exercise, pre-fill the editable beginner target as
  three working sets of 8–10 reps. Use the latest logged top kg set as the
  initial working-weight suggestion when history exists.
- Report a promoted set when a current set has the same rep count and a higher
  kg load than its paired prior set. Report same-load rep gains separately.
- Mark readiness only when the target number of current kg sets reaches the
  profile working weight and top rep target. Suggest a 2.5%-based increase,
  rounded to the nearest permitted jump.
- Require the athlete to explicitly accept the suggested next weight before
  changing the saved target. Do not alter logged history or a planned program.
- Export and import `strengthProgression` as an optional backup field without
  changing backup version 2. Missing or malformed progression data falls back
  safely to default gym jumps and no profiles.

## Consequences

- The logger can credit the pattern `10×30, 10×30, 10×32.5` to
  `10×30, 10×32.5, 10×32.5` as one promoted set even though the best set is
  unchanged.
- This is a live session signal, not a universal strength verdict. Explicit
  variation/equipment and recovery context are deferred to the next slice; an
  athlete should use distinct exercise names for unlike variations until then.
- Bodyweight and band history stays visible, but this slice makes kg-only
  targets and recommendations.
