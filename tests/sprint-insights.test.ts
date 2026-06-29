import { describe, expect, it } from "vitest";

import { buildSprintInsights } from "../src/domain/sprint-insights";

describe("buildSprintInsights", () => {
  it("summarizes sprint reps, distances, bests, and feelings", () => {
    const insights = buildSprintInsights([
      {
        activity: "sprint",
        date: "2026-06-20",
        sprintFeeling: "sharp",
        sprintSets: [
          { time: 1.6, distance: 10 },
          { time: 2.3, distance: 20 },
        ],
      },
      {
        activity: "sprint",
        date: "2026-06-24",
        sprintFeeling: "solid",
        sprintSets: [
          { time: 1.55, distance: 10 },
          { time: 14.2, distance: 100 },
        ],
      },
      { activity: "run", date: "2026-06-25" },
    ]);

    expect(insights.workoutCount).toBe(2);
    expect(insights.latestSprintDate).toBe("2026-06-24");
    expect(insights.totalReps).toBe(4);
    expect(insights.uniqueDistanceCount).toBe(3);
    expect(insights.fastestRep).toEqual({ distance: 10, time: 1.55, date: "2026-06-24" });
    expect(insights.bestByDistance).toEqual([
      { distance: 10, time: 1.55, date: "2026-06-24" },
      { distance: 20, time: 2.3, date: "2026-06-20" },
      { distance: 100, time: 14.2, date: "2026-06-24" },
    ]);
    expect(insights.feelingCounts).toEqual([
      { feeling: "sharp", count: 1 },
      { feeling: "solid", count: 1 },
    ]);
  });

  it("ignores invalid sprint reps but still counts sprint workouts", () => {
    const insights = buildSprintInsights([
      {
        activity: "sprint",
        date: "2026-06-20",
        sprintSets: [
          { time: 0, distance: 10 },
          { time: 2.3, distance: 0 },
        ],
      },
    ]);

    expect(insights.workoutCount).toBe(1);
    expect(insights.totalReps).toBe(0);
    expect(insights.fastestRep).toBeNull();
    expect(insights.rows[0]).toEqual({
      date: "2026-06-20",
      repCount: 0,
      distances: [],
      bestTime: null,
      feeling: "",
    });
  });

  it("returns empty values without sprints", () => {
    expect(buildSprintInsights([])).toEqual({
      workoutCount: 0,
      latestSprintDate: "",
      totalReps: 0,
      uniqueDistanceCount: 0,
      fastestRep: null,
      bestByDistance: [],
      feelingCounts: [],
      rows: [],
    });
  });
});
