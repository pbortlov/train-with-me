# ADR 0013: Shared Design Tokens From Programs

## Status
Accepted

## Context
The app's strongest visual language currently lives inside the Programs view.
That view uses richer surfaces, clearer semantic button colors, and more
intentional hierarchy than the rest of the app. The rest of the interface still
depends mainly on generic root colors and one-off view rules.

This makes redesign work expensive because:

- shared semantics such as primary, secondary, build, edit, and danger are not
  encoded at the token level
- the Programs view acts as an exception instead of a reusable system
- later redesign MVPs would need to copy literal colors and gradients into
  Today, Calendar, Stats, and Data

## Decision
Extract the Programs visual language into shared CSS custom properties and
foundation button variants before redesigning other tabs.

This foundation includes:

- shared surface tokens for Programs-style panels, summaries, guide strips,
  statuses, and error treatments
- shared button tokens for primary, secondary, danger, and Programs build/edit
  actions
- reusable button utility classes for future cross-view adoption
- migration of Programs-specific literal colors to the new token layer without
  changing user workflows

## Consequences
- Programs remains the visual reference, but no longer as a styling exception.
- Future redesign MVPs can reuse the same palette and semantics with less CSS
  duplication.
- UI contract tests can assert tokenized styling instead of hardcoded literals
  in every new surface.
- This ADR changes styling architecture only; it does not change storage,
  workflows, deployment, or compatibility contracts.
