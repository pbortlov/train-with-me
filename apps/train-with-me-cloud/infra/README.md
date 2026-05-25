# V2 Infrastructure

Local container and future OpenShift assets for Train With Me Cloud.

## Local Compose

From `apps/train-with-me-cloud/infra/`:

```text
docker compose -f compose.yaml up --build
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
The frontend container serves static assets and proxies `/api` requests to the
API service over the compose network.

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
