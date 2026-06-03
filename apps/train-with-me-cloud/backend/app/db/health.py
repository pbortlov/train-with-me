from functools import lru_cache

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import get_settings


class DatabaseHealthError(RuntimeError):
    """Raised when the API cannot verify database connectivity."""


@lru_cache
def get_database_engine() -> Engine:
    return create_engine(get_settings().database_url, pool_pre_ping=True)


def check_database_health(engine: Engine) -> None:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise DatabaseHealthError("Database connectivity check failed.") from exc
