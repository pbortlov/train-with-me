# V2 Infrastructure

Local container and future OpenShift assets for Train With Me Cloud.

## Local Podman Compose

From `apps/train-with-me-cloud/infra/`:

```text
podman compose -f compose.yaml up --build
```

Services:

- `postgres`: PostgreSQL 16.
- `api`: FastAPI backend on port `8000`.
- `frontend`: Static frontend on port `8080`.

Checks:

```text
curl http://localhost:8000/api/health
curl http://localhost:8000/api/db-health
curl http://localhost:8080/
curl http://localhost:8080/api/health
```

The API container uses `TWM_DATABASE_URL` to reach the `postgres` service.
On startup, the API container applies pending Alembic migrations before serving
requests, so a fresh Postgres volume is initialized automatically.
The frontend container serves static assets and proxies `/api` requests to the
API service over the compose network.

## Keeping Local Data

PostgreSQL data is stored in the named compose volume `infra_postgres-data`.
Normal rebuilds keep this volume, so registered users and training spaces
survive container rebuilds.

Use this for everyday development:

```text
podman compose -f compose.yaml up --build
```

If only one service changed, rebuild just that service:

```text
podman compose -f compose.yaml up --build api
podman compose -f compose.yaml up --build frontend
```

To stop containers while keeping database data:

```text
podman compose -f compose.yaml down
```

Only wipe the local database when you intentionally want a fresh start:

```text
podman compose -f compose.yaml down -v
```

Do not use `down -v`, `podman volume rm infra_postgres-data`, or
`podman system prune --volumes` during normal development unless losing local
users and training data is expected.

## Revert Notes

The first infrastructure chunk added local compose for API and PostgreSQL. The
frontend container chunk adds the static frontend service and nginx API proxy
only.

## OpenShift

Starter OpenShift manifests live in `openshift/`. They are placeholders for a
future cluster deployment and should be reviewed before use:

- Replace image references.
- Replace example secret values.
- Confirm route hostnames and storage settings.
