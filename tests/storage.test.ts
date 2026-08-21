import { describe, expect, it } from "vitest";
import { loadJson, loadNormalizedList, saveJson, STORAGE_KEYS, type StorageLike } from "../src/domain/storage";

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

describe("storage compatibility", () => {
  it("keeps every historical key unchanged", () => {
    expect(Object.values(STORAGE_KEYS)).toEqual([
      "twm_workouts_v1",
      "twm_goals_v1",
      "twm_exercise_library_v1",
      "twm_planned_sessions_v2",
      "twm_phase_templates_v2",
      "twm_phase_instances_v2",
      "twm_ui_settings_v2",
      "twm_strength_progression_v1",
    ]);
  });

  it("loads valid JSON and falls back for malformed JSON", () => {
    const storage = memoryStorage({ valid: "[1,2]", invalid: "{" });
    expect(loadJson(storage, "valid", [])).toEqual([1, 2]);
    expect(loadJson(storage, "invalid", ["fallback"])).toEqual(["fallback"]);
  });

  it("writes JSON without changing the storage contract", () => {
    const storage = memoryStorage();
    saveJson(storage, STORAGE_KEYS.workouts, [{ id: "w1" }]);
    expect(loadJson(storage, STORAGE_KEYS.workouts, [])).toEqual([{ id: "w1" }]);
  });

  it("persists normalized legacy collections back to the same key", () => {
    const storage = memoryStorage({
      [STORAGE_KEYS.workouts]: JSON.stringify([{ id: "w1", distance: "5" }]),
    });
    const workouts = loadNormalizedList(storage, STORAGE_KEYS.workouts, (value) => {
      const workout = value as { id: string; distance: string | number };
      return { ...workout, distance: Number(workout.distance) };
    });

    expect(workouts).toEqual([{ id: "w1", distance: 5 }]);
    expect(loadJson(storage, STORAGE_KEYS.workouts, [])).toEqual([{ id: "w1", distance: 5 }]);
  });
});
