import { describe, expect, it } from "vitest";

import { buildSprintPerformance, listSprintDistances, listSprintProfileOptions } from "../src/domain/sprint-performance";

const workouts = [
  {
    id: "one",
    activity: "sprint",
    date: "2026-07-01",
    sprintProfile: "acceleration",
    sprintSurface: "natural-grass",
    sprintSlope: "flat",
    sprintSets: [{ time: 5.2, distance: 40 }, { time: 5.1, distance: 40 }, { time: 1.9, distance: 10 }],
  },
  {
    id: "two",
    activity: "sprint",
    date: "2026-07-08",
    sprintProfile: "acceleration",
    sprintSurface: "synthetic-track",
    sprintSlope: "flat",
    sprintSets: [{ time: 4.95, distance: 40 }],
  },
  {
    id: "three",
    activity: "sprint",
    date: "2026-07-15",
    sprintProfile: "hill-sprint",
    sprintSurface: "natural-grass",
    sprintSlope: "uphill",
    sprintSets: [{ time: 5.5, distance: 40 }],
  },
];

describe("sprint performance", () => {
  it("lists recorded profiles and their available distances", () => {
    expect(listSprintProfileOptions(workouts)).toEqual([
      { key: "acceleration", label: "Acceleration" },
      { key: "hill-sprint", label: "Hill sprint" },
    ]);
    expect(listSprintDistances(workouts, "acceleration")).toEqual([10, 40]);
  });

  it("compares only the chosen profile and exact distance", () => {
    const model = buildSprintPerformance(workouts, {
      profileKey: "acceleration",
      distance: 40,
      surface: "all",
      slope: "all",
    });

    expect(model.sessions).toEqual([
      { id: "one", date: "2026-07-01", bestTime: 5.1, repCount: 2, surface: "natural-grass", slope: "flat" },
      { id: "two", date: "2026-07-08", bestTime: 4.95, repCount: 1, surface: "synthetic-track", slope: "flat" },
    ]);
    expect(model.latest?.id).toBe("two");
    expect(model.previous?.id).toBe("one");
    expect(model.allTimeBest?.id).toBe("two");
    expect(model.contextIsMixed).toBe(true);
  });

  it("filters context without mixing hill and flat work", () => {
    const model = buildSprintPerformance(workouts, {
      profileKey: "hill-sprint",
      distance: 40,
      surface: "natural-grass",
      slope: "uphill",
    });

    expect(model.sessions.map((session) => session.id)).toEqual(["three"]);
    expect(model.contextIsMixed).toBe(false);
  });
});
