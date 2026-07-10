# ADR 0015: Calendar Planning Drawer

## Status
Accepted

## Context
Calendar is the daily working surface. Most users open it to log actual
training, while manual future planning is a secondary task. Keeping plan and
log as equally visible modes makes the page feel busier than necessary.

## Decision
Keep the actual workout logger visible in Calendar and move manual run/sprint
planning behind a collapsed drawer titled `Plan session`.

Editing an existing planned run still opens the drawer automatically so the
workflow remains direct when planning is the user's active task.

## Consequences
- Calendar reads more like a logging surface first and a planning surface
  second.
- Planning remains available without taking space from the daily logging flow.
- Existing edit flows can still force the drawer open when needed.
