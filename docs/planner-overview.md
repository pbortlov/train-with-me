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
  - one `Add Training` surface with `Log actual` and `Plan session` modes
  - manual run/sprint planning through `Plan session`
  - sprint plans use structured blocks with reps, distance, optional target time per rep, and optional rest
  - planned run editing opens in a popup instead of reusing the in-page creation form
  - generated strength sessions
  - generated strength sessions can be moved manually while still planned, without changing the phase template
  - program week tints use the program start-date anchor, show the week number at the day level, and use matching generated-session card colors
  - today's calendar day keeps a rounded accent outline and date pill above program-week tinting
  - compact session cards with a popup training view so the day cell size stays stable
  - week cards show title first, time second, inline status at the lower right, and a contained `View training` button
  - standalone actual workout logging for strength, run, and sprint through `Log actual`
  - standalone actual workouts appear on the calendar but do not create planned sessions or affect program adherence
  - `Log & Complete` flow for day-of-training execution without rewriting the plan
  - completed planned sessions can reopen the completion log for corrections
  - `completed` vs `modified` is auto-detected from planned vs actual workout data
- `Programs`
  - import one strength phase
  - store and edit reusable templates
  - inspect the workout structure inside each saved template
  - schedule a template onto real dates
  - anchor each program week to the chosen start date instead of calendar Monday
  - refresh planned generated sessions for already scheduled instances when a template is updated
  - preserve manually moved generated strength-session dates during template refresh
  - support slot notes, including `Warm Up: 10 mins` or `Warm Up: 10-15 mins` for calendar time calculation, block timing like `15 mins`, `15-20 mins`, `30s`, `90-120s`, set prescriptions like `3` or `3-4`, and optional exercise weight targets inside imported strength plans
  - preserve rep prescriptions like `10`, `8-10`, `2x10`, and `2x8-10`
- `Review`
  - planned vs actual comparisons
  - run actual pace is calculated from logged distance and time
  - sprint review includes planned sprint blocks, actual sprint rows, and session feeling
  - strength review includes actual per-set execution with load type, reps, and load details
- `Stats`
  - adherence summaries
  - goals
  - goal setup uses compact Run, Sprint, and Strength buttons and only shows fields for the selected activity
  - run goals target a distance plus total time
  - sprint goals are tied to a target distance and time
  - run and sprint goal targets appear on charts, and achieved goals show celebration markers plus set/achieved dates
  - charts
  - program completion doughnut for the selected strength phase instance
  - program-duration strength progress for scheduled phase instances
  - run and sprint progress over time, separate from strength phases
- `Data`
  - backup export/import
  - exercise library management
  - workout history management

## Status Model
Each planned session can be:
- `planned`
- `completed`
- `modified`
- `missed`

Modified sessions still count as completed for weekly adherence, but must remain visibly different from clean completions.
