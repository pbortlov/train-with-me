# 0006 - Container First And OpenShift Ready

- Date: 2026-05-19
- Status: accepted

## Context

V2 requires API, frontend, and PostgreSQL services. Local development should
match the deployment shape closely enough to avoid environment drift.

## Decision

Use containers for local development first, then add OpenShift starter manifests
after local compose is working.

## Consequences

- Local compose should include API and PostgreSQL before frontend container work.
- Production configuration must come from environment variables.
- No production code should hardcode localhost.
- OpenShift manifests should be added in a later focused infrastructure commit.

## Revert Notes

This ADR is documentation-only and can be reverted independently.
