from fastapi.routing import APIRoute

from app.imports.routes import preview_v1_backup
from app.main import app
from tests.test_v1_parser import load_sample_backup


def test_preview_v1_backup_returns_summary() -> None:
    response = preview_v1_backup(load_sample_backup())

    assert response.valid is True
    assert response.summary is not None
    assert response.summary.version == 2
    assert response.summary.exported_at == "2026-05-22T10:00:00.000Z"
    assert response.summary.workout_count == 2
    assert response.summary.planned_session_count == 1
    assert response.summary.goal_count == 3
    assert response.summary.phase_template_count == 1
    assert response.summary.phase_instance_count == 1
    assert response.warnings == []
    assert response.unsupported_fields == []


def test_preview_v1_backup_response_uses_api_field_names() -> None:
    response = preview_v1_backup(load_sample_backup())

    assert response.model_dump(by_alias=True) == {
        "valid": True,
        "summary": {
            "version": 2,
            "exportedAt": "2026-05-22T10:00:00.000Z",
            "workoutCount": 2,
            "plannedSessionCount": 1,
            "goalCount": 3,
            "phaseTemplateCount": 1,
            "phaseInstanceCount": 1,
        },
        "warnings": [],
        "unsupportedFields": [],
    }


def test_preview_v1_backup_reports_invalid_backup() -> None:
    response = preview_v1_backup({"goals": {}})

    assert response.valid is False
    assert response.summary is None
    assert response.warnings == ["V1 backup requires workouts to be an array."]
    assert response.unsupported_fields == []


def test_preview_v1_backup_reports_unsupported_top_level_fields() -> None:
    payload = load_sample_backup()
    payload["futureField"] = {"value": True}

    response = preview_v1_backup(payload)

    assert response.valid is True
    assert response.unsupported_fields == ["futureField"]


def test_v1_import_preview_route_is_registered() -> None:
    route_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }

    assert "/api/imports/v1/preview" in route_paths
