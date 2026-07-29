import { describe, expect, it } from "vitest";

import {
  buildSprintPerformance,
  buildSprintRepConsistency,
  buildSprintRecordGroups,
  listSprintDistances,
  listSprintProfileOptions,
} from "../src/domain/sprint-performance";

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

  it("keeps selected-distance reps in order for within-session consistency", () => {
    const sessions = buildSprintRepConsistency(workouts, {
      profileKey: "acceleration",
      distance: 40,
      surface: "natural-grass",
      slope: "flat",
    });

    expect(sessions).toEqual([
      {
        id: "one",
        date: "2026-07-01",
        bestTime: 5.1,
        repCount: 2,
        surface: "natural-grass",
        slope: "flat",
        reps: [{ order: 1, time: 5.2 }, { order: 2, time: 5.1 }],
        firstTime: 5.2,
        lastTime: 5.1,
        firstToLastChange: -0.1,
      },
    ]);
  });

  it("explores all profiles and distances as separate records", () => {
    const records = buildSprintRecordGroups(workouts, {
      profileKey: "all",
      distance: 0,
      surface: "all",
      slope: "all",
    });

    expect(records).toEqual([
      { profileKey: "acceleration", profileLabel: "Acceleration", distance: 10, bestTime: 1.9, date: "2026-07-01", surface: "natural-grass", slope: "flat" },
      { profileKey: "acceleration", profileLabel: "Acceleration", distance: 40, bestTime: 4.95, date: "2026-07-08", surface: "synthetic-track", slope: "flat" },
      { profileKey: "hill-sprint", profileLabel: "Hill sprint", distance: 40, bestTime: 5.5, date: "2026-07-15", surface: "natural-grass", slope: "uphill" },
    ]);
    expect(listSprintDistances(workouts, "all")).toEqual([10, 40]);
  });
});
