# 0039 - Activity selection preferences

- Date: 2026-10-25
- Status: accepted; implementation complete on the R10 branch
- Roadmap: [athlete simplification](../roadmaps/athlete-simplification.md)

## Decision

On first use, the app asks **What do you train?** and requires at least one of
Strength, Running, or Sprinting. The same choices remain editable in Settings.

The selected activities filter everyday entry points: quick logging, activity
logging switches, Progress activity switches, and goal activity switches. The
preference does not delete or rewrite workouts, goals, planned sessions, or
exercise history. Re-enabling an activity restores its everyday options.

## Compatibility and persistence

Preferences live inside the existing `twm_ui_settings_v2` collection:

```json
"activityPreferences": {
  "configured": true,
  "enabled": ["strength", "run"]
}
```

Missing or malformed preferences normalize to all three activities enabled and
an unconfigured first-use state. Backup export/import preserves the optional
field; older backups remain valid. At least one activity must remain enabled.

Scheduled sessions and historical records remain visible even when their
activity is disabled. This keeps the setting a focus preference rather than a
data visibility or deletion feature.

## Consequences

- New athletes can reduce daily choices before logging.
- Existing installations keep all activities enabled until the athlete chooses
  otherwise.
- The preference is local-first and included in normal JSON backup/restore.
- Inactivity reminders in R11 must build on these preferences without changing
  this data-preserving behavior.
