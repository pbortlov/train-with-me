# 0007 - Small Reversible Commits

- Date: 2026-05-19
- Status: accepted

## Context

The migration from the root static app to cloud V2 crosses product, frontend,
backend, database, infrastructure, and import behavior.

## Decision

Build V2 in small commits that each have one concern and can be reverted with
`git revert <commit>`.

## Consequences

- Avoid mixing V1 changes with V2 implementation.
- Avoid mixing schema, API behavior, frontend UI, and infrastructure in one
  commit.
- Each chunk should inspect current V1/V2 context before editing.
- Relevant docs and tests should be updated with each behavior change.

## Revert Notes

This ADR is documentation-only and can be reverted independently.
