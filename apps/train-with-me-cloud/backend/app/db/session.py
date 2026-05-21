from collections.abc import Iterator

from fastapi import Depends
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.db.health import get_database_engine


def get_db_session(engine: Engine = Depends(get_database_engine)) -> Iterator[Session]:
    with Session(engine) as session:
        yield session
