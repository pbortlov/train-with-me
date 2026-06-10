import { describe, expect, it } from "vitest";
import { evaluatePlanStatus } from "../src/domain/metrics";

describe("strength metric semantics", () => {
  const planned = { setsBase: 3, repsBase: 5, weight: 100 };

  it("distinguishes matched, exceeded, and below-plan performance", () => {
    expect(evaluatePlanStatus(planned, { totalSets: 3, maxReps: 5, maxWeight: 100 }).label).toBe("Matched plan");
    expect(evaluatePlanStatus(planned, { totalSets: 4, maxReps: 5, maxWeight: 100 }).label).toBe("Exceeded plan");
    expect(evaluatePlanStatus(planned, { totalSets: 3, maxReps: 4, maxWeight: 100 }).label).toBe("Below plan");
  });

  it("treats an empty planned weight as a baseline load", () => {
    expect(evaluatePlanStatus(
      { setsBase: 2, repsBase: 8, weight: null },
      { totalSets: 2, maxReps: 8, maxWeight: null },
    ).label).toBe("Matched plan");
  });
});
