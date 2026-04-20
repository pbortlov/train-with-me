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
- Program weeks are anchored to the chosen phase start date, not calendar Monday
- Calendar uses compact session cards with a full selected-session detail panel
- Stats includes a strength progress board with planned-vs-actual and week-over-week exercise comparison
- Planned session statuses:
  - planned
  - completed
  - modified
  - missed
- Separate Review page for planned vs actual comparison
- Weekly adherence summaries such as `5/6`
- Stats page with:
  - goal progress
  - adherence summaries
  - strength / run pace / sprint charts
- Actual workout logging with edit and delete support
- Exercise library with saved exercise names
- Backup export/import as JSON
- PWA install support

## Main Pages
- `Calendar`: weekly plan, compact session cards, selected-session detail, and `Log & Complete` execution logging
- `Phases`: import, edit, inspect, and schedule reusable strength phase templates
- `Review`: planned vs actual review plus actual workout logging
- `Stats`: goals, adherence summaries, charts, backup, and exercise library

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

## Documentation
V2 keeps decision and planning history in the repo:
- [docs/product-principles.md](docs/product-principles.md)
- [docs/agents.md](docs/agents.md)
- [docs/planner-overview.md](docs/planner-overview.md)
- [docs/review-and-adherence.md](docs/review-and-adherence.md)
- [docs/strength-phase-import.md](docs/strength-phase-import.md)
- [docs/decisions/0001-v2-calendar-first-planner.md](docs/decisions/0001-v2-calendar-first-planner.md)
- [docs/conversations/2026-04-19-v2-planner-direction.md](docs/conversations/2026-04-19-v2-planner-direction.md)

## Run Locally
1. Open `index.html` in your browser.
2. Use the top navigation to move between Calendar, Phases, Review, and Stats.
3. If UI changes do not appear, hard refresh (`Ctrl+Shift+R`) and clear site storage/service worker cache.

## Publish With GitHub Pages
1. Push this repo to GitHub.
2. In GitHub, go to **Settings** → **Pages**.
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` (or your branch) and `/ (root)`
4. Click **Save**.
5. Wait about 1 minute, then open your Pages URL.
