from fastapi.routing import APIRoute

from app.main import app, health


def test_health_returns_ok() -> None:
    assert health() == {"status": "ok"}


def test_health_route_is_registered() -> None:
    route_paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }

    assert "/api/health" in route_paths
