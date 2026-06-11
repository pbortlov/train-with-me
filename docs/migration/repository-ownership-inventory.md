# Repository Ownership Inventory

- Inventory date: 2026-06-10
- Source migration branch: `migration/repository-split-mvp1`
- Clean V1 branch: `migration/v1-clean`
- Mixed source checkpoint: `aa5de4a`
- Clean V1 boundary: `22f649e`
- Latest V2 checkpoint: `093de15`
- Verified V1 destination checkpoint: `319b924`
- Verified V2 destination checkpoint: `bda0ef7`
- Completion date: 2026-06-11

## Working Tree Safety

The MVP 1 branch starts clean. Before it was created, work on `next-v1-dev` was
stored in three stashes and was not applied to this branch.

The inspected pre-branch working tree contained:

- Substantive V1 changes to `README.md`,
  `docs/product/v1-code-evaluation.md`, `index.html`, `script.js`, and
  `styles.css`.
- Deletions of the tracked legacy `manifest.json` and `service-worker.js`.
- Untracked V1 Vite/PWA manifests, source modules, tests, static assets,
  `.gitlab-ci.yml`, `.gitignore`, and build configuration.
- 116 tracked permission-only changes from `100644` to `100755`, including
  nearly all V2 files and several root documents.
- Local `.codex`, IDE, dependency, build, and cache files.

The clean V1 branch transfers only the reviewed V1 content from those stashes.
It excludes `.codex`, generated files, all V2 paths, and all permission-only
changes. The original stashes remain unchanged as migration checkpoints.

## V1-Owned

V1 owns the repository root application and its eventual independent lifecycle:

- Application: `index.html`, `script.js`, `styles.css`.
- PWA compatibility files: generated manifest and worker configuration plus
  `static/service-worker.js`, which retires the historical root worker.
- Vite/PWA implementation: root `package.json`, lockfile,
  `vite.config.ts`, `tsconfig.json`, `src/`, `tests/`, `static/`, and
  `scripts/`.
- V1 deployment: root `.gitlab-ci.yml` and Pages documentation.
- Product documentation: root `README.md`, `docs/planner-overview.md`,
  `docs/review-and-adherence.md`, `docs/strength-phase-import.md`,
  `docs/product-principles.md`, root conversations, and decisions `0001`
  through `0004`.

The clean V1 dependency manifest owns Chart.js at runtime and TypeScript,
Vite, `vite-plugin-pwa`, Vitest, and Node types for development.

## V2-Owned

In the mixed source history, V2 owns all source and operational files below
`apps/train-with-me-cloud/`. Those paths are promoted to the destination
repository root:

- `frontend/`: React, React DOM, TypeScript, Vite, Nginx, frontend container,
  manifest, npm manifest, and lockfile.
- `backend/`: Python 3.12+, FastAPI, SQLAlchemy, Alembic, Psycopg, Uvicorn,
  Pytest, API source, migrations, tests, fixture, and backend container.
- `infra/`: Compose, PostgreSQL, backend/frontend services, OpenShift
  deployments, routes, persistent storage, and secret template.
- `docs/`: V2 ADRs, product scope, database model, and V1 import strategy.
- `.github/workflows/train-with-me-cloud-validation.yml`: V2 backend tests,
  frontend validation, and container build smoke tests.

V2 runtime configuration names include:

- `TWM_APP_NAME`
- `TWM_API_PREFIX`
- `TWM_ENVIRONMENT`
- `TWM_DATABASE_URL`
- `TWM_JWT_SECRET_KEY`
- `TWM_ACCESS_TOKEN_EXPIRE_MINUTES`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

OpenShift also owns the destination namespace/project, image streams or
registry paths, routes, persistent volume claim, and
`train-with-me-cloud-secrets`. This inventory records names only; secret values
must never be copied into documentation or Git history.

## Shared Or Decision-Required

- Root `README.md`: V1-owned and links to the independent cloud repository.
- `docs/agents.md`: retained as historical V1 product guidance; V2 database
  migration guidance is owned by the cloud repository.
- `.gitignore`: split to contain only V1 and local-tooling rules.
- V1 backup contract: V1 owns export behavior; V2 owns its import
  implementation and tests.
- `apps/train-with-me-cloud/backend/tests/fixtures/train-with-me-backup-sample.json`:
  V2-owned test fixture constrained by the V1-owned backup contract.
- Migration ADR, runbook, ownership inventory, and compatibility contract:
  retained in V1 and linked from V2 where cross-repository context is needed.

## Local And Tooling Noise

The following must not be migrated or committed:

- `.codex`, `.agents` local state, `.idea/`, and `.vscode/`.
- Root and frontend `node_modules/`.
- Root and frontend `dist/`, generated `public/`, and coverage output.
- Local `.env*` files except reviewed example templates.
- Permission-only changes caused by the current filesystem.

## CI And Deployment Ownership

V1:

- GitLab Pages workflow from the stashed `.gitlab-ci.yml`.
- GitHub Pages remains a supported deployment target but has no V1-owned
  workflow yet.
- Static assets, service worker, manifest, Pages base path, and browser origin.

V2:

- GitHub Actions cloud validation workflow.
- Backend and frontend container images.
- Compose development environment.
- PostgreSQL schema and Alembic migrations.
- OpenShift deployments, services, routes, registry paths, persistent data,
  configuration, and secrets.

Repository-level Pages settings, protected environments, CI variables,
container registry permissions, and secrets are external state. They must be
inventoried manually before cutover without exposing values.

## Compatibility Contracts

V1 storage keys:

- `twm_workouts_v1`
- `twm_goals_v1`
- `twm_exercise_library_v1`
- `twm_planned_sessions_v2`
- `twm_phase_templates_v2`
- `twm_phase_instances_v2`
- `twm_ui_settings_v2`

V1 backup:

- Current export version: `2`.
- Required collections: `workouts` array and `goals` object.
- Optional collections: `plannedSessions`, `phaseTemplates`,
  `phaseInstances`, and `uiSettings`.
- Metadata: numeric `version` and ISO-8601 `exportedAt`.
- Older or unversioned backups remain accepted when required collections are
  valid.

V2 import:

- Accepts the V1 top-level fields above.
- Preserves original V1 identifiers for idempotent imports.
- Imports V1 data as historical application data, not as an Alembic migration.
- Must preserve `linkedWorkoutId` relationships where both records exist.
- Must not access or mutate V1 `localStorage`.

## History Ownership

- `22f649e` is the last committed V1 application checkpoint before cloud work.
- V2 history starts with `1973a27` on 2026-05-19; extraction rewrote it to
  `e4ddf20`.
- Current `main` contains 28 commits affecting the V2 application path.
- `093de15` contains another 41 V2 commits after `main`.
- Commit `023acef` is mixed: V2 backend documentation plus root
  `docs/agents.md`. Path filtering must retain only its V2-owned content.
- The V2 extraction rewrote `093de15` to `df9cb19`, retained V2-affecting
  history, and was adapted independently through destination commit `bda0ef7`.
- Tag `migration/v2-destination-verified-2026-06-10` and bundle
  `/home/pb/train-with-me-cloud-verified-2026-06-10.bundle` record the verified
  destination checkpoint.
- The clean V1 lineage starts at `22f649e` and reapplies only reviewed V1
  content rather than merging mixed history.

## Unresolved Decisions And Risks

- Confirm whether V1 remains on GitHub, moves to GitLab, or deploys to both.
- Inventory actual CI variables, Pages settings, registry permissions, routes,
  and secrets in their hosting systems without recording values.
- A hosting-origin change makes existing browser storage appear empty; users
  need a backup export before any such cutover.
- Repository-hosting configuration remains external state and was not copied
  by Git history extraction.
- Archive refs, bundles, stashes, migration branches, and worktrees remain
  retained until a separate cleanup approval.
