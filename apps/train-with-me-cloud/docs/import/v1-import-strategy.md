# V1 Import Strategy

V2 imports historical data from a V1 JSON backup exported by the root static app.
It must not read or modify V1 browser storage directly.

## Import Flow

1. Athlete uploads a V1 backup JSON file.
2. Backend parses the file and returns a preview summary.
3. Preview reports counts, warnings, and unsupported fields.
4. Athlete confirms the import.
5. Backend writes supported entities in staged phases.
6. Re-running the same import does not duplicate rows.

## Initial Parser Output

The parser should return:

- `version`
- `exportedAt`
- workout count
- planned session count
- goal count
- phase template count
- phase instance count
- warnings

The first parser commit should not write to the database.

The parser initially summarizes only the backup shape and entity counts. It
does not normalize or persist V1 entities.

The first API surface is `POST /api/imports/v1/preview`. It returns a summary,
warnings, and unsupported top-level fields without writing to the database.
Invalid backups return `valid: false` so users can inspect problems before any
commit endpoint exists.

## Historical Import Rules

- Preserve original V1 identifiers as `original_v1_id`.
- Set `source = v1_import` on imported rows.
- Set `coach_editable = false` for imported historical rows.
- Preserve date-only training dates as dates.
- Preserve linked workout/planned-session relationships when both sides are
  imported.
- Prefer JSONB for complex nested phase structures until usage patterns justify
  deeper normalization.

## Entity Order

1. Workouts.
2. Planned sessions and links to imported workouts.
3. Goals.
4. Phase templates.
5. Phase instances.

## Revert Notes

This document describes import behavior only. Future import implementation
commits should remain independently revertible.
