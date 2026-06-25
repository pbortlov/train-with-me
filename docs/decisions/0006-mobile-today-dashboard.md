# 0006 - Add A Mobile Today Dashboard Over Existing Training Data

- Date: 2026-06-11
- Status: accepted

## Context

The weekly Calendar remains the source for planning and detailed workout
logging, but it is not the fastest starting point for an athlete opening the
app on a phone. A daily dashboard must improve access without creating another
training record type or changing the V1 storage and backup contracts.

## Decision

- Add `Today` as the default page for installations without saved UI settings.
- Preserve the last selected page for existing installations.
- Build the dashboard from the existing planned-session and workout
  collections using exact local calendar dates.
- Exclude workouts linked to planned sessions from the standalone workout
  list so a completion is not shown twice.
- Reuse the existing session detail, `Log & Complete`, edit, delete, and
  activity logging workflows.
- Keep one navigation element in the document: a top navigation on larger
  screens and a fixed bottom navigation on phone-sized screens.
- Do not change storage keys, stored record shapes, backup versions, or metric
  semantics.

## Consequences

- Athletes can see and act on today's training with fewer steps.
- Weekly planning and all existing pages remain available without migration.
- The Today view reflects existing data rather than owning independent state.
- Existing users may continue to open on Calendar or another previously saved
  page until they select Today.
