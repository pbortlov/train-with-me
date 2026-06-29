import { describe, expect, it } from "vitest";

import { buildStrengthInsights } from "../src/domain/strength-insights";

describe("buildStrengthInsights", () => {
  it("summarizes strength workouts without mixing load types", () => {
    const insights = buildStrengthInsights([
      {
        activity: "strength",
        date: "2026-06-20",
        strengthExercises: [
          {
            name: "Back squat",
            sets: [
              { reps: 5, weight: 100, loadType: "kg" },
              { reps: 5, weight: 105, loadType: "kg" },
            ],
          },
          {
            name: "Pull-up",
            sets: [
              { reps: 8, loadType: "bodyweight" },
              { reps: 12, loadType: "band", bandColor: "purple" },
            ],
          },
        ],
      },
      {
        activity: "strength",
        date: "2026-06-24",
        strengthExercises: [
          {
            name: "Back squat",
            sets: [{ reps: 3, weight: 110, loadType: "kg" }],
          },
        ],
      },
      {
        activity: "run",
        date: "2026-06-25",
      },
    ]);

    expect(insights.workoutCount).toBe(2);
    expect(insights.latestWorkoutDate).toBe("2026-06-24");
    expect(insights.uniqueExerciseCount).toBe(2);
    expect(insights.totalSets).toBe(5);
    expect(insights.kgSetCount).toBe(3);
    expect(insights.bodyweightSetCount).toBe(1);
    expect(insights.bandSetCount).toBe(1);
    expect(insights.topKgLift).toEqual({
      exercise: "Back squat",
      weight: 110,
      reps: 3,
      date: "2026-06-24",
    });
    expect(insights.mostTrainedExercise).toEqual({
      exercise: "Back squat",
      setCount: 3,
    });
    expect(insights.exerciseRows[0]).toMatchObject({
      exercise: "Back squat",
      setCount: 3,
      workoutCount: 2,
      bestKg: 110,
      bestKgDate: "2026-06-24",
      loadTypes: ["kg"],
    });
  });

  it("returns empty values when there are no strength workouts", () => {
    expect(buildStrengthInsights([{ activity: "run", date: "2026-06-25" }])).toEqual({
      workoutCount: 0,
      latestWorkoutDate: "",
      uniqueExerciseCount: 0,
      totalSets: 0,
      kgSetCount: 0,
      bodyweightSetCount: 0,
      bandSetCount: 0,
      topKgLift: null,
      mostTrainedExercise: null,
      exerciseRows: [],
    });
  });
});
