# V1 Code Evaluation Before V2 Cloud Work

This note records the current static Train With Me app contract before starting
the separate database-backed V2 under `apps/train-with-me-cloud/`.

## Scope Reviewed

- `index.html`
- `script.js`
- `styles.css`
- `manifest.json`
- `service-worker.js`
- `README.md`

No V1 app files were changed for this evaluation.

## Current V1 App Shape

The app is a static browser PWA served from the repository root. It has no build
step and stores user data in `localStorage`. The UI is implemented by
`index.html`, `styles.css`, and one large `script.js` file. `service-worker.js`
caches the root app shell for offline use.

Main V1 user surfaces:

- Calendar-first weekly planning.
- Actual workout logging for strength, run, and sprint.
- Manual planned sessions for run and sprint.
- Strength phase template import, editing, scheduling, and regeneration.
- Planned session completion with planned-vs-actual comparison.
- Review page for completed, modified, and missed planned sessions.
- Stats for goals, adherence, program strength progress, and activity charts.
- Data page for JSON backup import/export, exercise library, and history
  management.
- PWA installation support.

## LocalStorage Keys

`script.js` currently uses these keys:

- `twm_workouts_v1`
- `twm_goals_v1`
- `twm_exercise_library_v1`
- `twm_planned_sessions_v2`
- `twm_phase_templates_v2`
- `twm_phase_instances_v2`
- `twm_ui_settings_v2`

The mixed suffixes are part of the current V1 storage contract. V2 cloud import
should treat them as historical client-side data names and should not mutate
them directly.

## Backup Export Structure

The Data page exports a JSON object with this top-level shape:

```json
{
  "version": 2,
  "exportedAt": "ISO-8601 timestamp",
  "workouts": [],
  "goals": {},
  "plannedSessions": [],
  "phaseTemplates": [],
  "phaseInstances": [],
  "uiSettings": {}
}
```

Import currently requires at least:

- `workouts` as an array.
- `goals` as an object.

Optional arrays are normalized when present:

- `plannedSessions`
- `phaseTemplates`
- `phaseInstances`

Optional `uiSettings` falls back to defaults when fields are missing.

## Backup Entities

### Workouts

Workouts are normalized through `normalizeImportedWorkout`. Relevant fields:

- `id`
- `date`
- `activity`: `strength`, `run`, or `sprint`
- `strengthExercises`
- `distance`
- `time`
- `pace`
- `sprintSets`
- `sprintFeeling`
- `notes`
- `createdAt`

Run workout import recalculates pace from distance and time. Legacy numeric run
time can be converted to the stored duration format.

Strength exercises contain named exercises with ordered sets. Sets support:

- `order`
- `reps`
- `weight`
- `loadType`: `kg`, `bodyweight`, or `band`
- `bandColor`

Sprint sets are ordered sprint attempts with distance and seconds.

### Goals

Goals are normalized through `normalizeGoals`. Current goal structure:

- `version`
- `strength`
- `active.run`
- `active.sprint`
- `history`

Run and sprint goals may have active and historical records with:

- `id`
- `activity`
- `type`
- `setAt`
- `target`
- `achievedAt`
- `achievedWorkoutId`
- `celebratedAt`

The normalizer also migrates older goal shapes with direct `run`, `runPace`,
`sprint`, and `strength` fields.

### Planned Sessions

Planned sessions are normalized through `normalizePlannedSession`. Fields:

- `id`
- `date`
- `type`: `run`, `sprint`, or `strength`
- `title`
- `source`: `manual` or `phase-generated`
- `phaseTemplateId`
- `phaseInstanceId`
- `phaseSlotId`
- `phaseWeekIndex`
- `generatedDate`
- `dateMovedManually`
- `status`: `planned`, `completed`, `modified`, or `missed`
- `notes`
- `linkedWorkoutId`
- `modificationNote`
- `actual`
- `details`
- `createdAt`

Run details include `distance` and `paceGoal`. Sprint details include structured
blocks. Strength details include blocks with duration, rest, sets, and exercise
prescriptions.

### Phase Templates

Phase templates are normalized through `normalizePhaseTemplate`. Fields:

- `id`
- `name`
- `durationWeeks`
- `weekdaySlots`
- `importedAt`

Each weekday slot includes:

- `id`
- `weekday`
- `title`
- `notes`
- `blocks`

Strength phase text import accepts ordered rows:

- `PHASE`
- `SLOT`
- `BLOCK`
- `EXERCISE`

### Phase Instances

Phase instances are normalized through `normalizePhaseInstance`. Fields:

- `id`
- `templateId`
- `templateName`
- `startDate`
- `durationWeeks`
- `generatedSessionIds`
- `createdAt`

Generated strength sessions keep references back to their phase template,
instance, slot, and week index.

### UI Settings

UI settings are exported as:

- `currentView`
- `coachMode`
- `currentWeekStart`

These are user-interface preferences, not core training history.

## Reusable Logic Candidates

Candidates to preserve or port into tested V2 modules:

- Backup parser and validation around the exported top-level shape.
- Workout normalization for run duration, pace calculation, sprint sets, and
  strength set load types.
- Goal normalization and legacy goal migration.
- Planned session normalization and status values.
- Strength phase row parser for `PHASE`, `SLOT`, `BLOCK`, and `EXERCISE`.
- Generated session metadata: `phaseTemplateId`, `phaseInstanceId`,
  `phaseSlotId`, `phaseWeekIndex`, and `generatedDate`.
- Planned-vs-actual comparison for strength completion.
- Date-only training fields using `YYYY-MM-DD`.

## Migration Risks

- V1 stores all data locally, so V2 must import from backup JSON rather than
  reading browser storage directly.
- `createdAt` and some imported timestamps are numeric milliseconds, while
  `exportedAt` is ISO-8601.
- Training dates are date-only strings; V2 should keep them as date fields, not
  timezone-shifted datetimes.
- The backup importer currently accepts partially missing optional collections.
  V2 preview should report omissions without rejecting valid historical
  workouts and goals.
- `plannedSessions` use a storage key ending in `_v2` even though they belong to
  the static root app. V2 cloud code should not infer deployment generation from
  the key suffix.
- Strength phase structures are nested and may be better imported initially as
  JSONB until behavior is fully covered.
- Linked planned sessions and workouts depend on `linkedWorkoutId`; V2 import
  should preserve this relationship when both sides are imported.
- Historical imported rows should be marked read-only for coaches so coach
  collaboration cannot rewrite imported training history.

## Root Files Required For GitHub Pages Stability

These files must remain deployable from the repository root while V2 cloud work
is built separately:

- `index.html`
- `script.js`
- `styles.css`
- `manifest.json`
- `service-worker.js`

V2 cloud work should live under `apps/train-with-me-cloud/` and should not add a
root build requirement for GitHub Pages.

## Revert Notes

This chunk is documentation only. It can be reverted with:

```text
git revert <commit>
```
