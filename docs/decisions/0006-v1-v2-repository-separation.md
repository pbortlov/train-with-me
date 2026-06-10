# 0005 - Separate V1 And V2 Into Independent Repositories

- Date: 2026-06-10
- Status: accepted

## Context

The repository currently contains two products with different architecture and
release requirements:

- V1 is the root single-user, local-first PWA.
- V2 is the cloud application under `apps/train-with-me-cloud/`.

V1 must remain deployable to GitHub Pages or GitLab Pages without a backend,
authentication, or cloud synchronization. V2 owns its React frontend, FastAPI
backend, PostgreSQL database, authentication, synchronization, collaboration,
containers, and OpenShift infrastructure.

The current `main` commit is `aa5de4a`. The last committed V1 application
checkpoint before cloud development is `22f649e`. The latest V2 branch is
`v2-UI-alike-V1` at `093de15`, which includes 41 V2 commits after current
`main`.

## Decision

Separate the products through small, reversible migration MVPs.

- Keep `train-with-me` as the V1 source repository.
- Use [`pbortlov/train-with-me-cloud`](https://github.com/pbortlov/train-with-me-cloud)
  as the V2 destination repository.
- Build a clean V1 lineage from `22f649e` instead of merging the mixed
  post-boundary history.
- Extract V2 from `093de15` in a fresh clone with `git filter-repo`, retaining
  `apps/train-with-me-cloud/` and its GitHub Actions workflow.
- Promote `apps/train-with-me-cloud/` to the extracted repository root.
- Preserve immutable archive branches for `aa5de4a` and `093de15`, plus an
  external bundle containing all refs and stashes.
- Do not remove V2-owned files from V1 until the destination is created,
  backed up, independently validated, and tree-compared with the source.
- Do not replace the V1 default branch until the clean V1 lineage passes its
  complete automated and manual checks.

## Migration Checkpoint

As of 2026-06-10:

- The extracted V2 repository is published and independently verified at
  commit `bda0ef7`.
- Tag `migration/v2-destination-verified-2026-06-10` records the verified V2
  checkpoint.
- Bundle `/home/pb/train-with-me-cloud-verified-2026-06-10.bundle` provides an
  external V2 backup.
- Branch `migration/v1-clean` rebuilds the V1-only lineage from `22f649e`.
- The original repository and archive refs remain unchanged until the V1
  branch completes automated and manual verification.

## Ownership And Compatibility

V1 exclusively owns its browser storage and backup export contract. The
following `localStorage` keys must not change:

- `twm_workouts_v1`
- `twm_goals_v1`
- `twm_exercise_library_v1`
- `twm_planned_sessions_v2`
- `twm_phase_templates_v2`
- `twm_phase_instances_v2`
- `twm_ui_settings_v2`

V1 continues to export backup version `2` and must accept compatible older or
unversioned backups when their required `workouts` and `goals` collections are
valid. V2 may import exported V1 JSON but must never read or mutate V1 browser
storage directly.

The repositories will link to each other by stable repository URLs and record
the tested V1 backup version in compatibility documentation. They will not
share runtime packages, lockfiles, release tags, CI pipelines, or deployment
lifecycles.

## Sequence

1. Record inventory, boundaries, checkpoints, and exact future commands.
2. Extract V2 history into a local destination clone.
3. Make the extracted V2 repository independently buildable and testable.
4. Transfer V2 CI/CD, container, database, registry, and OpenShift ownership.
5. Update cross-repository documentation and compatibility contracts.
6. Verify and back up the V2 destination.
7. Build and verify the clean V1 lineage from `22f649e`.
8. Replace the V1 default branch and remove duplicate V2 ownership only after
   explicit approval.
9. Run final end-to-end validation and retain migration archives.

## Rollback And Checkpoints

- Bundle: `/home/pb/train-with-me-before-split.bundle`
- Mixed main archive: `archive/pre-split-main-aa5de4a`
- Latest V2 archive: `archive/pre-split-v2-093de15`
- MVP 1 branch: `migration/repository-split-mvp1`
- Planned V1 branch: `migration/v1-clean`
- Planned V2 source branch: `migration/v2-extraction-source`
- Planned temporary destination remote: `v2-destination`

Each migration MVP produces one reviewable commit and stops for manual
confirmation. Rollback uses the archive refs or bundle; migration work must not
force-update or delete those checkpoints.

## Consequences

- Rewritten V2 commit hashes are expected because paths and parent
  relationships change. Authors, dates, messages, and logical history remain.
- The V1 clean lineage intentionally excludes cloud-only and mixed merge
  commits after `22f649e`; retained V1 documentation is reapplied explicitly.
- CI secrets and hosting settings must be recreated in the destination because
  Git history does not transfer repository settings or secret values.
- Cross-repository backup compatibility becomes a documented, versioned
  contract rather than shared source ownership.

## Revert Notes

MVP 1 is documentation-only. Reverting it does not change either application.
Later migration rollback must follow the checkpoint procedure in the runbook.
