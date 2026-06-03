# V2 Non-Goals

These items are intentionally outside the early V2 build so the migration stays
small, reversible, and reviewable.

## Product Non-Goals

- Replacing the root GitHub Pages app immediately.
- Mutating V1 `localStorage` directly from V2.
- Direct coach edits to athlete-owned training history.
- Real-time chat.
- Payments, subscriptions, or public coach marketplace features.
- Advanced analytics beyond preserving V1-compatible data and basic display.
- Full normalization of every complex phase structure before import behavior is
  proven.

## Technical Non-Goals

- A root-level build step for the existing static app.
- Deploying V2 to GitHub Pages.
- Adding OpenShift manifests before the local container path works.
- Combining unrelated concerns in one commit, such as schema, auth, frontend UI,
  and infrastructure.

## Revert Notes

This document is planning-only and can be reverted independently.
