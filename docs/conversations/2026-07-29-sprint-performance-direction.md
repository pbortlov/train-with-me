# Sprint Performance Direction

## Agreed athlete workflow

- Sprint performance will eventually open from Stats as a focused view rather
  than making the Stats page larger.
- Comparable work means the same selected training profile and distance; rep
  count may differ between sessions.
- Surface is selectable as a comparison context and defaults to all surfaces in
  future analysis. Slope is recorded separately, because a hill is terrain, not
  a surface.
- The athlete wants a warm-up before main sprint reps and keeps the existing
  post-session emoji feeling.

## Incremental delivery

1. Capture and explain sprint context, warm-up, and feelings.
2. Add distance/profile session-best progression. Delivered as a focused Stats
   dialog with all-surface/all-slope defaults, visible context badges, and no
   cross-distance comparison.
3. Add within-session rep consistency. Delivered with an ordered latest-session
   chart and expandable first/best/last summaries for matching sessions.
4. Add a record explorer improvement: default to all profiles and all distances,
   show profile-and-distance-specific bests, and require a single profile plus
   distance only for the comparison charts. Simplify ordered rep labels so the
   list number is not duplicated by `Rep N` text.
5. Add optional actual rest per rep and evidence-based recovery guidance.

Each step is independently testable and reversible.
