import { describe, expect, it } from "vitest";
import {
  normalizeSprintProfile,
  normalizeSprintSlope,
  normalizeSprintSurface,
  normalizeSprintText,
  normalizeSprintSets,
  normalizeStrengthExercises,
} from "../src/domain/normalization";

describe("workout normalization", () => {
  it("filters invalid sprint sets and restores order", () => {
    expect(normalizeSprintSets([
      { order: 8, time: 1.56, distance: 10 },
      { time: "bad", distance: 20 },
      { time: 2.21, distance: 20 },
    ])).toEqual([
      { order: 1, time: 1.56, distance: 10 },
      { order: 2, time: 2.21, distance: 20 },
    ]);
  });

  it("normalizes kg, bodyweight, and band strength sets", () => {
    expect(normalizeStrengthExercises([
      {
        name: " Back squat ",
        sets: [
          { reps: 5, weight: 100, loadType: "kg" },
          { reps: 8, weight: 20, loadType: "bodyweight" },
          { reps: 12, loadType: "band", bandColor: "purple" },
        ],
      },
    ])).toEqual([
      {
        name: "Back squat",
        sets: [
          { order: 1, reps: 5, weight: 100, loadType: "kg", bandColor: "" },
          { order: 2, reps: 8, weight: null, loadType: "bodyweight", bandColor: "" },
          { order: 3, reps: 12, weight: null, loadType: "band", bandColor: "purple" },
        ],
      },
    ]);
  });

  it("keeps only supported sprint context values while preserving optional text", () => {
    expect(normalizeSprintProfile("acceleration")).toBe("acceleration");
    expect(normalizeSprintProfile("unknown")).toBe("");
    expect(normalizeSprintSurface("synthetic-track")).toBe("synthetic-track");
    expect(normalizeSprintSurface("sand")).toBe("");
    expect(normalizeSprintSlope("uphill")).toBe("uphill");
    expect(normalizeSprintSlope("sideways")).toBe("");
    expect(normalizeSprintText("  Warm-up drills  ")).toBe("Warm-up drills");
  });
});
