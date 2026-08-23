# Strength Progression MVP Direction

## Athlete need

The athlete wants to log gym work without remembering the previous session's
sets, reps, or weight. A higher final set alone is not enough to explain
progress: moving one of several equal-rep sets from 30 kg to 32.5 kg is a real
session gain even when the heaviest set is unchanged.

## Agreed model

- Use two separate concepts: session progress (such as a promoted set) and
  saved-workout target progression. Completing all target sets at the top of
  the rep range shows a next permitted target at the range minimum; a heavier
  kg set that meets the target minimum reps updates the saved working weight.
- Preserve the exact ordered set sequence for recall, but do not privilege the
  final/heaviest set when evaluating a future session.
- Programs or coaches always override app recommendations.
- Keep the beginner MVP strength-only and use an editable 3 × 8–10 default for
  a later unplanned-target setup.

## Incremental delivery

1. Show latest logged sets and best kg set in the actual strength logger.
   Delivered with no new stored data or recommendation.
2. Add saved targets, promoted-set comparison, and backwards-compatible
   persistence. After saving, a top-range workout can show a next permitted
   target at the range minimum without changing the saved target. A named kg
   target automatically updates to the highest comparable heavier set when it
   meets the target minimum reps; that completed work takes precedence over a
   calculated suggestion, while set count and rep range remain unchanged.
3. Add working/warm-up context, variation/equipment, optional effort, recovery
   flags, and program authority.
4. Add achievement feedback and repeated-session trends in Stats.

Each slice remains independently functional, tested, documented, and manually
reviewed before the next one begins.
