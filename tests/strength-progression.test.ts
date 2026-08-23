import { describe, expect, it } from "vitest";

import {
  advanceStrengthTargetAfterWorkout,
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
    );

    expect(progress).toMatchObject({
      promotedSetCount: 1,
      repGainCount: 0,
    });
  });

  it("reports rep gains without changing a target while sets are being entered", () => {
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
    );

    expect(progress).toMatchObject({
      repGainCount: 3,
    });
  });

  it("advances to a heavier saved set at the target minimum reps", () => {
    const progression = advanceStrengthTargetAfterWorkout(
      { ...profile, key: "back squat", workingWeight: 85 },
      [
        { order: 1, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
        { order: 2, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
        { order: 3, reps: 8, weight: 90, loadType: "kg", bandColor: "" },
      ],
      [1.25, 2.5, 5],
    );

    expect(progression.qualifyingSet).toEqual({ reps: 8, weight: 90 });
    expect(progression.profile).toMatchObject({
      targetSets: 3,
      repMin: 8,
      repMax: 10,
      workingWeight: 90,
    });
  });

  it("advances when a heavier set is above the rep range", () => {
    const progression = advanceStrengthTargetAfterWorkout(
      { ...profile, key: "back squat", workingWeight: 85 },
      [{ order: 1, reps: 11, weight: 90, loadType: "kg", bandColor: "" }],
      [1.25, 2.5, 5],
    );

    expect(progression.qualifyingSet).toEqual({ reps: 11, weight: 90 });
    expect(progression.profile.workingWeight).toBe(90);
  });

  it("uses the highest qualifying heavier weight from one saved workout", () => {
    const progression = advanceStrengthTargetAfterWorkout(
      { ...profile, key: "back squat", workingWeight: 85 },
      [
        { order: 1, reps: 8, weight: 90, loadType: "kg", bandColor: "" },
        { order: 2, reps: 9, weight: 92.5, loadType: "kg", bandColor: "" },
        { order: 3, reps: 8, weight: 95, loadType: "kg", bandColor: "" },
      ],
      [1.25, 2.5, 5],
    );

    expect(progression.qualifyingSet).toEqual({ reps: 8, weight: 95 });
    expect(progression.profile.workingWeight).toBe(95);
  });

  it("does not advance for equal weight, below-minimum reps, or non-kg sets", () => {
    const savedProfile = { ...profile, key: "back squat", workingWeight: 85 };
    const progression = advanceStrengthTargetAfterWorkout(savedProfile, [
      { order: 1, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
      { order: 2, reps: 7, weight: 90, loadType: "kg", bandColor: "" },
      { order: 3, reps: 12, weight: null, loadType: "bodyweight", bandColor: "" },
    ], [1.25, 2.5, 5]);

    expect(progression.qualifyingSet).toBeNull();
    expect(progression.profile).toBe(savedProfile);
  });

  it("suggests the next permitted weight at the bottom of the rep range after all target sets reach the top", () => {
    const progression = advanceStrengthTargetAfterWorkout(
      { ...profile, key: "back squat", workingWeight: 85 },
      [
        { order: 1, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
        { order: 2, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
        { order: 3, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
      ],
      [1.25, 2.5, 5],
    );

    expect(progression.profile.workingWeight).toBe(85);
    expect(progression.qualifyingSet).toBeNull();
    expect(progression.nextTargetSuggestion).toEqual({
      targetSets: 3,
      reps: 8,
      weight: 87.5,
      increment: 2.5,
    });
  });

  it("does not suggest a next target before every target set reaches the top rep range", () => {
    const progression = advanceStrengthTargetAfterWorkout(
      { ...profile, key: "back squat", workingWeight: 85 },
      [
        { order: 1, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
        { order: 2, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
        { order: 3, reps: 9, weight: 85, loadType: "kg", bandColor: "" },
      ],
      [1.25, 2.5, 5],
    );

    expect(progression.nextTargetSuggestion).toBeNull();
  });

  it("lets a qualifying heavier set win over a calculated next target", () => {
    const progression = advanceStrengthTargetAfterWorkout(
      { ...profile, key: "back squat", workingWeight: 85 },
      [
        { order: 1, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
        { order: 2, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
        { order: 3, reps: 10, weight: 90, loadType: "kg", bandColor: "" },
      ],
      [1.25, 2.5, 5],
    );

    expect(progression.profile.workingWeight).toBe(90);
    expect(progression.qualifyingSet).toEqual({ reps: 10, weight: 90 });
    expect(progression.nextTargetSuggestion).toBeNull();
  });

  it("does not suggest a next target when no allowed jump is available", () => {
    const progression = advanceStrengthTargetAfterWorkout(
      { ...profile, key: "back squat", workingWeight: 85, allowedJumps: [] },
      [
        { order: 1, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
        { order: 2, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
        { order: 3, reps: 10, weight: 85, loadType: "kg", bandColor: "" },
      ],
      [],
    );

    expect(progression.nextTargetSuggestion).toBeNull();
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
