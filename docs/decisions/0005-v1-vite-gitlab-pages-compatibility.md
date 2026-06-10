# 0005 - Build V1 With Vite And Preserve Browser Data Compatibility

- Date: 2026-06-10
- Status: accepted

## Context

The root application was a buildless PWA with one large browser script, CDN-hosted Chart.js, a hand-maintained service worker, and browser-only storage. It must remain a single-user local application while becoming reliably deployable under nested GitLab Pages project URLs.

Existing users depend on seven mixed-version `localStorage` keys and JSON backups whose current export version is `2`. Changing the origin, keys, or accepted backup shape would make existing data appear lost.

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
- Publish `dist/` as a `public/` artifact through the broadly compatible GitLab `pages` job.

## Consequences

- Local development requires Node.js and Vite instead of opening the HTML file directly.
- Charts and the application shell work after the first successful online load without a CDN.
- Deployments work below nested GitLab Pages project paths.
- Browser data remains local and origin-bound; users still need external JSON backups.
- The large UI controller remains technical debt and should be split by later MVPs without changing the compatibility modules introduced here.
