# 0031 - Keep Strength Entry Visible and Configuration On Demand

- Date: 2026-09-09
- Status: implementation in progress on R01
- Direction: [ADR 0030](0030-athlete-simplification-direction.md)
- Roadmap: [athlete simplification project](../roadmaps/athlete-simplification.md)

## Context

The strength logger currently presents setup, session context, saved-target
configuration, weight increments, and set entry in one form. The athlete usually
needs to enter the current set and recognize the previous session; variation,
equipment, target ranges, and jump rules change less often.

## Decision

- Keep the exercise name, compact setup summary, last performance, target summary,
  and current set entry visible in the normal strength logging flow.
- Put variation, equipment, and load type inside **Edit setup**. Keep the summary
  updated as the selection changes so the comparison identity remains obvious.
- Put target set count, rep range, and working weight inside **Edit target**.
  Put gym and exercise jump settings inside its nested **Weight increments**
  disclosure.
- Keep a short **Session details** disclosure for RIR, deload, technique, and
  incomplete context. Keep pain/discomfort directly available because it can
  affect the athlete's decision while entering a set. Show active context in a
  compact summary.
- Close the configuration disclosures when the logging form resets. Editing a
  value never changes saved history; existing input and save behavior remains
  unchanged in this slice.
- Reveal a collapsed editor when browser validation focuses an invalid field, so
  native validation does not point to an invisible control.

## Consequences

- A familiar exercise requires fewer visual decisions before set entry while
  advanced setup stays available.
- Setup and target semantics remain unchanged, including separate identities,
  working-set rules, and post-save target transitions from ADRs 0027 and 0028.
- A later repeat-workout slice can prefill this same visible set-entry area
  without needing another layout redesign.
- This slice does not add draft confirmation, exercise-level discomfort, goal
  migration, navigation changes, or persisted data.
