# ADR 0016: Cascading Generated Strength Slot Shifts

## Status
Accepted

## Context
Generated strength sessions were previously movable only as one-off date
overrides on individual planned sessions. That created repetitive work when an
athlete delayed or advanced one recurring training day, because every later
occurrence of the same training slot had to be moved manually.

The planner already treats generated strength sessions as stable occurrences
identified by `phaseSlotId` and `phaseWeekIndex`. That occurrence identity is a
better place to store recurring delay rules than repeatedly mutating each
future planned session by hand.

## Decision
Store future day-offset shift rules on the scheduled `phaseInstance` as
`slotDayShifts`.

Each rule applies to one generated strength slot from a given
`phaseWeekIndex` forward:

- `phaseSlotId`
- `fromWeekIndex`
- `dayDelta`
- `createdAt`

Generated strength session dates remain derived from the scheduled phase start
date plus the cumulative matching slot shift rules. Existing one-off moved
planned sessions remain readable and protected for backward compatibility.

## Consequences
- Moving one generated strength session to another day can shift later
  occurrences of the same slot by the same day offset without affecting other
  program days.
- The storage contract for `phaseInstances` gains a new optional
  `slotDayShifts` field.
- Old backups remain compatible because missing `slotDayShifts` normalize to an
  empty list.
- Calendar generated-session cards use `phaseWeekIndex` and `phaseSlotId` to
  display the original program occurrence identity, such as `W2 · T3`, even
  after a session is moved.
- Calendar generated-session card colors follow the original program week. If
  one calendar date contains sessions from multiple original program weeks, the
  day badge uses a neutral mixed-week marker while each card remains the source
  of truth.
- Later MVPs can align Stats week semantics with the same scheduling rules
  instead of introducing separate logic.
