# Train With Me

A beginner-friendly, single-page training tracker for:
- strength training
- running
- sprinting

## Features in Version 1
- Workout entry form with activity-specific fields:
  - Strength: multiple exercises per workout
    - each exercise has multiple sets
    - each set has reps and load type: kg, body weight, or band resistance color
    - band resistance is selected from color dots with hover labels
  - Run: distance (km), time (hh:mm:ss), pace auto-calculated in min/km
  - Sprint: ordered sprint sets with time (sec) + distance (m)
- Edit and delete workout entries from the recent history table
- Popup visual editor for full-workout editing
- Exercise Library with reusable names and autocomplete
- Progress filters by activity and date range
- Progress line charts for strength, run pace, and sprint
- Chart grouping modes: weekly, monthly, quarterly
- Backup tools: export/import JSON data
- PWA support (install + offline cache shell)
- Dark performance theme with high-contrast neon charts
- Goal entry form with:
  - strength goal
  - run distance goal
  - run pace goal in `mm:ss`
  - sprint best-time goal
- Simple progress summary with one set of top metrics
- Recent workout history
- Data saved in browser storage (LocalStorage)

## Run locally
1. Open `index.html` in your browser.
2. Add workouts and goals.
3. If UI changes do not appear, hard refresh (`Ctrl+Shift+R`) and clear site storage/service worker cache.

## Publish with GitHub Pages
1. Push this repo to GitHub.
2. In GitHub, go to **Settings** → **Pages**.
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` (or your branch) and `/ (root)`
4. Click **Save**.
5. Wait about 1 minute, then open your Pages URL.
