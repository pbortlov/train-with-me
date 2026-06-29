import { describe, expect, it } from "vitest";

import { buildRunningInsights } from "../src/domain/running-insights";

describe("buildRunningInsights", () => {
  it("summarizes valid run distance and pace without non-run workouts", () => {
    const insights = buildRunningInsights([
      { activity: "run", date: "2026-06-20", distance: 5, time: "25:00" },
      { activity: "run", date: "2026-06-22", distance: 10, time: "55:00" },
      { activity: "run", date: "2026-06-24", distance: 3, time: "12:00" },
      { activity: "strength", date: "2026-06-25", distance: 20 },
    ]);

    expect(insights.runCount).toBe(3);
    expect(insights.latestRunDate).toBe("2026-06-24");
    expect(insights.totalDistance).toBe(18);
    expect(insights.longestRun).toEqual({ distance: 10, date: "2026-06-22" });
    expect(insights.bestPace).toEqual({
      pace: 4,
      date: "2026-06-24",
      distance: 3,
    });
    expect(insights.averagePace).toBeCloseTo(92 / 18);
    expect(insights.totalDurationSeconds).toBe(5520);
  });

  it("uses stored pace when duration is unavailable", () => {
    const insights = buildRunningInsights([
      { activity: "run", date: "2026-06-20", distance: 5, pace: 4.5 },
    ]);

    expect(insights.bestPace).toEqual({
      pace: 4.5,
      date: "2026-06-20",
      distance: 5,
    });
    expect(insights.averagePace).toBeNull();
  });

  it("returns empty values without runs", () => {
    expect(buildRunningInsights([])).toEqual({
      runCount: 0,
      latestRunDate: "",
      totalDistance: 0,
      longestRun: null,
      bestPace: null,
      averagePace: null,
      totalDurationSeconds: 0,
      rows: [],
    });
  });
});
