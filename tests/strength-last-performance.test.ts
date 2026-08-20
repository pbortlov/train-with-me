import { describe, expect, it } from "vitest";

import { findStrengthLastPerformance } from "../src/domain/strength-last-performance";

describe("findStrengthLastPerformance", () => {
  it("returns the latest matching exercise sequence and the all-time best kg set", () => {
    const performance = findStrengthLastPerformance(
      [
        {
          activity: "strength",
          date: "2026-08-03",
          strengthExercises: [
            {
              name: "Back squat",
              sets: [
                { reps: 10, weight: 30, loadType: "kg" },
                { reps: 10, weight: 30, loadType: "kg" },
                { reps: 10, weight: 32.5, loadType: "kg" },
              ],
            },
          ],
        },
        {
          activity: "strength",
          date: "2026-08-10",
          strengthExercises: [
            {
              name: " back SQUAT ",
              sets: [
                { reps: 10, weight: 30, loadType: "kg" },
                { reps: 10, weight: 32.5, loadType: "kg" },
                { reps: 10, weight: 32.5, loadType: "kg" },
              ],
            },
          ],
        },
      ],
      "Back squat",
    );

    expect(performance).toMatchObject({
      exercise: "back SQUAT",
      date: "2026-08-10",
      bestKgSet: { weight: 32.5, reps: 10, date: "2026-08-10" },
    });
    expect(performance?.sets).toMatchObject([
      { order: 1, reps: 10, weight: 30, loadType: "kg" },
      { order: 2, reps: 10, weight: 32.5, loadType: "kg" },
      { order: 3, reps: 10, weight: 32.5, loadType: "kg" },
    ]);
  });

  it("uses creation time for same-day workouts and does not mix in unrelated activities", () => {
    const performance = findStrengthLastPerformance(
      [
        {
          activity: "strength",
          date: "2026-08-10",
          createdAt: 100,
          strengthExercises: [{ name: "Row", sets: [{ reps: 8, weight: 40, loadType: "kg" }] }],
        },
        {
          activity: "run",
          date: "2026-08-11",
          strengthExercises: [{ name: "Row", sets: [{ reps: 20, weight: 90, loadType: "kg" }] }],
        },
        {
          activity: "strength",
          date: "2026-08-10",
          createdAt: 200,
          strengthExercises: [{ name: "Row", sets: [{ reps: 10, weight: 42.5, loadType: "kg" }] }],
        },
      ],
      "row",
    );

    expect(performance).toMatchObject({
      date: "2026-08-10",
      bestKgSet: { weight: 42.5, reps: 10, date: "2026-08-10" },
    });
    expect(performance?.sets).toHaveLength(1);
    expect(performance?.sets[0]).toMatchObject({ reps: 10, weight: 42.5 });
  });

  it("returns no performance for a new exercise and keeps non-kg work displayable", () => {
    expect(findStrengthLastPerformance([], "New exercise")).toBeNull();

    const performance = findStrengthLastPerformance(
      [
        {
          activity: "strength",
          date: "2026-08-10",
          strengthExercises: [{ name: "Pull-up", sets: [{ reps: 8, loadType: "bodyweight" }] }],
        },
      ],
      "Pull-up",
    );

    expect(performance?.sets[0]).toMatchObject({ reps: 8, loadType: "bodyweight" });
    expect(performance?.bestKgSet).toBeNull();
  });
});
