# Planner Overview

## V2 Model
V2 evolves Train With Me from a workout logger into a planning loop:
- plan
- schedule
- complete
- review
- measure
- destructive actions that change saved plan, log, program, or exercise-library data confirm in a shared dialog before applying

## Main Entities
- `plannedSession`: a dated session on the calendar
- `phaseTemplate`: reusable imported strength phase
- `phaseInstance`: a scheduled use of a template starting on a chosen date, with optional future slot shift rules
- `workout`: the actual logged workout record

## Main Pages
- `Today`
  - default landing page for new installations
  - quick navigator and launchpad for the current day and the next useful action
  - primary `Open week` action with a secondary `Open stats` cue so daily navigation starts in the right place
  - exact-date view of today's planned sessions and standalone workout logs
  - status-colored planned-session cards with a dominant `Log & Complete` action for due sessions and a secondary `Details` action
  - direct access to planned-session details and `Log & Complete`
  - strength, run, and sprint quick logging through the existing Calendar form
  - local-first onboarding that reminds athletes to plan/log, review progress, and export backups
  - does not duplicate or change workout, plan, adherence, or backup data
- `Calendar`
  - week-first layout
  - main working surface for choosing a day and keeping the week visible
  - launchpad header with a next-up / weekly-progress cue above the grid
  - one visible `Add Training` surface for actual logs, plus a collapsed planning drawer for manual run/sprint plans
  - manual run/sprint planning through `Plan session`
  - sprint plans use structured blocks with reps, distance, optional target time per rep, and optional rest
  - planned run editing opens in a popup instead of reusing the in-page creation form
  - generated strength sessions
  - generated strength sessions can shift future matching training days by the same day offset while still planned, without changing the phase template
  - program week tints and week badges follow the visible generated-session dates, and use matching generated-session card colors
  - today's calendar day keeps a rounded accent outline and date pill above program-week tinting
  - compact session cards with a popup training view so the day cell size stays stable
  - week cards show title first, time second, inline status at the lower right, and a contained `View training` button
  - standalone actual workout logging for strength, run, and sprint through `Log actual`
  - activity-specific logging buttons keep the existing activity input in sync and focus the first useful field
  - Today/Yesterday date shortcuts speed up common mobile logging without changing workout storage
  - standalone actual workouts appear on the calendar but do not create planned sessions or affect program adherence
  - `Log & Complete` flow for day-of-training execution without rewriting the plan
  - completed planned sessions can reopen the completion log for corrections
  - `completed` vs `modified` is auto-detected from planned vs actual workout data
- `Programs`
  - show scheduled strength programs first
  - store and edit reusable templates
  - inspect the workout structure inside each saved template
  - schedule a template onto real dates
  - show each scheduled program's anchored start date, current expected finish date, and actual finish date when the full program is completed
  - label scheduled programs as on track, shifted, finished on time, or finished late so lifecycle dates are easier to read
  - explain those lifecycle labels inline in Programs and Stats so the meaning stays visible without external documentation
  - confirm before removing a scheduled program because the action also removes its generated training days and linked logged completions
  - keep create/import tools in a collapsible section after scheduled programs and saved templates
  - preview imported program text as readable program basics, training days, blocks, and exercises before saving
  - show a plain-language summary of days, blocks, and exercises above the preview
  - show template list summaries that lead with counts, the first training days, and any slot notes so saved programs are easier to scan
  - sort saved templates by the most recently edited templates first so the most useful ones stay near the top
  - show when a template was last edited so the list reads more like a working queue than a raw storage dump
  - filter saved templates by name, notes, or exercise text from the Programs page
  - export and import reusable templates as a dedicated JSON file without touching workouts, goals, planned sessions, or UI settings
  - visually separate training days, blocks, and exercises with nested surfaces so the builder hierarchy is easier to read
  - give add-day, add-block, and add-exercise actions more distinct palette emphasis so hierarchy matches the controls
  - load a copy of a saved template into a new draft before making changes
  - mark copied templates with a copied badge and recently edited templates with a recent badge
  - edit program name and duration through fields that stay synced with the import text
  - edit training days through fields that stay synced with `TRAINING` rows
  - edit blocks through fields that stay synced with `BLOCK` rows
  - edit exercises through fields that stay synced with `EXERCISE` rows
  - load a starter example to begin from a human-friendly template structure
  - show a short guided checklist before the builder so the flow is easier to start
  - copy the current import text to the clipboard for reuse or backup
  - reset the builder to a blank draft when starting over
  - load a saved template directly from the builder without scrolling back to the list
  - show row-specific import hints when the structured text is missing PROGRAM, TRAINING, BLOCK, or EXERCISE rows
  - reject empty blocks so every imported block has at least one exercise
  - anchor each program week to the chosen start date instead of calendar Monday
  - refresh planned generated sessions for already scheduled instances when a template is updated
  - preserve manually moved generated strength-session dates during template refresh
  - support slot notes, including `Warm Up: 10 mins` or `Warm Up: 10-15 mins` for calendar time calculation, block timing like `15 mins`, `15-20 mins`, `30s`, `90-120s`, set prescriptions like `3` or `3-4`, and optional exercise weight targets inside imported strength plans
  - preserve rep prescriptions like `10`, `8-10`, `2x10`, and `2x8-10`
- `Review`
  - planned vs actual comparisons remain available as a secondary inspection drawer inside Stats
  - stays out of the primary athlete nav and opens from the Stats page
  - run actual pace is calculated from logged distance and time
  - sprint review includes planned sprint blocks, actual sprint rows, and session feeling
  - strength review includes actual per-set execution with load type, reps, and load details
- `Stats`
  - the main progress and motivation surface after logging
  - accessible from Today as a direct launchpad action
  - includes a shortcut into the secondary review drawer for planned-vs-actual inspection
  - reward-first top section with a momentum highlight before the detailed cards
  - Progress Hub summarizes total workouts, plan completion, active goals, achieved goals, training mix, and planned-session completion
  - Progress Hub shortcuts scroll to goals, adherence, and activity chart details without changing metric semantics
  - adherence summaries
  - goals
  - goal setup uses compact Run, Sprint, and Strength buttons and only shows fields for the selected activity
  - run goals target a distance plus total time
  - sprint goals are tied to a target distance and time
  - achieved goals show set/achieved dates in goal history
  - activity charts
  - program completion doughnut for the selected strength phase instance
  - program-duration strength progress for scheduled phase instances
  - scheduled-program stats show start date, current expected finish, and real finish when all generated strength sessions are closed as completed, modified, or missed
  - scheduled-program stats derive a lifecycle status from those dates instead of adding a separate stored state
  - Strength Insights summarize strength workouts, unique exercises, total sets, kg/bodyweight/band load mix, top kg lift, and most-trained exercise
  - Running Insights summarize run count, total distance, weighted average pace, latest run, longest run, best pace, total time, and recent valid-distance runs
  - Sprint Insights summarize sprint workouts, total reps, unique distances, latest sprint, fastest rep, distance-specific bests, recent sessions, and feeling mix
  - per-entry strength, run, and sprint charts separate from strength phases
- `Data`
  - quiet maintenance surface for backup export/import and maintenance
  - backup safety checklist before export/import controls, styled to match the Programs surface
  - exercise library management hidden behind an expandable drawer
  - workout history management hidden behind an expandable drawer

## Status Model
Each planned session can be:
- `planned`
- `completed`
- `modified`
- `missed`

Modified sessions still count as completed for weekly adherence, but must remain visibly different from clean completions.
