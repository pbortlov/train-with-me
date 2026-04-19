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
  - generated strength sessions
- `Phases`
  - import one strength phase
  - store and edit reusable templates
  - inspect the workout structure inside each saved template
  - schedule a template onto real dates
  - refresh planned generated sessions for already scheduled instances when a template is updated
  - support slot notes, block time ranges, and optional exercise weight targets inside imported strength plans
- `Review`
  - planned vs actual comparisons
  - actual workout logging
  - recent workouts
- `Stats`
  - adherence summaries
  - goals
  - charts
  - backup

## Status Model
Each planned session can be:
- `planned`
- `completed`
- `modified`
- `missed`

Modified sessions still count as completed for weekly adherence, but must remain visibly different from clean completions.
