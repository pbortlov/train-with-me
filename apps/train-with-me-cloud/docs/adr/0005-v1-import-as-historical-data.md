# 0005 - Import V1 Backups As Historical Data

- Date: 2026-05-19
- Status: accepted

## Context

V1 stores data in browser `localStorage` and exports backup JSON. V2 has a
database and should preserve V1 training history without coupling to browser
storage.

## Decision

V2 imports V1 backup JSON as historical data through preview and commit
endpoints.

## Consequences

- V2 must parse the V1 backup top-level shape.
- Imports must be idempotent by original V1 identifiers.
- Imported rows should be marked with `source = v1_import`.
- Imported rows should preserve date-only training dates.

## Revert Notes

This ADR is documentation-only and can be reverted independently.
