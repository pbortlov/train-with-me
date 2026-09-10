# 0029 - Show Evidence-Based Strength Progress After Saving

- Date: 2026-09-03
- Status: accepted

## Context

Saved targets and in-logger recall help an athlete decide what to attempt, but
they do not make a multi-session pattern easy to see later. A simple streak,
total-volume score, or one heaviest-set verdict would either reward attendance
over useful training evidence or hide meaningful changes within a repeated set
sequence.

## Decision

- After a comparable manual strength workout is saved, acknowledge only
  positive evidence against the immediately prior comparable session with the
  same exercise, variation, equipment, and kg load type: promoted sets,
  same-load rep gains, and a strictly heavier all-time working kg set. This is
  feedback, not a workout grade, readiness verdict, streak, or volume score.
- In Stats, show every saved kg target alongside up to its three most recent
  comparable working kg sessions. Preserve their exact ordered set sequences
  and describe the latest session relative to the preceding comparable one.
  The saved target and any pending next-target suggestion remain visible.
- Reuse the comparison boundary from ADR 0028. Warm-ups, unlike identities,
  bodyweight/band work, deloads, technique-focused work, pain/discomfort,
  incomplete sessions, and program-linked sessions remain in history but do
  not appear as generic target-review evidence.
- Do not store a separate achievement feed or aggregate score. Both the save
  message and Stats review are derived from the existing workout history and
  saved target profiles.

## Consequences

Exercise-level pain exclusion prevents achievements and Stats progression
evidence for the affected exercise while preserving the raw logged sets and
allowing unaffected exercises in the same workout to earn recognition.

- An athlete can see the meaningful change from `10×30, 10×30, 10×32.5` to
  `10×30, 10×32.5, 10×32.5` as one promoted set, even though the session's
  top weight did not change.
- A neutral repeat is still visible as a comparable session rather than a
  failure. The app avoids pressuring athletes through streaks or an implied
  requirement to improve every workout.
- Stats intentionally focuses on saved kg targets. Non-kg history remains
  available in Strength Insights and the workout history until a later
  progression model can compare it meaningfully.
