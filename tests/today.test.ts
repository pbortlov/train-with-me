import { describe, expect, it } from "vitest";

import { buildTodayModel } from "../src/domain/today";

describe("buildTodayModel", () => {
  it("returns today's planned sessions and unlinked workouts", () => {
    const model = buildTodayModel(
      "2026-06-11",
      [
        { id: "planned", date: "2026-06-11", status: "planned" },
        {
          id: "done",
          date: "2026-06-11",
          status: "modified",
          linkedWorkoutId: "linked-workout",
        },
        { id: "tomorrow", date: "2026-06-12", status: "planned" },
      ],
      [
        { id: "linked-workout", date: "2026-06-11" },
        { id: "standalone", date: "2026-06-11" },
        { id: "old", date: "2026-06-10" },
      ],
    );

    expect(model.sessions.map((session) => session.id)).toEqual([
      "planned",
      "done",
    ]);
    expect(model.standaloneWorkouts.map((workout) => workout.id)).toEqual([
      "standalone",
    ]);
    expect(model.plannedCount).toBe(1);
    expect(model.completedCount).toBe(1);
  });

  it("returns an empty exact-date model when no training exists", () => {
    expect(buildTodayModel("2026-06-11", [], [])).toEqual({
      date: "2026-06-11",
      sessions: [],
      standaloneWorkouts: [],
      completedCount: 0,
      plannedCount: 0,
    });
  });
});
