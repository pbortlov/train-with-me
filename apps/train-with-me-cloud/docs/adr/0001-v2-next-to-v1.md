# 0001 - Build V2 Next To V1

- Date: 2026-05-19
- Status: accepted

## Context

The current app is a static PWA served from the repository root and suitable for
GitHub Pages. The cloud V2 requires an API, database, containers, and eventually
OpenShift, which do not fit the root static deployment model.

## Decision

Build V2 under `apps/train-with-me-cloud/` while keeping V1 in the repository
root.

## Consequences

- V1 remains usable and deployable throughout migration.
- V2 can add backend and container tooling without changing root Pages behavior.
- Shared concepts must be copied or ported deliberately, not coupled through
  direct V1 storage mutation.

## Revert Notes

This ADR is documentation-only and can be reverted independently.
