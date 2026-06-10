# V1 And V2 Repository Split Runbook

This runbook defines commands for later migration MVPs. Do not execute a later
MVP until the preceding MVP has been manually verified and explicitly approved.

## Fixed Names And Checkpoints

```text
Source repository:        pbortlov/train-with-me
Assumed V2 destination:   pbortlov/train-with-me-cloud
V1 clean boundary:        22f649e0ed60c5abffa6754b6d57962752509915
Mixed main checkpoint:    aa5de4acfe03784ed3a53a37318abf9d4cf2b2f1
Latest V2 checkpoint:     093de150c2a42b3511052d03c23028b3ce26886f
V1 migration branch:      migration/v1-clean
V2 source branch:         migration/v2-extraction-source
Temporary V2 remote:      v2-destination
```

Existing safety assets:

```text
/home/pb/train-with-me-before-split.bundle
archive/pre-split-main-aa5de4a
archive/pre-split-v2-093de15
migration/repository-split-mvp1
```

## MVP 2: Prepare And Extract V2 History

Prerequisites:

- MVP 1 is committed and manually approved.
- Destination name and owner are approved.
- `git-filter-repo` is installed and its version recorded.
- The source bundle and remote archive refs verify successfully.
- No extraction is performed in the active source worktree.

Create a fresh local source clone from the bundle:

```bash
cd /home/pb
git clone train-with-me-before-split.bundle train-with-me-v2-extraction
cd train-with-me-v2-extraction
git switch -c migration/v2-extraction-source \
  093de150c2a42b3511052d03c23028b3ce26886f
git status --short --branch
```

Record the source tree and history before filtering:

```bash
git rev-parse HEAD > ../train-with-me-v2-source-head.txt
git ls-tree -r --name-only HEAD:apps/train-with-me-cloud \
  > ../train-with-me-v2-source-tree.txt
git log --format='%H%x09%aI%x09%an%x09%s' \
  -- apps/train-with-me-cloud \
  > ../train-with-me-v2-source-history.txt
```

Filter and promote the V2 application directory:

```bash
git filter-repo --force \
  --path apps/train-with-me-cloud/ \
  --path .github/workflows/train-with-me-cloud-validation.yml \
  --path-rename apps/train-with-me-cloud/:
```

Archive filter metadata and verify ownership:

```bash
cp -R .git/filter-repo ../train-with-me-v2-filter-repo-metadata
git status --short --branch
git ls-tree -r --name-only HEAD | sort \
  > ../train-with-me-v2-extracted-tree.txt
test -f backend/pyproject.toml
test -f frontend/package.json
test -f infra/compose.yaml
test -f .github/workflows/train-with-me-cloud-validation.yml
test ! -e apps/train-with-me-cloud
test ! -e script.js
```

Do not create or push the destination remote in this MVP unless the user has
explicitly approved its URL.

## MVP 3: Make Extracted V2 Independent

Update root-relative paths after extraction:

- Change GitHub Actions working directories and cache paths from
  `apps/train-with-me-cloud/...` to `backend/...` and `frontend/...`.
- Update V2 README and documentation links to the new repository layout.
- Add a destination-root `.gitignore` covering frontend, Python, build, and
  local environment outputs.
- Keep backend and frontend dependency manifests independent.

Run:

```bash
cd /home/pb/train-with-me-v2-extraction/backend
python -m pip install --upgrade pip
python -m pip install '.[dev]'
python -m pytest -q

cd ../frontend
npm ci
npm run typecheck
npm run build

cd ..
docker build -t train-with-me-cloud-api:migration backend
docker build -t train-with-me-cloud-web:migration frontend
docker compose -f infra/compose.yaml config
```

Do not publish images or deploy.

## MVP 4: Transfer V2 Operational Ownership

Before configuring CI/CD, inventory without exposing values:

- GitHub Actions variables, secrets, environments, and branch protections.
- Container registry host, project, repositories, credentials, and retention.
- PostgreSQL database, user, backup location, storage class, and restore test.
- OpenShift project, routes, image references, service account, secrets,
  persistent volumes, and deployment variables.

Create the approved destination and temporary remote:

```bash
git remote add v2-destination \
  git@github.com:pbortlov/train-with-me-cloud.git
git remote -v
git push -u v2-destination migration/v2-extraction-source:main
```

Do not force-push. Protect destination `main` before normal development.

## MVP 5: Cross-Repository Contracts

- Link each repository to the other by stable URL.
- Publish the V1 backup version and required/optional fields in both
  repositories.
- Record the V1 version or commit used for each V2 import compatibility test.
- Keep the canonical export fixture in V1 and a tested consumer fixture in V2,
  with provenance documented.
- Use independent release tags; do not reuse one repository's tags in the
  other.

## MVP 6: Verify And Archive V2

Compare source and destination trees:

```bash
git -C /home/pb/train-with-me \
  archive 093de15:apps/train-with-me-cloud \
  | tar -tf - | sort > /tmp/v2-source-tree.txt

git -C /home/pb/train-with-me-v2-extraction \
  ls-tree -r --name-only main | sort > /tmp/v2-destination-tree.txt

diff -u /tmp/v2-source-tree.txt /tmp/v2-destination-tree.txt
```

Expected differences must be limited to approved repository-root adaptations
such as workflow paths, root ignore rules, and documentation links.

Create a destination bundle and checkpoint:

```bash
git -C /home/pb/train-with-me-v2-extraction \
  bundle create /home/pb/train-with-me-cloud-verified.bundle --all
git bundle verify /home/pb/train-with-me-cloud-verified.bundle
git -C /home/pb/train-with-me-v2-extraction tag \
  migration/v2-extraction-verified
```

Source deletion remains prohibited at this point.

## MVP 7: Build The Clean V1 Lineage

Create a separate worktree from the clean V1 boundary:

```bash
cd /home/pb/train-with-me
git branch migration/v1-clean \
  22f649e0ed60c5abffa6754b6d57962752509915
git worktree add /home/pb/train-with-me-v1-clean migration/v1-clean
```

Transfer only reviewed V1-owned content:

- Vite/PWA files and tests from the intended `next-v1-dev` stash.
- V1 documentation and compatibility contracts.
- Migration ADR, inventory, and runbook.
- V1-specific ignore and Pages workflow files.

Never apply a complete stash without first inspecting:

```bash
git stash list --date=local
git stash show --stat 'stash@{0}'
git stash show --name-status --include-untracked 'stash@{0}'
```

Do not carry V2 paths, V2 workflow files, V2 database guidance, local noise, or
permission-only changes into the clean V1 branch.

## MVP 8: Verify And Cut Over V1

Required automated validation:

```bash
cd /home/pb/train-with-me-v1-clean
npm ci
npm run check
git diff --check
git ls-tree -r --name-only HEAD | grep '^apps/train-with-me-cloud/' && exit 1
```

Required manual validation:

1. Serve the production build from the intended Pages base path.
2. Confirm installability, offline startup, update behavior, and compatibility
   service-worker behavior.
3. Load data under every existing `localStorage` key.
4. Export a version 2 backup and restore it into a fresh browser profile.
5. Restore an older or unversioned valid backup.
6. Confirm no backend, login, or synchronization behavior exists.
7. Confirm GitHub Pages or GitLab Pages preserves the existing browser origin,
   or require users to export a backup before an origin change.

Only after explicit approval may the source default branch be changed. Preserve
the archive branches and bundle after cutover.

## MVP 9: Final Cleanup

- Confirm V1 and V2 complete test suites pass from clean clones.
- Confirm no duplicate code, CI, deployment, or release ownership remains.
- Retain backup fixtures, ADRs, compatibility documentation, archive refs,
  filter-repo metadata, and verified bundles.
- Remove temporary remotes and worktrees only after final approval.
- Never delete archive refs or bundles as part of routine cleanup.
