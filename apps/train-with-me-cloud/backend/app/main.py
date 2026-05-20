from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.engine import Engine

from app.core.config import get_settings
from app.db.health import DatabaseHealthError, check_database_health, get_database_engine

settings = get_settings()

app = FastAPI(title=settings.app_name)


@app.get(f"{settings.api_prefix}/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get(f"{settings.api_prefix}/db-health")
def db_health(engine: Engine = Depends(get_database_engine)) -> dict[str, str]:
    try:
        check_database_health(engine)
    except DatabaseHealthError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": {
                    "code": "database_unavailable",
                    "message": "Database connectivity check failed.",
                },
            },
        ) from exc

    return {"status": "ok"}
