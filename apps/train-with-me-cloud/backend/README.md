# V2 Backend

FastAPI backend for Train With Me Cloud.

## Current API

- `GET /api/health`

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

## Revert Notes

This backend chunk only adds the minimal API health app and tests. It can be
reverted independently.
