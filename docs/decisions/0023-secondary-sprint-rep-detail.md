# 0023 - Keep Exact Sprint Rep Times Secondary

- Date: 2026-07-30
- Status: accepted

## Context

The rep-order line chart is the primary tool for seeing a session pattern.
Exact rep values remain useful, but a visible bordered table made them too
prominent and inconsistent with nearby Sprint Performance text on a phone.

## Decision

- Keep the session summary and rep-order chart visible.
- Move exact rep values behind a nested `Rep times (n)` disclosure.
- Render the opened values as a narrow, centered, unboxed one-column list with
  a rep label and right-aligned time.
- Format Sprint Performance exact times as fixed two-decimal seconds, such as
  `8.00 s`, including summaries, records, and chart tooltips.
- Use tabular numbers for the value list so equal-place digits align.

## Consequences

- The athlete can inspect every rep when wanted without exact values dominating
  the Sprint Performance dialog.
- The disclosure stays compact on a phone and can reflow with user text-size
  preferences.
