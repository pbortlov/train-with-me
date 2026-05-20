# Train With Me Cloud

This directory contains the future database-backed Train With Me V2 app.

The current production/reference app remains the static PWA in the repository
root:

- `index.html`
- `script.js`
- `styles.css`
- `manifest.json`
- `service-worker.js`

Those root files continue to support GitHub Pages while this cloud version is
developed separately.

## Planned Shape

- `frontend/`: React, Vite, TypeScript, and PWA frontend.
- `backend/`: FastAPI backend.
- `infra/`: local container and future deployment assets.
- `docs/`: V2 architecture, product, database, import, and ADR notes.

## Local Development Direction

Local development will use containers once the API, database, and frontend
tooling exist. The expected local services are:

- API service
- PostgreSQL service
- frontend service

The backend currently has a minimal FastAPI health endpoint. From
`apps/train-with-me-cloud/backend/`:

```text
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e ".[dev]"
python -m pytest
python -m uvicorn app.main:app --reload
```

Containers are not available yet.

## Deployment Direction

V2 is not intended to run on GitHub Pages because it requires backend and
database services. The future deployment target is OpenShift after the local
container path works.

## V1 Data Migration Direction

V2 will import from V1 backup JSON exported by the root static app. It will not
read or mutate V1 browser `localStorage` directly.

Imported V1 history should be treated as historical data and marked so coaches
cannot directly edit it.

## Revert Notes

This scaffold is documentation-only. It can be reverted with:

```text
git revert <commit>
```
