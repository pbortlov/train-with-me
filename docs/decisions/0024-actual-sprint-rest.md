# 0024 - Record Actual Rest Before Sprint Reps

- Date: 2026-07-30
- Status: accepted

## Context

Planned sprint blocks can include prescribed rest, but that value does not say
how long the athlete actually recovered before an individual rep. Actual rest
is needed before the app can later present recovery evidence.

## Decision

- Add optional `restBeforeSec` to actual sprint reps after the first rep.
- Accept athlete entry as either seconds (`90`) or minutes:seconds with
  optional decimal seconds (`1:30`, `1:45.1`), then normalize the stored value
  to seconds.
- Do not require actual rest to save a workout or complete a planned sprint.
- Keep planned block `restSec` unchanged and distinct from actual rest.
- Direct sprint logging keeps rest typeable, but explains that it applies from
  rep 2 and rejects an attempted first-rep rest.
- Planned completion displays an optional rest field for every rep after the
  session’s first rep.
- Preserve older sprint data and two-column sprint-set editor lines. The editor
  accepts an optional third value: `timeSec,distanceM,actualRestBeforeSec`.

## Consequences

- Existing local data and backups remain valid.
- Future recovery analysis can relate a recorded rest period to the time of the
  next rep without treating a planned interval as observed data.
- Rest inputs use text keyboards so the `:` character stays available on mobile.
