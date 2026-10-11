import { describe, expect, it } from "vitest";
import { buildStrengthExerciseProgressList } from "../src/domain/strength-exercise-progress";

describe("strength exercise progress list", () => {
  it("lists every exercise identity, including exercises without saved targets", () => {
    const rows = buildStrengthExerciseProgressList([
      {
        activity: "strength",
        date: "2026-10-01",
        strengthExercises: [
          {
            name: "Back squat",
            variation: "High bar",
            equipment: "Barbell",
            sets: [{ reps: 8, weight: 80, loadType: "kg" }],
          },
          {
            name: "Pull-up",
            loadType: "bodyweight",
            sets: [{ reps: 6, loadType: "bodyweight" }],
          },
        ],
      },
    ]);

    expect(rows.map((row) => row.exercise)).toEqual(["Back squat", "Pull-up"]);
    expect(rows[0].hasSavedTarget).toBe(false);
    expect(rows[1].loadType).toBe("bodyweight");
  });

  it("keeps unlike variations and equipment as separate rows", () => {
    const rows = buildStrengthExerciseProgressList([
      {
        activity: "strength",
        date: "2026-10-01",
        strengthExercises: [
          { name: "Press", variation: "Strict", equipment: "Barbell", sets: [{ reps: 5, weight: 40 }] },
          { name: "Press", variation: "Strict", equipment: "Dumbbell", sets: [{ reps: 5, weight: 20 }] },
        ],
      },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.equipment).sort()).toEqual(["Barbell", "Dumbbell"]);
  });

  it("labels pain and session-excluded history without removing it", () => {
    const rows = buildStrengthExerciseProgressList([
      {
        activity: "strength",
        date: "2026-10-01",
        strengthContext: { hasPain: true },
        strengthExercises: [{ name: "Back squat", sets: [{ reps: 8, weight: 80 }] }],
      },
      {
        activity: "strength",
        date: "2026-10-02",
        strengthExercises: [{ name: "Bench press", painAffected: true, sets: [{ reps: 8, weight: 60 }] }],
      },
    ]);

    expect(rows.find((row) => row.exercise === "Back squat")?.latestStatus).toBe("session-excluded");
    expect(rows.find((row) => row.exercise === "Bench press")?.latestStatus).toBe("pain-excluded");
  });

  it("marks a matching kg profile as having a saved target", () => {
    const rows = buildStrengthExerciseProgressList([
      {
        activity: "strength",
        date: "2026-10-01",
        strengthExercises: [{ name: "Deadlift", equipment: "Barbell", sets: [{ reps: 5, weight: 100 }] }],
      },
    ], [{ key: "deadlift\u0000\u0000barbell\u0000kg", exercise: "Deadlift", loadType: "kg" } as never]);

    expect(rows[0].hasSavedTarget).toBe(true);
  });
});
