# 0001 - V2 Calendar-First Planner

- Date: 2026-04-19
- Status: accepted

## Context
The app started as a single-page workout logger with goals and charts. The product direction changed toward planning and adherence, including a calendar, reusable strength phases, and weekly completion statistics.

## Decision
V2 will be a calendar-first training planner with four main pages:
- Calendar
- Phases
- Review
- Stats

It will stay simple by default and expose advanced planning through geek / coach mode.

## Consequences
- planning becomes a first-class feature, not just post-workout logging
- new entities are required for planned sessions and strength phases
- documentation must expand beyond README into `docs/`
- review and adherence become separate product surfaces
