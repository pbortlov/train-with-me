# 0017: Derive program lifecycle dates from scheduled sessions

- Status: accepted
- Date: 2026-07-12

## Context

Scheduled strength programs already store an anchored `startDate` on each
`phaseInstance`. Expected and actual finish timing became harder to read once
generated training days could be shifted forward or backward by weekday cascade
rules.

The athlete needs three dates to stay visible:

- anchored program start date
- current expected finish date after schedule shifts
- real finish date when the full generated strength program is actually done

This must remain local-first and compatible with existing backups.

## Decision

Keep lifecycle dates derived from existing scheduled program data instead of
adding new persisted fields.

- `startDate` remains the stored anchor on the `phaseInstance`
- planned finish remains `startDate + durationWeeks * 7 - 1`
- expected finish is the later of:
  - the planned finish date
  - the latest currently scheduled generated strength session date for the
    instance
- real finish date is shown only when every generated strength session in the
  instance is closed as `completed`, `modified`, or `missed`, using the latest
  session date in that closed set

## Consequences

Positive:

- no backup contract change
- no localStorage migration
- expected finish automatically follows session reschedules
- real finish updates automatically after logging corrections or end-of-program misses

Tradeoffs:

- a program with any still `planned` generated session does not get a real
  finish date yet
- historical finish dates are recomputed from current session state rather than
  preserved as an immutable milestone
