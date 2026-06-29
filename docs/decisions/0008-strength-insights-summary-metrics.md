# 0008 - Add Strength Insights Summary Metrics

- Date: 2026-06-29
- Status: accepted

## Context

The existing Stats page has a highest-kg table and program strength progress,
but athletes also need a fast strength-specific overview. Strength data can use
kg, bodyweight, or band loads, so the summary must avoid mixing those load
types into one false weight metric.

## Decision

- Add Strength Insights as a presentation-only section in Stats.
- Summarize strength workout count, latest strength date, unique exercise
  count, total strength sets, load-type mix, top kg lift, and most-trained
  exercise by set count.
- Count kg, bodyweight, and band sets separately.
- Use only kg sets for best-weight and top-lift metrics.
- Keep the existing workout storage shape, backup contract, and activity chart
  behavior unchanged.

## Consequences

- Athletes get a clearer strength overview without opening detailed tables
  first.
- Bodyweight and band work remains visible in load mix and set totals, but does
  not distort kg records.
- Later strength MVPs can add trends or progression charts, but must document
  any new metric semantics separately.
