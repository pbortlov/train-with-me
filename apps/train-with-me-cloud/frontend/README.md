# V2 Frontend

React, Vite, and TypeScript frontend for Train With Me Cloud.

## Local Commands

From this directory:

```text
npm install
npm run typecheck
npm run build
npm run dev
```

The development server proxies `/api` requests to the backend. Override the
target with:

```text
VITE_API_PROXY_TARGET=http://localhost:8000 npm run dev
```

For deployed builds, set `VITE_API_BASE_URL` when the API is hosted on a
different origin.

## Current UI

- App shell.
- Backend health check against `GET /api/health`.

## Revert Notes

This chunk adds the initial frontend shell only. It can be reverted
independently.
