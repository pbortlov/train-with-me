from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.engine import Engine

from app.auth.routes import router as auth_router
from app.coach_invites.routes import router as coach_invites_router
from app.core.config import get_settings
from app.db.health import DatabaseHealthError, check_database_health, get_database_engine
from app.goals.routes import router as goals_router
from app.imports.routes import router as imports_router
from app.plans.routes import router as plans_router
from app.spaces.routes import router as spaces_router
from app.suggestions.routes import router as suggestions_router
from app.workouts.routes import router as workouts_router

settings = get_settings()

app = FastAPI(title=settings.app_name)
app.include_router(auth_router, prefix=f"{settings.api_prefix}/auth")
app.include_router(coach_invites_router, prefix=settings.api_prefix)
app.include_router(goals_router, prefix=f"{settings.api_prefix}/training-spaces/{{training_space_id}}/goals")
app.include_router(imports_router, prefix=f"{settings.api_prefix}/imports")
app.include_router(spaces_router, prefix=f"{settings.api_prefix}/training-spaces")
app.include_router(plans_router, prefix=f"{settings.api_prefix}/training-spaces/{{training_space_id}}/planned-sessions")
app.include_router(suggestions_router, prefix=f"{settings.api_prefix}/training-spaces/{{training_space_id}}/coach-suggestions")
app.include_router(workouts_router, prefix=f"{settings.api_prefix}/training-spaces/{{training_space_id}}/workouts")


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
