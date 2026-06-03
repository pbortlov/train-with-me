# OpenShift Starter Manifests

These manifests are a starting point for running Train With Me Cloud on
OpenShift. They are intentionally generic and use placeholder image names.

## Files

- `secrets.example.yaml`: example secret values. Copy it to a private secret
  manifest or create equivalent secrets with `oc create secret`.
- `postgres-deployment.yaml`: PostgreSQL `Deployment`, `Service`, and persistent
  volume claim.
- `backend-deployment.yaml`: FastAPI backend `Deployment` and `Service`.
- `frontend-deployment.yaml`: nginx frontend `Deployment` and `Service`.
- `routes.yaml`: external routes for frontend and backend.

## Apply Order

From `apps/train-with-me-cloud/infra/openshift/`:

```text
oc apply -f secrets.example.yaml
oc apply -f postgres-deployment.yaml
oc apply -f backend-deployment.yaml
oc apply -f frontend-deployment.yaml
oc apply -f routes.yaml
```

Before applying to a real cluster:

- Replace placeholder image references.
- Replace all example secret values.
- Review storage class and PVC size.
- Set route hostnames appropriate for the OpenShift project.

## Revert Notes

This starter pack is additive. Remove it with:

```text
oc delete -f routes.yaml
oc delete -f frontend-deployment.yaml
oc delete -f backend-deployment.yaml
oc delete -f postgres-deployment.yaml
oc delete -f secrets.example.yaml
```
