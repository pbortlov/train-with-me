# 0011 - Add Local-First Onboarding And Backup UX

- Date: 2026-06-29
- Status: accepted

## Context

Train With Me remains a single-user local-first PWA. That keeps the app simple
and private, but the user's training history is tied to browser storage on the
current device and origin. The interface needs to make the safe workflow visible
without adding accounts, sync, or a new storage contract.

## Decision

- Add a Today onboarding card that explains the local-first flow: plan/log,
  review progress, and export backups.
- Add a Data-page backup safety checklist before export/import controls.
- Add a keyboard skip link to improve app navigation for keyboard and assistive
  technology users.
- Keep backup export/import behavior unchanged.
- Do not add a backend, authentication, cloud sync, new backup fields, or new
  `localStorage` keys.

## Consequences

- New users get clearer guidance before they lose local data accidentally.
- Backup risk is visible at the point where users export or import data.
- Accessibility improves without changing the application route structure.
- Backup reminders are still manual; automated reminder state can be considered
  later if it is worth adding storage.
