# Train With Me

Train With Me V2 is a calendar-first training planner and workout tracker for:
- strength training
- running
- sprinting

The app is designed to stay approachable for non-technical users by default, while advanced planning features live behind a `Geek / coach mode` toggle.

## V2 Features
- Calendar-first weekly planning view
- Manual planned sessions for:
  - run
  - sprint
- Reusable strength phase templates
- Strength phase import from spreadsheet-style ordered rows
- Editable strength phase templates that refresh already planned generated sessions
- Strength sessions use `Log & Complete` with hybrid planned-vs-actual set logging
- Strength completion status is detected automatically from planned vs actual data
- Strength status treats empty planned weight as a baseline load and uses minimum rep/set ranges for completion
- Program weeks are anchored to the chosen phase start date, not calendar Monday
- Planned generated strength sessions can be manually moved before completion without editing the phase template
- Calendar uses compact session cards with a popup training view so the week grid stays stable
- Calendar shows the program week at the day level and tints generated program sessions with matching palette colors
- Today stays highlighted with a rounded accent outline and date pill even when the day belongs to a colored program week
- Week cards keep training name, time, inline status, and `View training` without overflowing the day cell
- Calendar has one `Add Training` surface with modes for logging actual workouts or planning run/sprint sessions
- Completed planned sessions can be edited after `Log & Complete` to correct weights, reps, sets, times, or notes
- Sprint plans use structured blocks with reps, meters, optional target time per rep, optional rest, and generated logging rows
- Sprint logging includes a session feeling such as `Sharp ⚡`, `Solid 🙂`, `Flat 🪫`, `Sluggish 🐢`, or `Pain ⚠️`
- Planned run editing opens in a popup, and run logging calculates actual pace from distance plus `hh:mm:ss` or `mm:ss` time
- Stats includes Program Strength Progress for scheduled strength phases using each program's configured duration
- Program Strength Progress includes a completion doughnut chart: green for done (`completed + modified`), grey for not-done (`planned + missed`), with completion percentage in the center
- Program Strength Progress can sort exercises by program order, highest improvement, or needs attention
- Stats activity metrics show highest strength weight by exercise, run pace in min/km, and sprint speed in m/s
- The activity chart period selector filters charts only; Summary and Workout History use the explicit activity, date, and strength load filters
- Goal setup uses compact Run, Sprint, and Strength buttons to show only the goal fields for that activity
- Run and sprint goals are tracked separately from the activity charts
- Run goals use distance plus target time, such as `5 km under 22:00`
- Sprint goals are distance-specific, such as `100 m under 14.2 sec`
- Achieved run and sprint goals keep set and achieved dates so time-to-achieve stays visible
- Planned session statuses:
  - planned
  - completed
  - modified
  - missed
- Separate Review page for planned vs actual comparison
- Weekly adherence summaries such as `5/6`
- Stats page with:
  - goal progress
  - goal history for achieved run and sprint targets
  - adherence summaries
  - program-duration strength progress
  - per-entry activity charts for strength, run, and sprint
- Data page with:
  - backup export/import
  - exercise library management
  - workout history management
- Actual workout logging with edit and delete support
- Exercise library with saved exercise names
- Backup export/import as JSON
- PWA install support

## Main Pages
- `Calendar`: weekly plan, `Add Training` for actual logs or manual run/sprint plans, compact session cards, popup training detail, and `Log & Complete` execution logging
- `Programs`: import, edit, inspect, and schedule reusable strength phase templates
- `Review`: planned vs actual review for completed, modified, and missed planned sessions
- `Stats`: goals, adherence summaries, program strength progress, and per-entry activity charts
- `Data`: backup, exercise library, and workout history management

## Strength Phase Import
V2 import focuses on `strength phases` only.

Each imported file should describe one reusable phase using ordered rows such as:

```text
PHASE,Phase 1,5
SLOT,Tuesday,Strength A,Main lower-body day
BLOCK,A,15-20 mins,90-120s,3-4
EXERCISE,A1,Back squat,2x8-10,Heavy,100
EXERCISE,A2,Barbell row,8-10,Control the eccentric,
SLOT,Friday,Strength B,Upper/lower mixed
BLOCK,A,12 mins,45s,3
EXERCISE,A1,Front squat,2x10,,80
```

See [docs/strength-phase-import.md](docs/strength-phase-import.md) for the exact contract.

Slot notes can also include `Warm Up: 10 mins` or `Warm Up: 10-15 mins`. The Calendar uses that together with block durations and planned rests to show total strength-session time on the card.

## Documentation
V2 keeps decision and planning history in the repo:
- [docs/product-principles.md](docs/product-principles.md)
- [docs/agents.md](docs/agents.md)
- [docs/planner-overview.md](docs/planner-overview.md)
- [docs/review-and-adherence.md](docs/review-and-adherence.md)
- [docs/strength-phase-import.md](docs/strength-phase-import.md)
- [docs/decisions/0001-v2-calendar-first-planner.md](docs/decisions/0001-v2-calendar-first-planner.md)
- [docs/decisions/0002-calendar-only-workout-logging.md](docs/decisions/0002-calendar-only-workout-logging.md)
- [docs/conversations/2026-04-19-v2-planner-direction.md](docs/conversations/2026-04-19-v2-planner-direction.md)

## Run Locally
1. Open `index.html` in your browser.
2. Use the top navigation to move between Calendar, Programs, Review, Stats, and Data.
3. If UI changes do not appear, hard refresh (`Ctrl+Shift+R`) and clear site storage/service worker cache.

## Manual Test Checklists

### Commit: Show every run pace in activity chart

- Add or use at least 3 runs inside the selected chart period.
- Confirm a run with stored pace appears in the Run Pace chart.
- Confirm a run with valid distance/time but missing stored pace appears in the Run Pace chart.
- Confirm the Run Pace chart shows one column for each matching run.
- Confirm each Run Pace tooltip shows that run's date, distance, duration, and pace.
- Change the chart period and confirm it filters run entries without aggregating to the best pace.
- Confirm Summary and Workout History do not change when only the chart period changes.

### Commit: Temporarily ignore period for run pace chart

- Confirm valid runs outside the selected chart period still appear in the Run Pace chart.
- Confirm Strength and Sprint charts still follow the selected chart period.
- Confirm a run with stored pace appears in the Run Pace chart.
- Confirm a run with valid distance/time but missing stored pace appears in the Run Pace chart.
- Confirm each valid run appears as its own Run Pace column.

### Commit: Fix activity chart point parsing

- Confirm 3 valid runs in the same week render as 3 separate Run Pace columns.
- Confirm same-day runs render as separate columns with X-axis labels showing only `YYYY-MM-DD`.
- Confirm a run with valid distance/time but missing stored pace appears.
- Confirm horizontal scrolling still works when there are many Run Pace entries.
- Confirm Strength and Sprint charts still render their existing metrics.

### Commit: Show run pace dates on x axis

- Confirm every Run Pace X-axis label is the run date in `YYYY-MM-DD`.
- Confirm two runs on the same date render as two separate columns with the same visible date label.
- Confirm Run Pace tooltips still show date, distance, duration, and pace.

### Commit: Allocate chart x-axis label space

- Confirm full `YYYY-MM-DD` X-axis labels are visible and not clipped.
- Confirm same-day Run Pace columns show complete date labels under each column.
- Confirm chart cards keep the same capped height.

### Commit: Show strength highest weights by exercise

- Add or use strength workouts with at least two exercises and numeric kg sets.
- Confirm each exercise appears once in the Strength Highest Weights table.
- Confirm the table shows the highest kg for each exercise and the date it happened.
- Confirm band-only or bodyweight-only exercises do not produce kg rows.
- Confirm changing Period does not change the Strength Highest Weights table.
- Confirm changing explicit From date or To date filters changes the table.
- Confirm Run Pace and Sprint charts still render as before.
- Confirm horizontal scrolling still works when there are many entries.

## Publish With GitHub Pages
1. Push this repo to GitHub.
2. In GitHub, go to **Settings** → **Pages**.
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` (or your branch) and `/ (root)`
4. Click **Save**.
5. Wait about 1 minute, then open your Pages URL.
