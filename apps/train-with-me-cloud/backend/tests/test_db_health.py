import pytest
from fastapi import HTTPException
from sqlalchemy.exc import OperationalError

from app.db.health import DatabaseHealthError, check_database_health
from app.main import db_health


class FakeConnection:
    def __init__(self) -> None:
        self.statements = []

    def __enter__(self) -> "FakeConnection":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        return None

    def execute(self, statement) -> None:
        self.statements.append(statement)


class FakeEngine:
    def __init__(self) -> None:
        self.connection = FakeConnection()

    def connect(self) -> FakeConnection:
        return self.connection


class FailingEngine:
    def connect(self):
        raise OperationalError("SELECT 1", {}, Exception("connection failed"))


def test_check_database_health_executes_select() -> None:
    engine = FakeEngine()

    check_database_health(engine)

    assert len(engine.connection.statements) == 1


def test_check_database_health_raises_domain_error_on_failure() -> None:
    with pytest.raises(DatabaseHealthError):
        check_database_health(FailingEngine())


def test_db_health_returns_ok() -> None:
    assert db_health(FakeEngine()) == {"status": "ok"}


def test_db_health_returns_503_on_failure() -> None:
    with pytest.raises(HTTPException) as exc_info:
        db_health(FailingEngine())

    assert exc_info.value.status_code == 503
    assert exc_info.value.detail == {
        "error": {
            "code": "database_unavailable",
            "message": "Database connectivity check failed.",
        },
    }
