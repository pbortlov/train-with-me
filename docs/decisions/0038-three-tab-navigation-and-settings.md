# 0038 - Three-tab navigation and Settings utilities

- Date: 2026-10-24
- Status: accepted; implementation complete on the R09 branch
- Roadmap: [athlete simplification](../roadmaps/athlete-simplification.md)

## Decision

The primary athlete navigation is **Today · Plan · Progress · Settings**.

- **Today** is the daily training entry point.
- **Plan** is the weekly planning and active-program surface.
- **Progress** contains activity review, goals, charts, exercise progress, and
  saved workout history.
- **Settings** contains maintenance and advanced controls: program management,
  backup/import, exercise-library management, preferences, installation help,
  and local-first safety guidance.

Program management and data maintenance remain separate utility views reached
from Settings. They are not additional primary tabs.

## Compatibility

The stored `uiSettings.currentView` value remains backward compatible:

- `review` continues to map to `stats` (the Progress view).
- `phases` and `data` continue to open their existing utility panels.
- When either utility panel is open, Settings is marked as the active primary
  destination so restored or shortcut-driven navigation remains understandable.
- Existing workout, program, goal, exercise-library, and backup data schemas are
  unchanged.

On phone-sized screens the four primary destinations use the fixed bottom
navigation. Buttons retain keyboard focus behavior and the existing skip link;
utility routes remain reachable without exposing extra bottom-nav items.

## Consequences

- Daily actions are easier to find without removing existing capabilities.
- Workout history has one athlete-facing home: Progress.
- Maintenance controls are intentionally quieter and require an explicit
  Settings action.
- Future activity preferences and inactivity reminders belong in Settings and
  must preserve disabled activity history and scheduled sessions.
