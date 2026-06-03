# 0004 - Coach Suggestions Instead Of Direct Edits

- Date: 2026-05-19
- Status: accepted

## Context

Coach collaboration is a core V2 goal, but athlete-owned history should remain
under athlete control. Imported V1 history is especially sensitive because it is
historical source data.

## Decision

Coaches can create suggestions. Athletes accept or reject suggestions. Coaches
cannot directly edit athlete history in the initial V2 model.

## Consequences

- Accepted and rejected suggestions require audit events.
- Permission tests must cover coach read access and restricted mutation access.
- Imported historical rows should use `coach_editable = false`.

## Revert Notes

This ADR is documentation-only and can be reverted independently.
