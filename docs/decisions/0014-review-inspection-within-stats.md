# ADR 0014: Review Inspection Within Stats

## Status
Accepted

## Context
The app's primary athlete workflow is `Today`, `Calendar`, and `Stats`.
`Review` is useful for inspecting completed, modified, and missed planned
sessions, but it is not a daily destination for the athlete workflow.

Keeping `Review` as a standalone top-level view created an extra navigation
choice that did not match the current product priority. The inspection content
is still valuable, but it belongs behind a deliberate action instead of a
primary tab.

## Decision
Move `Review` out of the top-level nav and expose it as a collapsible drawer
inside `Stats`, with a dedicated `Review` shortcut in the Progress Hub.

Preserve existing localStorage values by mapping saved `review` view state to
`stats`.

## Consequences
- `Review` remains available for planned-vs-actual inspection without competing
  with daily training pages.
- Stats becomes the single progress and inspection hub.
- Existing saved UI state keeps working because the old `review` view maps to
  `stats`.
- The app keeps a simpler top-level navigation for athlete usage.
