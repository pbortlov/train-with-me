# 0022 - Show Sprint Reps in a Compact Grid

- Date: 2026-07-29
- Status: accepted

## Context

An inline ordered sprint-rep list can wrap on narrow screens, causing the
seconds unit to visually run into the next rep number. Repeating both a list
number and `Rep N` is also unnecessary.

## Decision

- Replace the inline ordered list with a fixed-width two-column grid labelled
  `Rep` and `Time`.
- Keep the seconds unit beside every time value.
- Retain the existing collapsed historical sessions and expanded latest session
  behavior.

## Consequences

- Exact rep times remain readable on mobile without making the full Sprint
  Performance dialog wider or materially taller.
- The rep-order chart remains the primary pattern visualization; the grid is
  the compact precise-value reference.
