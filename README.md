# Train With Me

Train With Me V1 is a local-first training planner and workout tracker for:
- strength training
- running
- sprinting

The app is designed to stay approachable for non-technical users by default, while advanced planning features live behind a `Geek / coach mode` toggle.

## V1 Features
- Mobile-first Today launchpad for planned sessions, completed training, and quick logging
- Persistent bottom navigation on phone-sized screens
- Fast activity-specific actual logging for strength, run, and sprint, with Today/Yesterday date shortcuts
- Progress Hub summary for workouts, plan completion, active goals, achieved goals, and training mix, with a momentum highlight
- Strength Insights for strength workout count, exercise coverage, load mix, top kg lift, and most trained exercises
- Running Insights for run count, total distance, weighted average pace, longest run, best pace, and recent runs
- Sprint Insights for sprint workouts, rep volume, distance-specific bests, fastest rep, and feeling mix
- Local-first onboarding, keyboard skip link, and backup safety guidance
- Today-first quick navigation with Calendar for weekly planning and Stats for quick progress checks
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
- Calendar has one `Add Training` surface with modes for logging actual workouts or planning run/sprint sessions, plus a week-launchpad header and a compact next-up/progress strip
- Completed planned sessions can be edited after `Log & Complete` to correct weights, reps, sets, times, or notes
- Sprint plans use structured blocks with reps, meters, optional target time per rep, optional rest, and generated logging rows
- Sprint logging and sprint workout editing include a session feeling such as `Sharp ⚡`, `Solid 🙂`, `Flat 🪫`, `Sluggish 🐢`, or `Pain ⚠️`
- Planned run editing opens in a popup, and run logging calculates actual pace from distance plus `hh:mm:ss` or `mm:ss` time
- Stats includes Program Strength Progress for scheduled strength phases using each program's configured duration
- Program Strength Progress includes a completion doughnut chart: green for done (`completed + modified`), grey for not-done (`planned + missed`), with completion percentage in the center
- Program Strength Progress can sort exercises by program order, highest improvement, or needs attention
- Stats activity metrics show highest strength weight by exercise, run pace in min/km, and sprint rep times in seconds
- Activity metrics use the explicit activity, date, and strength load filters
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
- Review stays available as a secondary inspection view, not a primary athlete tab
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
- `Today`: quick navigator and launchpad, daily plan, completion shortcuts, status-colored planned-session cards with a dominant `Log & Complete` action, existing workout access, and activity-specific quick logging
- `Calendar`: weekly working surface, `Add Training` for actual logs plus a collapsed planning drawer for manual run/sprint plans, activity-specific logging shortcuts, compact session cards, popup training detail, `Log & Complete` execution logging, and a momentum strip that shows next up plus weekly progress
- `Stats`: progress proof, goals, adherence summaries, program strength progress, Strength Insights, Running Insights, Sprint Insights, and per-entry activity charts, with a reward-first top section and a review drawer shortcut
- `Programs`: manage scheduled strength programs first, then inspect, schedule, edit, or create reusable templates with a readable import preview
- `Review`: planned vs actual review for completed, modified, and missed planned sessions, kept out of the primary athlete nav and opened from the Stats page
- `Data`: quiet maintenance surface for backup, with exercise library and workout history tucked behind expandable drawers

## Strength Phase Import
V1 import focuses on `strength phases` only.

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
V1 keeps decision and planning history in the repo:
- [docs/product-principles.md](docs/product-principles.md)
- [docs/agents.md](docs/agents.md)
- [docs/planner-overview.md](docs/planner-overview.md)
- [docs/review-and-adherence.md](docs/review-and-adherence.md)
- [docs/strength-phase-import.md](docs/strength-phase-import.md)
- [docs/decisions/0001-v2-calendar-first-planner.md](docs/decisions/0001-v2-calendar-first-planner.md)
- [docs/decisions/0002-calendar-only-workout-logging.md](docs/decisions/0002-calendar-only-workout-logging.md)
- [docs/decisions/0006-mobile-today-dashboard.md](docs/decisions/0006-mobile-today-dashboard.md)
- [docs/decisions/0007-progress-hub-over-existing-metrics.md](docs/decisions/0007-progress-hub-over-existing-metrics.md)
- [docs/decisions/0008-strength-insights-summary-metrics.md](docs/decisions/0008-strength-insights-summary-metrics.md)
- [docs/decisions/0009-running-insights-summary-metrics.md](docs/decisions/0009-running-insights-summary-metrics.md)
- [docs/decisions/0010-sprint-insights-summary-metrics.md](docs/decisions/0010-sprint-insights-summary-metrics.md)
- [docs/decisions/0011-local-first-onboarding-and-backup-ux.md](docs/decisions/0011-local-first-onboarding-and-backup-ux.md)
- [docs/conversations/2026-04-19-v2-planner-direction.md](docs/conversations/2026-04-19-v2-planner-direction.md)

The Vite/PWA architecture and compatibility contracts are documented in:

- [Vite and GitHub Pages ADR](docs/decisions/0005-v1-vite-github-pages-compatibility.md)
- [V1 backup compatibility contract](docs/compatibility/v1-backup-contract.md)
- [Contribution workflow](CONTRIBUTING.md)

The independent cloud application is maintained at
[`pbortlov/train-with-me-cloud`](https://github.com/pbortlov/train-with-me-cloud).
It has its own dependencies, CI/CD, deployment configuration, and release
lifecycle.

## Local Development

The root PWA uses Vite, vanilla TypeScript domain modules, and the existing browser UI controller.

Prerequisites:

- Node.js 22 or newer
- npm

Install and run:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. Opening `index.html` directly is no longer supported because the app now uses bundled modules.

Useful checks:

```bash
npm run test
npm run typecheck
npm run build
npm run smoke
npm run check
```

Preview the production build with:

```bash
npm run build
npm run preview
```

## Offline And Updates

- After one successful production load, the app shell and Chart.js bundle are available offline.
- New installations open on Today. Existing installations keep their last selected page.
- On phone-sized screens, the main pages remain available from the fixed bottom navigation.
- Workout data remains in this browser's `localStorage`; the service worker does not copy or synchronize user data.
- A deployed update downloads in the background. When ready, the app shows `Update now`; reload occurs only after that button is selected so unfinished form input is not discarded automatically.
- Existing installations using the historical `service-worker.js` are migrated through a compatibility worker that removes the obsolete cache before the generated worker takes control.
- Android Chromium browsers use the native install prompt when available.
- iOS browsers do not expose that prompt; install from Safari with Share, then Add to Home Screen.
- Installed iOS web apps opt into safe-area handling so content and bottom navigation avoid the status bar, screen edges, and home indicator.
- Development mode does not register the production service worker.
- Browser storage clearing, private browsing cleanup, device loss, or changing the Pages origin can permanently remove local data.
- The Today page includes a local-first onboarding reminder, and Data includes a backup safety checklist.

Export a JSON backup from Data after important training changes and store it outside the browser. Test restoring backups periodically before relying on them.

## Manual Test Checklists

### Commit: Polish iOS standalone layout

- Run `npm run build` and `npm run preview`.
- Open the preview URL on an iPhone in Safari.
- Use Share, then Add to Home Screen, if the app is not already installed.
- Launch Train With Me from the home screen.
- Confirm top content starts below the iOS status area and is not clipped.
- Confirm the fixed bottom navigation sits above the home indicator.
- Confirm the bottom navigation remains usable after switching pages.
- Rotate to landscape and confirm content and navigation avoid the side safe areas.
- Confirm existing local workout data remains visible.

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
- Confirm changing explicit From date or To date filters changes the table.
- Confirm Run Pace and Sprint charts still render as before.
- Confirm horizontal scrolling still works when there are many entries.

### Commit: Improve strength highest weights table layout

- Confirm Strength Highest Weights appears below the Run Pace and Sprint chart cards.
- Confirm a long Strength Highest Weights table is readable and scrolls inside its card.
- Confirm Run Pace and Sprint chart cards keep their capped chart height.
- Confirm mobile layout stacks cleanly without clipped table text.

### Commit: Show sprint rep times and remove period filter

- Confirm the Activity Charts filters no longer show Period.
- Confirm a sprint workout with `10m 1.56s` and `20m 2.21s` shows two Sprint columns.
- Confirm Sprint Y axis is `sec`.
- Confirm Sprint X-axis labels use `YYYY-MM-DD #1`, `YYYY-MM-DD #2`, and so on.
- Confirm Sprint tooltips show date, try number, meters, and seconds.
- Confirm chart entries spread across the X axis when they fit and scroll horizontally when the viewport is too narrow.
- Confirm close sprint times such as `1.56s`, `1.60s`, and `1.68s` show visible height differences.
- Confirm explicit From date and To date filters affect Sprint, Run Pace, and Strength.
- Confirm Run Pace and Strength behavior is unchanged.

### Commit: Color sprint chart entries by date

- Confirm same-day sprint reps share one color.
- Confirm sprint reps from different dates use different colors.
- Confirm sprint reps remain separate columns.
- Confirm Run Pace and Strength colors and behavior are unchanged.

### Commit: Fit same-day sprint entries together

- Confirm same-day sprint reps appear close together and almost touching.
- Confirm sprint reps from different dates have a visible separator between date groups.
- Confirm date separators do not consume a full column-width gap.
- Confirm Run Pace and Strength layout and behavior are unchanged.

## GitHub Pages Deployment

The repository workflow `.github/workflows/deploy-pages.yml`:

1. Installs exactly the dependencies in `package-lock.json` with `npm ci`.
2. Runs unit tests, TypeScript validation, a production build, and relative-path/offline smoke checks.
3. Validates pull requests without deploying them.
4. Publishes `dist/` with the official GitHub Pages actions only after a successful push to `main`.

Vite uses relative asset paths, manifest scope, and start URL so the app works at nested project URLs such as:

```text
https://pbortlov.github.io/train-with-me/
```

Repository setup:

1. Open **Settings**, then **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Merge the validated change to `main`.
4. Confirm the `Validate and deploy V1 Pages` workflow completes and reports the deployed URL.

GitHub Pages is the sole production origin for V1. Do not advertise a second
Pages deployment as interchangeable: browser storage is isolated by origin, so
another hostname or protocol appears to have an empty data set.

Before moving from any previous deployment origin, export a JSON backup there
and restore it at the GitHub Pages URL. To roll back a faulty deployment,
revert the responsible commit on `main`; the workflow will validate and publish
the reverted build without changing browser storage.
