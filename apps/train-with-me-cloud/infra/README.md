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

Checks:

```text
curl http://localhost:8000/api/health
curl http://localhost:8000/api/db-health
```

The API container uses `TWM_DATABASE_URL` to reach the `postgres` service.

## Revert Notes

This infrastructure chunk only adds local compose for API and PostgreSQL. It can
be reverted independently.
