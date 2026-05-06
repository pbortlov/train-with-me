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
- Run and sprint progress stay separate from strength phases and are shown as progress over time
- Run and sprint goals are shown on their charts, with achieved goals marked by a celebration marker
- Run goals can be distance-only, pace-only, or distance plus target time, such as `5 km under 22:00`
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
  - strength / run pace / sprint charts over time
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
- `Stats`: goals, adherence summaries, program strength progress, and progress-over-time charts
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

## Publish With GitHub Pages
1. Push this repo to GitHub.
2. In GitHub, go to **Settings** → **Pages**.
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` (or your branch) and `/ (root)`
4. Click **Save**.
5. Wait about 1 minute, then open your Pages URL.
