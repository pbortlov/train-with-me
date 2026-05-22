import json
from pathlib import Path

import pytest

from app.imports.v1_parser import V1BackupParseError, parse_v1_backup_summary


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "train-with-me-backup-sample.json"


def load_sample_backup() -> dict:
    return json.loads(FIXTURE_PATH.read_text())


def test_parse_v1_backup_summary() -> None:
    summary = parse_v1_backup_summary(load_sample_backup())

    assert summary.version == 2
    assert summary.exported_at == "2026-05-22T10:00:00.000Z"
    assert summary.workout_count == 2
    assert summary.planned_session_count == 1
    assert summary.goal_count == 3
    assert summary.phase_template_count == 1
    assert summary.phase_instance_count == 1
    assert summary.warnings == []


def test_parse_v1_backup_summary_with_missing_optional_collections() -> None:
    payload = load_sample_backup()
    payload.pop("plannedSessions")
    payload.pop("phaseTemplates")
    payload.pop("phaseInstances")

    summary = parse_v1_backup_summary(payload)

    assert summary.planned_session_count == 0
    assert summary.phase_template_count == 0
    assert summary.phase_instance_count == 0
    assert summary.warnings == [
        "Backup is missing optional plannedSessions; treating as 0 planned sessions.",
        "Backup is missing optional phaseTemplates; treating as 0 phase templates.",
        "Backup is missing optional phaseInstances; treating as 0 phase instances.",
    ]


def test_parse_v1_backup_rejects_invalid_top_level_shape() -> None:
    with pytest.raises(V1BackupParseError, match="JSON object"):
        parse_v1_backup_summary([])


def test_parse_v1_backup_requires_workouts_and_goals() -> None:
    with pytest.raises(V1BackupParseError, match="workouts"):
        parse_v1_backup_summary({"goals": {}})

    with pytest.raises(V1BackupParseError, match="goals"):
        parse_v1_backup_summary({"workouts": []})
