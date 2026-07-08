# Program Template Export And Import

## Scope
This flow exports and imports reusable program templates only.

It does not read or write workouts, goals, planned sessions, or UI settings.
Scheduled program instances stay in the app and are not part of the JSON file.

## File Contract
Exported files use this shape:

```json
{
  "version": 1,
  "exportedAt": "2026-07-07T10:00:00.000Z",
  "phaseTemplates": [
    {
      "id": "template-id",
      "name": "Strength phase",
      "durationWeeks": 5,
      "weekdaySlots": []
    }
  ]
}
```

## Compatibility Rules
- `version` is written as `1` by the app.
- The importer accepts version `1` and also accepts files where `version` is omitted.
- Missing optional template fields are normalized during import.
- Imported templates are merged into local storage by template id.
- The importer does not touch workout history, goals, planned sessions, or UI settings.

## UI
The Programs page provides:
- a bulk export button for all saved templates
- a per-template export action on each saved template card for sharing one
  template
- a JSON file input for importing one or many templates

The JSON workflow is separate from the full backup export/import on the Data
page.
