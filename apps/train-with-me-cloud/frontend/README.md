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

## Container

The local container serves the production build with nginx on port `8080`.
Requests to `/api` are proxied to the backend API service in compose.

## Current UI

- Login and register screens.
- Token-backed session restore through `GET /api/auth/me`.
- Dashboard shell.
- Training space selector and create form.

## Revert Notes

The auth shell is frontend-only and uses the existing V2 API endpoints. It can
be reverted independently from backend import behavior.
