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
5. Replace the inline rep list with a compact mobile-friendly `Rep | Time`
   grid so the seconds unit stays visually separated from the next rep.
6. Make exact rep values secondary: show the chart and first/best/last summary
   first, then a centered `Rep times (n)` disclosure with fixed two-decimal
   seconds.
7. Add optional actual rest before each rep after the first. Delivered as an
   optional actual value, separate from planned rest, with compatibility for
   older sprint records. Athlete entry accepts seconds or `m:ss` while storage
   stays normalized to seconds.
8. Add evidence-based recovery guidance once enough actual-rest data exists.

Each step is independently testable and reversible.
