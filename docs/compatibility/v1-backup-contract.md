# V1 Backup Compatibility Contract

- Contract owner: `pbortlov/train-with-me`
- Consumer: [`pbortlov/train-with-me-cloud`](https://github.com/pbortlov/train-with-me-cloud)
- Current export version: `2`
- Historical V1 behavior boundary:
  `22f649e0ed60c5abffa6754b6d57962752509915`
- Current tested V1 producer foundation:
  `319b924ee2982512c5aa8ff8cc8971815dbed551`
- Verified V2 importer checkpoint:
  `f426cb3f14c022128a36d1b4b1ea5457662bf17e`
- Verification date: 2026-06-10

## Ownership

V1 owns:

- Browser `localStorage` key names.
- Backup export shape and version.
- Backward-compatible V1 restore behavior.
- Documentation of additions or deprecations to the backup contract.

V2 owns:

- Upload, preview, warning, and import behavior.
- Database mapping and idempotency.
- A consumer fixture representing a valid V1 export.
- Compatibility tests against supported V1 backup versions.

V2 must not read or mutate V1 browser storage directly. Users transfer data by
exporting JSON from V1 and uploading it to V2.

## Storage Keys

The following V1 keys are compatibility-sensitive and must not be renamed:

- `twm_workouts_v1`
- `twm_goals_v1`
- `twm_exercise_library_v1`
- `twm_planned_sessions_v2`
- `twm_phase_templates_v2`
- `twm_phase_instances_v2`
- `twm_ui_settings_v2`
- `twm_strength_progression_v1`

The suffix is part of the key name. A `_v2` suffix does not make a key
V2-cloud-owned.

## Backup Shape

Version 2 exports use:

```json
{
  "version": 2,
  "exportedAt": "ISO-8601 timestamp",
  "workouts": [],
  "goals": {},
  "plannedSessions": [],
  "phaseTemplates": [],
  "phaseInstances": [],
  "uiSettings": {},
  "strengthProgression": {}
}
```

Required:

- `workouts` must be an array.
- `goals` must be an object.

Optional:

- `version`
- `exportedAt`
- `plannedSessions`
- `phaseTemplates`
- `phaseInstances`
- `uiSettings`
- `strengthProgression`

`phaseInstances` may include optional scheduling fields such as
`slotDayShifts`, where each item records a generated strength training slot
shift using `phaseSlotId`, `fromWeekIndex`, `dayDelta`, and `createdAt`.

V1 restore and V2 import may accept older or unversioned backups when
`workouts` and `goals` are valid. Missing optional collections are treated as
empty, and missing UI settings fall back to defaults.

Missing or malformed `strengthProgression` falls back to default permitted gym
weight jumps and no exercise profiles.

## Compatibility Rules

- Existing fields must keep their meaning and compatible JSON types.
- Existing identifiers and `linkedWorkoutId` relationships must remain
  importable.
- Training dates remain date-only `YYYY-MM-DD` values.
- Numeric millisecond timestamps and ISO-8601 `exportedAt` values remain
  distinct.
- New optional fields may be added without increasing the backup version when
  old consumers can safely ignore them.
- Removing, renaming, or changing the meaning/type of a field requires a new
  backup version and a documented migration.
- V1 must retain import support for previously valid backups.
- V2 imports are idempotent by training space and original V1 identifiers.
- Imported V1 history is historical athlete data and is not directly editable
  by coaches.

## Consumer Fixture

The V2 repository keeps its consumer fixture at:

```text
backend/tests/fixtures/train-with-me-backup-sample.json
```

The fixture is V2-owned test data derived from this contract. It is not the
canonical V1 implementation. When V1 intentionally changes the contract:

1. Update this document and V1 compatibility tests.
2. Open a corresponding V2 change.
3. Update the V2 fixture and import tests.
4. Record the tested V1 and V2 commit IDs in both repositories.
5. Release the producer change only after the consumer remains compatible.

## Verification

For the checkpoints above:

- V1 backup, storage, normalization, typecheck, production build, and
  relative-path/offline-shell tests passed.
- V2 backend import suite: 94 tests passed.
- V2 frontend typecheck and production build passed.
- V2 Compose configuration and backend/frontend container builds passed.
- Manual registration, login, persistence, and V1 import verification passed.

Future compatibility verification must use clean checkouts and record exact
commit IDs rather than relying only on branch names.
