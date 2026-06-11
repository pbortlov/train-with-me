# Repository Split Completion Record

- Completion date: 2026-06-11
- V1 repository: [`pbortlov/train-with-me`](https://github.com/pbortlov/train-with-me)
- V1 verified `main`: `319b924ee2982512c5aa8ff8cc8971815dbed551`
- V2 repository: [`pbortlov/train-with-me-cloud`](https://github.com/pbortlov/train-with-me-cloud)
- V2 verified `main`: `bda0ef7e8a68f89ba24881f45f3e5408e82487ba`

## Final Ownership

V1 exclusively owns the single-user local-first PWA, browser storage, backup
export and restore behavior, Vite/PWA dependencies, static Pages deployment,
and V1 release lifecycle.

V2 exclusively owns authentication, backend APIs, PostgreSQL, synchronization,
coach-athlete collaboration, V1 backup ingestion, containers, OpenShift
infrastructure, and the V2 release lifecycle.

The repositories share no runtime package, lockfile, CI pipeline, deployment
configuration, release tag, or mutable source directory. Their supported
integration is the documented V1 backup JSON contract.

## Validation Evidence

V1 was cloned from remote `main` and passed:

- `npm ci` with zero audit vulnerabilities.
- 15 unit tests.
- TypeScript validation and production PWA build.
- Relative-path and offline-shell smoke checks.
- Checks proving V2 application and workflow paths are absent.

V2 was cloned from remote `main` and passed:

- 94 backend tests in a fresh virtual environment.
- Frontend `npm ci`, typecheck, and production build with zero audit
  vulnerabilities.
- Podman Compose configuration validation.
- Backend and frontend Podman image builds.
- Checks proving V1 application and GitLab Pages paths are absent.

V1 manual testing confirmed application behavior, backup compatibility,
offline use, PWA assets, and the absence of authentication or cloud sync.
Earlier V2 manual testing confirmed registration, login, database persistence,
duplicate-safe V1 import, and frontend/API operation.

## Recovery Checkpoints

- Mixed source bundle:
  `/home/pb/train-with-me-before-split.bundle`
- Verified V1 bundle:
  `/home/pb/train-with-me-v1-clean-319b924.bundle`
- Verified V2 bundle:
  `/home/pb/train-with-me-cloud-verified-2026-06-10.bundle`
- Previous mixed `main`: `archive/pre-split-main-aa5de4a`
- Latest V2 source: `archive/pre-split-v2-093de15`
- V2 verification tag:
  `migration/v2-destination-verified-2026-06-10`

All three bundles were verified after the default-branch cutover.

## Deferred Cleanup

Migration branches, worktrees, the extraction clone, filter-repo metadata,
stashes, archive refs, and bundles remain retained. Removing temporary
resources requires separate explicit approval and must not remove recovery
checkpoints or compatibility records.
