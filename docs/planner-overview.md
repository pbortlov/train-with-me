# Planner Overview

## V2 Model
V2 evolves Train With Me from a workout logger into a planning loop:
- plan
- schedule
- complete
- review
- measure

## Main Entities
- `plannedSession`: a dated session on the calendar
- `phaseTemplate`: reusable imported strength phase
- `phaseInstance`: a scheduled use of a template starting on a chosen date
- `workout`: the actual logged workout record

## Main Pages
- `Calendar`
  - default landing page
  - week-first layout
  - manual run/sprint planning
  - sprint plans use structured blocks with reps, distance, optional target time per rep, and optional rest
  - generated strength sessions
  - compact session cards with a popup training view so the day cell size stays stable
  - week cards show title first, time second, inline status at the lower right, and a contained `View training` button
  - `Log & Complete` flow for day-of-training execution without rewriting the plan
  - `completed` vs `modified` is auto-detected from planned vs actual workout data
- `Phases`
  - import one strength phase
  - store and edit reusable templates
  - inspect the workout structure inside each saved template
  - schedule a template onto real dates
  - anchor each program week to the chosen start date instead of calendar Monday
  - refresh planned generated sessions for already scheduled instances when a template is updated
  - support slot notes, including `Warm Up: 10 mins` or `Warm Up: 10-15 mins` for calendar time calculation, block timing like `15 mins`, `15-20 mins`, `30s`, `90-120s`, set prescriptions like `3` or `3-4`, and optional exercise weight targets inside imported strength plans
  - preserve rep prescriptions like `10`, `8-10`, `2x10`, and `2x8-10`
- `Review`
  - planned vs actual comparisons
  - sprint review includes planned sprint blocks, actual sprint rows, and session feeling
  - strength review includes actual per-set execution with load type, reps, and load details
  - actual workout logging
  - recent workouts
- `Stats`
  - adherence summaries
  - goals
  - charts
  - per-exercise strength progress board
  - backup

## Status Model
Each planned session can be:
- `planned`
- `completed`
- `modified`
- `missed`

Modified sessions still count as completed for weekly adherence, but must remain visibly different from clean completions.
