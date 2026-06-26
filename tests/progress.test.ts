import { describe, expect, it } from "vitest";

import { buildProgressHubModel } from "../src/domain/progress";

describe("buildProgressHubModel", () => {
  it("summarizes workouts, adherence, and goals", () => {
    const model = buildProgressHubModel(
      [
        { activity: "strength", date: "2026-06-20" },
        { activity: "run", date: "2026-06-22" },
        { activity: "sprint", date: "2026-06-21" },
        { activity: "run", date: "2026-06-24" },
      ],
      [
        { type: "strength", status: "completed" },
        { type: "run", status: "modified" },
        { type: "sprint", status: "planned" },
        { type: "run", status: "missed" },
      ],
      {
        strength: 100,
        active: { run: { type: "combined" } },
        history: [{ achievedAt: "2026-06-23" }, { achievedAt: "" }],
      },
    );

    expect(model).toEqual({
      totalWorkouts: 4,
      lastWorkoutDate: "2026-06-24",
      workoutCounts: { strength: 1, run: 2, sprint: 1 },
      plannedSessions: 4,
      completedSessions: 2,
      completionRate: 50,
      activeGoals: 2,
      achievedGoals: 1,
    });
  });

  it("returns safe empty values", () => {
    expect(buildProgressHubModel([], [], {})).toEqual({
      totalWorkouts: 0,
      lastWorkoutDate: "",
      workoutCounts: { strength: 0, run: 0, sprint: 0 },
      plannedSessions: 0,
      completedSessions: 0,
      completionRate: 0,
      activeGoals: 0,
      achievedGoals: 0,
    });
  });
});
