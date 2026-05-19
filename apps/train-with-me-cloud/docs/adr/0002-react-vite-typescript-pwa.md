# 0002 - Use React, Vite, TypeScript, And PWA For V2 Frontend

- Date: 2026-05-19
- Status: accepted

## Context

V1 is a static JavaScript app. V2 needs a larger authenticated UI with training
spaces, imports, coach workflows, and API integration.

## Decision

Use React, Vite, TypeScript, and PWA support for the V2 frontend.

## Consequences

- TypeScript gives the frontend explicit contracts for imported V1 shapes and
  API responses.
- Vite keeps local development fast.
- PWA behavior remains part of the product direction.
- V2 frontend tooling stays isolated from the root static app.

## Revert Notes

This ADR is documentation-only and can be reverted independently.
