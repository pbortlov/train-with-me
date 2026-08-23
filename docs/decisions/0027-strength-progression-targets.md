# 0027 - Add Beginner Strength Targets and Automatic Heavier-Set Progression

- Date: 2026-08-20
- Status: accepted

## Context

The logger now recalls the prior set sequence, but athletes also need a clear,
editable way to retain a heavier working weight they have actually completed.
A single heaviest set cannot describe a gradual shift from lighter to heavier
repeated sets, but a sufficiently repeated heavier set can become the saved
target without an extra confirmation step. Athletes also need the familiar
signal that a completed top-range target supports trying the next permitted
weight, without treating that calculation as completed work.

## Decision

- Store an optional local `strengthProgression` collection containing named
  exercise profiles. Profiles save an editable strength goal, working weight,
  target set count, rep range, and optional exercise-specific jump override.
  Gym-wide permitted jumps and exercise overrides determine only calculated
  next-target suggestions, not automatic working-weight updates.
- For a new unplanned kg exercise, pre-fill the editable beginner target as
  three working sets of 8–10 reps. Use the latest logged top kg set as the
  initial working-weight suggestion when history exists.
- Report a promoted set when a current set has the same rep count and a higher
  kg load than its paired prior set. Report same-load rep gains separately.
- Only after an actual strength workout is saved, inspect each matching named
  kg exercise profile. A comparable kg set qualifies when its weight is
  strictly higher than the saved working weight and its reps meet or exceed the
  profile minimum. Set the saved working weight to the highest qualifying
  weight from that workout, including when its reps are above the range.
- Also after saving, when at least the target number of comparable kg sets are
  at or above the saved working weight and maximum target reps, calculate a
  2.5%-based increment rounded to the nearest permitted jump. Show a next
  target with the same set count, the target minimum reps, and that calculated
  weight. If no permitted jump exists, show no suggestion.
- Do not change the target set count or rep range, alter original logged sets,
  or require an athlete to accept a next weight. A calculated next target is a
  post-save suggestion only; it does not change the saved target. A qualifying
  heavier set wins over a calculated suggestion because it is completed work.
  The save confirmation names the profile and qualifying set or suggestion.
  Planned program completion stays outside this automatic flow until
  program-authority context is delivered.
- Export and import `strengthProgression` as an optional backup field without
  changing backup version 2. Missing or malformed progression data falls back
  safely to default gym jumps and no profiles.

## Consequences

- The logger can credit the pattern `10×30, 10×30, 10×32.5` to
  `10×30, 10×32.5, 10×32.5` as one promoted set even though the best set is
  unchanged.
- This is a saved-workout update, not a live drafting signal or a universal
  strength verdict. The calculated next target is likewise shown only after
  save and remains a suggestion until a later heavier set is logged. Explicit
  variation/equipment and recovery context are deferred to the next slice; an
  athlete should use distinct exercise names for unlike variations until then.
  In this slice, the named exercise's logged kg sets are its working sets.
- Bodyweight and band history stays visible, but only kg sets can update a
  target.
