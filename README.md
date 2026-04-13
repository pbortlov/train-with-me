# Train With Me

A beginner-friendly, single-page training tracker for:
- strength training
- running
- sprinting

## Features in Version 1
- Workout entry form with activity-specific fields:
  - Strength: multiple exercises per workout
    - each exercise has multiple sets
    - each set has reps and either kg weight or body weight
  - Run: distance (km), time (min), pace (min/km)
  - Sprint: ordered sprint sets with time (sec) + distance (m)
- Edit and delete workout entries from the recent history table
- Progress filters by activity and date range
- Simple progress line charts for strength, run, and sprint
- Backup tools: export/import JSON data
- PWA support (install + offline cache shell)
- Dark performance theme with high-contrast neon charts
- Goal entry form
- Simple progress summary
- Recent workout history
- Data saved in browser storage (LocalStorage)

## Run locally
1. Open `index.html` in your browser.
2. Add workouts and goals.

## Publish with GitHub Pages
1. Push this repo to GitHub.
2. In GitHub, go to **Settings** → **Pages**.
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` (or your branch) and `/ (root)`
4. Click **Save**.
5. Wait about 1 minute, then open your Pages URL.
