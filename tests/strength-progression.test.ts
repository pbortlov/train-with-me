import { describe, expect, it } from "vitest";

import {
  buildStrengthSessionProgress,
  createDefaultStrengthProgressionState,
  findStrengthProgressionProfile,
  normalizeStrengthProgressionState,
  parseWeightJumps,
  upsertStrengthProgressionProfile,
} from "../src/domain/strength-progression";

const profile = {
  exercise: "Back squat",
  goal: "strength" as const,
  targetSets: 3,
  repMin: 8,
  repMax: 10,
  workingWeight: 32.5,
  allowedJumps: [1.25, 2.5, 5],
};

describe("strength progression", () => {
  it("recognizes a promoted set without treating the unchanged best set as the verdict", () => {
    const progress = buildStrengthSessionProgress(
      [
        { order: 1, reps: 10, weight: 30, loadType: "kg", bandColor: "" },
        { order: 2, reps: 10, weight: 30, loadType: "kg", bandColor: "" },
        { order: 3, reps: 10, weight: 32.5, loadType: "kg", bandColor: "" },
      ],
      [
        { order: 1, reps: 10, weight: 30, loadType: "kg", bandColor: "" },
        { order: 2, reps: 10, weight: 32.5, loadType: "kg", bandColor: "" },
        { order: 3, reps: 10, weight: 32.5, loadType: "kg", bandColor: "" },
      ],
      profile,
      [1.25, 2.5, 5],
    );

    expect(progress).toMatchObject({
      promotedSetCount: 1,
      repGainCount: 0,
      completedTargetSetCount: 2,
      isReadyForNextWeight: false,
      suggestedWeight: null,
    });
  });

  it("reports rep gains and suggests the nearest permitted 2.5 percent jump only when ready", () => {
    const progress = buildStrengthSessionProgress(
      [
        { order: 1, reps: 8, weight: 32.5, loadType: "kg", bandColor: "" },
        { order: 2, reps: 9, weight: 32.5, loadType: "kg", bandColor: "" },
        { order: 3, reps: 9, weight: 32.5, loadType: "kg", bandColor: "" },
      ],
      [
        { order: 1, reps: 10, weight: 32.5, loadType: "kg", bandColor: "" },
        { order: 2, reps: 10, weight: 32.5, loadType: "kg", bandColor: "" },
        { order: 3, reps: 10, weight: 32.5, loadType: "kg", bandColor: "" },
      ],
      profile,
      [1.25, 2.5, 5],
    );

    expect(progress).toMatchObject({
      repGainCount: 3,
      completedTargetSetCount: 3,
      isReadyForNextWeight: true,
      suggestedIncrement: 1.25,
      suggestedWeight: 33.75,
    });
  });

  it("keeps gym jumps, profile overrides, and malformed legacy data safe", () => {
    const state = upsertStrengthProgressionProfile(
      { gymWeightJumps: [1, 2.5], profiles: [] },
      profile,
    );

    expect(findStrengthProgressionProfile(state, " back SQUAT ")).toMatchObject({
      workingWeight: 32.5,
      allowedJumps: [1.25, 2.5, 5],
    });
    expect(parseWeightJumps("5, 1.25, invalid, 2.5, 1.25")).toEqual([1.25, 2.5, 5]);
    expect(normalizeStrengthProgressionState({ gymWeightJumps: [2.5, "bad"], profiles: [{}] })).toEqual({
      gymWeightJumps: [2.5],
      profiles: [],
    });
    expect(normalizeStrengthProgressionState({ gymWeightJumps: [] }).gymWeightJumps).toEqual([1, 1.25, 2.5, 5]);
    expect(normalizeStrengthProgressionState(null)).toEqual(createDefaultStrengthProgressionState());
  });
});
