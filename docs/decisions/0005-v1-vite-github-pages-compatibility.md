# 0005 - Build V1 With Vite And Deploy With GitHub Pages

- Date: 2026-06-10
- Status: accepted
- Amended: 2026-06-11

## Context

The root application was a buildless PWA with one large browser script,
CDN-hosted Chart.js, a hand-maintained service worker, and browser-only
storage. It must remain a single-user local application while becoming
reliably deployable under a nested static Pages project URL.

Existing users depend on seven mixed-version `localStorage` keys and JSON backups whose current export version is `2`. Changing the origin, keys, or accepted backup shape would make existing data appear lost.

The V1 repository is hosted at `pbortlov/train-with-me` on GitHub. Maintaining
a second GitLab mirror only to run GitLab Pages would add credentials,
synchronization failures, and repository divergence without improving the
application.

## Decision

- Use Vite with a relative `base` and vanilla TypeScript domain modules.
- Keep the current UI controller during incremental modularization rather than redesigning behavior in the foundation MVP.
- Bundle Chart.js locally.
- Generate the manifest and service worker with Workbox through `vite-plugin-pwa`.
- Keep a compatibility worker at the historical `service-worker.js` URL so existing cache-first installations delete the obsolete cache and can load the new generated worker.
- Precache the production application shell and use a network-first navigation fallback to the cached app.
- Download updates in the background but require the user to select `Update now` before activation and reload.
- Continue reading and writing all existing storage keys.
- Continue exporting backup version `2` and importing older or unversioned backups when required `workouts` and `goals` data is valid.
- Keep GitHub as the canonical V1 repository.
- Validate pull requests and pushes with GitHub Actions.
- Publish `dist/` with the official GitHub Pages artifact and deployment
  actions only after a successful push to `main`.
- Use `https://pbortlov.github.io/train-with-me/` as the sole production
  origin. Do not run a parallel GitLab Pages deployment.

## Consequences

- Local development requires Node.js and Vite instead of opening the HTML file directly.
- Charts and the application shell work after the first successful online load without a CDN.
- Deployments work below the nested GitHub Pages project path.
- Browser data remains local and origin-bound; users still need external JSON backups.
- Moving users from another hostname or protocol requires a backup export from
  the old origin and restore at the GitHub Pages origin.
- The large UI controller remains technical debt and should be split by later MVPs without changing the compatibility modules introduced here.
