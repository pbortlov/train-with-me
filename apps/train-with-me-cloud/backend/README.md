# V2 Backend

FastAPI backend for Train With Me Cloud.

## Current API

- `GET /api/health`
- `GET /api/db-health`

## Database

Alembic migrations live in `migrations/`.

```text
python -m alembic upgrade head
```

The initial schema creates:

- `users`
- `training_spaces`
- `training_space_memberships`

## Local Commands

From this directory:

```text
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e ".[dev]"
python -m pytest
python -m uvicorn app.main:app --reload
```

The API docs are available at `/docs` when the development server is running.

## Environment Variables

Settings use the `TWM_` prefix.

- `TWM_APP_NAME`: API title. Defaults to `Train With Me Cloud API`.
- `TWM_API_PREFIX`: API route prefix. Defaults to `/api`.
- `TWM_ENVIRONMENT`: runtime environment label. Defaults to `local`.
- `TWM_DATABASE_URL`: SQLAlchemy database URL. Defaults to the future compose
  PostgreSQL service URL.

## Revert Notes

The first backend chunk added the minimal API health app and tests. The database
health chunk added connectivity configuration and `/api/db-health`. The initial
schema chunk adds Alembic and the ownership tables only.
