from dataclasses import dataclass, field
from typing import Any


class V1BackupParseError(ValueError):
    pass


@dataclass(frozen=True)
class V1BackupSummary:
    version: int | None
    exported_at: str | None
    workout_count: int
    planned_session_count: int
    goal_count: int
    phase_template_count: int
    phase_instance_count: int
    warnings: list[str] = field(default_factory=list)


OPTIONAL_COLLECTIONS = {
    "plannedSessions": "planned session",
    "phaseTemplates": "phase template",
    "phaseInstances": "phase instance",
}


def parse_v1_backup_summary(payload: dict[str, Any]) -> V1BackupSummary:
    if not isinstance(payload, dict):
        raise V1BackupParseError("V1 backup must be a JSON object.")

    warnings: list[str] = []
    workouts = require_list(payload, "workouts")
    goals = require_object(payload, "goals")

    optional_counts = {
        key: count_optional_collection(payload, key, label, warnings)
        for key, label in OPTIONAL_COLLECTIONS.items()
    }

    if "version" not in payload:
        warnings.append("Backup is missing version.")
    elif payload.get("version") != 2:
        warnings.append(f"Backup version {payload.get('version')} is not the expected V1 export version 2.")

    exported_at = payload.get("exportedAt")
    if exported_at is not None and not isinstance(exported_at, str):
        warnings.append("Backup exportedAt is not a string.")
        exported_at = None
    if exported_at is None:
        warnings.append("Backup is missing exportedAt.")

    return V1BackupSummary(
        version=payload.get("version") if isinstance(payload.get("version"), int) else None,
        exported_at=exported_at,
        workout_count=len(workouts),
        planned_session_count=optional_counts["plannedSessions"],
        goal_count=count_goals(goals),
        phase_template_count=optional_counts["phaseTemplates"],
        phase_instance_count=optional_counts["phaseInstances"],
        warnings=warnings,
    )


def require_list(payload: dict[str, Any], key: str) -> list[Any]:
    value = payload.get(key)
    if not isinstance(value, list):
        raise V1BackupParseError(f"V1 backup requires {key} to be an array.")
    return value


def require_object(payload: dict[str, Any], key: str) -> dict[str, Any]:
    value = payload.get(key)
    if not isinstance(value, dict):
        raise V1BackupParseError(f"V1 backup requires {key} to be an object.")
    return value


def count_optional_collection(
    payload: dict[str, Any],
    key: str,
    label: str,
    warnings: list[str],
) -> int:
    value = payload.get(key)
    if value is None:
        warnings.append(f"Backup is missing optional {key}; treating as 0 {label}s.")
        return 0
    if not isinstance(value, list):
        warnings.append(f"Backup {key} is not an array; treating as 0 {label}s.")
        return 0
    return len(value)


def count_goals(goals: dict[str, Any]) -> int:
    count = 0
    if goals.get("strength") is not None:
        count += 1
    active = goals.get("active")
    if isinstance(active, dict):
        count += sum(1 for value in active.values() if value)
    history = goals.get("history")
    if isinstance(history, list):
        count += len(history)
    return count
