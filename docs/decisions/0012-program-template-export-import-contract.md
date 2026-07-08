# ADR 0012: Dedicated Program Template Export/Import Contract

## Status
Accepted

## Context
Reusable strength programs are edited and scheduled inside the app, but users
also need a portable way to move saved templates between devices or browsers
without exporting workouts, goals, or other app state.

The existing backup JSON already carries the full local state. Reusing that file
for program templates would blur the contract and make the import path riskier
than it needs to be.

## Decision
Add a dedicated JSON export/import format for reusable program templates.

The exported file contains:

```json
{
  "version": 1,
  "exportedAt": "ISO-8601 timestamp",
  "phaseTemplates": []
}
```

Importing this file restores template data into local storage and leaves
workouts, goals, planned sessions, UI settings, and scheduled instances alone.

The importer accepts version `1` and also accepts files where `version` is
omitted. Missing optional template fields are normalized during import.
The same contract is used for both bulk export and single-template sharing.
Single-template exports contain one item in `phaseTemplates`.

## Consequences
- Users get a separate program-template portability workflow.
- The backup contract stays focused on full app state.
- Template exports remain compatible with future normalization changes as long
  as the importer can normalize missing optional fields.
- Future template contract changes should be versioned here instead of being
  hidden inside the backup JSON.
