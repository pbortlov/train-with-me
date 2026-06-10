export const STORAGE_KEYS = {
  workouts: "twm_workouts_v1",
  goals: "twm_goals_v1",
  exercises: "twm_exercise_library_v1",
  plannedSessions: "twm_planned_sessions_v2",
  phaseTemplates: "twm_phase_templates_v2",
  phaseInstances: "twm_phase_instances_v2",
  uiSettings: "twm_ui_settings_v2",
} as const;

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function loadJson<T>(storage: StorageLike, key: string, fallback: T): T {
  const raw = storage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson(storage: StorageLike, key: string, value: unknown): void {
  storage.setItem(key, JSON.stringify(value));
}

export function loadNormalizedList<T>(
  storage: StorageLike,
  key: string,
  normalize: (value: unknown) => T,
): T[] {
  const stored = loadJson<unknown>(storage, key, []);
  const source = Array.isArray(stored) ? stored : [];
  const normalized = source.map(normalize);
  if (JSON.stringify(normalized) !== JSON.stringify(stored)) {
    saveJson(storage, key, normalized);
  }
  return normalized;
}
