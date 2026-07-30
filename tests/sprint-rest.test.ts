import { describe, expect, it } from "vitest";

import { formatSprintRest, formatSprintRestForInput, parseSprintRest } from "../src/domain/sprint-rest";

describe("sprint rest", () => {
  it("accepts seconds and minute-second entry", () => {
    expect(parseSprintRest("90")).toEqual({ seconds: 90, error: "" });
    expect(parseSprintRest("1:30")).toEqual({ seconds: 90, error: "" });
    expect(parseSprintRest("02:05")).toEqual({ seconds: 125, error: "" });
  });

  it("rejects invalid minute-second values", () => {
    expect(parseSprintRest("1:60").error).toBe("Seconds must be 00-59 in m:ss.");
    expect(parseSprintRest("one minute").error).toContain("seconds or m:ss");
  });

  it("displays longer rests as minute-second values", () => {
    expect(formatSprintRestForInput(90)).toBe("1:30");
    expect(formatSprintRest(90)).toBe("1:30");
    expect(formatSprintRest(45)).toBe("45 s");
    expect(formatSprintRestForInput(90.5)).toBe("90.5");
  });
});
