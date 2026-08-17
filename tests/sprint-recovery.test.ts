import { describe, expect, it } from "vitest";

import { buildSprintRecoveryInsight } from "../src/domain/sprint-recovery";

const selection = {
  profileKey: "acceleration",
  distance: 40,
  surface: "synthetic-track",
  slope: "flat",
};

function workout(id: string, date: string, reps: Array<[number, number]>): Record<string, unknown> {
  return {
    id,
    activity: "sprint",
    date,
    sprintProfile: "acceleration",
    sprintSurface: "synthetic-track",
    sprintSlope: "flat",
    sprintSets: reps.map(([time, restBeforeSec]) => ({ time, distance: 40, restBeforeSec })),
  };
}

describe("sprint recovery insight", () => {
  it("requires an exact context before comparing actual rest", () => {
    const insight = buildSprintRecoveryInsight([], { ...selection, surface: "all" });

    expect(insight.status).toBe("choose-context");
  });

  it("waits for enough pairs across sessions", () => {
    const insight = buildSprintRecoveryInsight([
      workout("one", "2026-07-01", [[5.2, 120], [5.15, 180]]),
      workout("two", "2026-07-08", [[5.12, 120], [5.08, 180]]),
    ], selection);

    expect(insight.status).toBe("collecting");
    expect(insight.pairCount).toBe(4);
    expect(insight.sessionCount).toBe(2);
  });

  it("finds a material faster median for a supported rest band", () => {
    const insight = buildSprintRecoveryInsight([
      workout("one", "2026-07-01", [[5.28, 120], [5.12, 180], [5.24, 120]]),
      workout("two", "2026-07-08", [[5.25, 120], [5.08, 180], [5.1, 180]]),
      workout("three", "2026-07-15", [[5.22, 120], [5.06, 180], [5.26, 120]]),
    ], selection);

    expect(insight.status).toBe("ready");
    expect(insight.bestBand).toMatchObject({ restSeconds: 180, medianTime: 5.09, pairCount: 4, sessionCount: 3 });
    expect(insight.comparisonBand).toMatchObject({ restSeconds: 120, medianTime: 5.25, pairCount: 5, sessionCount: 3 });
    expect(insight.medianDifference).toBe(0.16);
  });

  it("does not overstate a tiny difference between supported rest bands", () => {
    const insight = buildSprintRecoveryInsight([
      workout("one", "2026-07-01", [[5.12, 120], [5.1, 180], [5.11, 120]]),
      workout("two", "2026-07-08", [[5.1, 120], [5.08, 180], [5.1, 180]]),
      workout("three", "2026-07-15", [[5.09, 120], [5.08, 180], [5.11, 120]]),
    ], selection);

    expect(insight.status).toBe("no-clear-signal");
    expect(insight.medianDifference).toBeLessThan(0.05);
  });
});
