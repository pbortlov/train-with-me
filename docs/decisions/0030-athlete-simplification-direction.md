# 0030 - Simplify the Athlete Workflow and Preserve Progress on Shortened Days

- Date: 2026-09-09
- Status: accepted direction; implementation pending in the linked roadmap
- Record: [agreed product decisions](../conversations/2026-09-09-athlete-simplification.md)
- Delivery: [athlete simplification roadmap](../roadmaps/athlete-simplification.md)

## Context

The app now supports last-session recall, strength targets, comparable-set
progress, programs, and activity insights. Its everyday interface exposes
configuration alongside logging and splits progress across multiple destinations.
The primary athlete needs fast repeated training and a clear explanation of what
improved across strength, running, and sprinting.

ADR 0028 excludes an entire session when pain or incompleteness is flagged. The
athlete explicitly chose a narrower future rule: preserve progress from completed,
unaffected exercises even when other exercises hurt or the workout ends early.

## Decision

1. Make Today the training entry point and expose Today, Plan, and Progress as
   the main navigation. Put preferences and data utilities in Settings, and
   advanced program management behind a deliberate action within Plan.
2. Show last performance and current set entry before configuration. Keep setup
   identifiable in a compact summary; edit setup and targets on demand.
3. Treat a repeated workout as a draft. Previous values and applied suggestions
   require completion confirmation and cannot become actual work through copying.
   Applying a suggestion does not mutate the saved working target or prescription.
4. Introduce exercise-level discomfort/eligibility for new logs. Exclude affected
   exercises, while allowing unaffected completed exercises to progress. **Finish
   with fewer sets** is an intentional completion, not a blanket exclusion.
5. Retain all actual recorded work. Apply eligibility consistently to comparable
   recall, progress review, target updates, strength goals, and celebrations.
6. Keep ADR 0027's post-save transitions: highest qualifying heavier kg set wins;
   top-range completion produces a persisted suggestion and still requires the
   full target set count. Preserve matching variation/equipment/load type,
   working-set requirements, deload/technique boundaries, and program authority.
7. Support exercise-specific strength goals using weight and reps, achievable in
   one eligible completed working set. Keep distance/time goals for sprint and
   running. Explain achievements together in one compact post-save summary.
8. Ask for training activities on first use and make preferences editable. After
   30 days without a log and with no upcoming plan for an enabled activity, offer
   to hide it. Dismissal delays another suggestion by 30 days. Hiding requires
   confirmation and preserves historical and scheduled training.

## Compatibility and transition

- This ADR records a future direction. No runtime behavior, existing storage
  meaning, or backup version changes in the documentation PR.
- At implementation, ADRs 0028 and 0029 must reference the new exercise-level
  eligibility rule. Preserve their historical descriptions of PR #69.
- Old session-wide pain/incomplete flags do not identify affected exercises.
  Preserve their existing exclusion behavior until the athlete explicitly
  corrects the record; do not silently grant historic eligibility.
- Legacy completed sets remain actual records. A new draft-confirmation model
  must not retroactively treat old saved sets as unconfirmed.
- Preserve generic strength goals until the athlete explicitly associates them
  with an exercise and rep target. Do not auto-assign a squat or bench-press goal.
- New context, goals, preferences, and reminder metadata require compatible
  normalization and import/export coverage in their implementation PRs. Follow
  the [backup contract](../compatibility/v1-backup-contract.md), including consumer
  verification for contract changes; do not claim future schemas are shipped now.
- Map existing saved view names and shortcuts to their replacement destinations.

## Consequences

- The implementation sequence has more PRs than the initial seven-item outline:
  exercise eligibility, goal semantics, and reminder timing need isolated checks.
- Presenting a shared exercise view does not make different setups or program
  prescriptions comparable. Data boundaries remain independent of navigation.
- A shortened workout can contain both a meaningful achievement and excluded
  work. The app reports each honestly and retains the full actual history.
- Per-set discomfort modeling and clinical or coaching recommendations remain
  outside this iteration. The approved exercise-level scope is required now.
