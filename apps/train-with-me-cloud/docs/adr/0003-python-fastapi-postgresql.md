# 0003 - Use Python, FastAPI, And PostgreSQL

- Date: 2026-05-19
- Status: accepted

## Context

V2 needs a backend API, durable relational storage, authentication, imports, and
permission checks.

## Decision

Use FastAPI for the backend and PostgreSQL for persistence.

## Consequences

- FastAPI provides a small API surface with typed request and response models.
- PostgreSQL supports relational ownership, JSONB for complex imported phase
  data, and future OpenShift deployment.
- Database schema changes should be managed through Alembic migrations.

## Revert Notes

This ADR is documentation-only and can be reverted independently.
