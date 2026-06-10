import { describe, expect, it } from "vitest";
import {
  calculateRunPace,
  formatSecondsAsRunDuration,
  normalizeStoredRunDuration,
  parseRunDuration,
} from "../src/domain/run";

describe("run calculations", () => {
  it("parses mm:ss and hh:mm:ss", () => {
    expect(parseRunDuration("45:30")).toEqual({ seconds: 2730, error: "" });
    expect(parseRunDuration("01:05:30")).toEqual({ seconds: 3930, error: "" });
    expect(formatSecondsAsRunDuration(3930)).toBe("01:05:30");
  });

  it("rejects ambiguous or invalid durations", () => {
    expect(parseRunDuration("65:30").error).toContain("hh:mm:ss");
    expect(parseRunDuration("10:60").error).toContain("Seconds");
    expect(parseRunDuration("abc").seconds).toBeNull();
  });

  it("retains compatibility with stored long mm:ss durations", () => {
    expect(normalizeStoredRunDuration("65:30")).toBe("01:05:30");
  });

  it("calculates pace in minutes per kilometer", () => {
    expect(calculateRunPace(5, 1500)).toBe(5);
    expect(calculateRunPace(0, 1500)).toBeNull();
  });
});
