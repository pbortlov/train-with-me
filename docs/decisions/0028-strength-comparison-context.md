# 0028 - Require Comparable Strength Context for Progression

- Date: 2026-08-23
- Status: accepted

## Context

Exercise name alone is not enough to compare strength work safely. A high-bar
barbell squat, a safety-bar squat, a warm-up, a deload, a technique session,
or work logged with pain can all look stronger numerically while being unlike
the target the athlete intends to progress. Generated program sessions also
need to remain under the program or coach's authority rather than silently
altering a generic target.

## Decision

- Store optional `variation` and `equipment` strings plus a working load type
  with every strength exercise. A strength profile and last-performance lookup
  match the exercise name, variation, equipment, and load type together. Load
  type means how resistance is measured (`kg`, `bodyweight`, or `band`);
  equipment describes the physical setup and does not replace load type. Blank
  values preserve the legacy name-only identity for existing history, with kg
  as the legacy target mode.
- Store a set kind of `working` or `warmup`; legacy sets normalize to
  `working`. Only working kg sets are evidence for promoted sets, automatic
  heavier-set updates, and top-range suggestions.
- Keep one working load type per logged exercise entry. A user who changes
  from kg to bodyweight or band logs a separate exercise entry, preventing a
  mixed sequence from becoming comparison evidence. Equipment is optional for
  bodyweight and hidden for bands, where the resistance type is already clear.
- Store optional session RIR (whole number 0–4) and neutral flags for deload,
  technique-focused, pain/discomfort, and incomplete sessions. These flags do
  not label a session as failed; they make it non-comparable for generic
  progression and last-performance recall.
- Mark workouts created through a planned strength completion as
  `isProgram`. They stay in history and plan completion reporting, but do not
  contribute to generic progression comparisons, suggestions, or saved-target
  updates.
- Keep all fields optional in local storage and backup payloads. Missing data
  normalizes to a comparable manual session with working sets and blank
  variation/equipment.

## Consequences

- Athletes receive a separate target and recall history for the same exercise
  when they deliberately distinguish variation or equipment.
- A neutral context message explains why targets remain unchanged after a
  deload, technique, pain, incomplete, or program-linked session.
- Context is session-wide in this slice. Per-set RIR, rest, tempo, range of
  motion, and advanced load modes remain out of scope.
