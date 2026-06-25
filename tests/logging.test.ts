import { describe, expect, it } from "vitest";

import { normalizeLogActivity, resolveDateShortcut } from "../src/domain/logging";

describe("logging shortcuts", () => {
  it("normalizes supported activity shortcuts", () => {
    expect(normalizeLogActivity("strength")).toBe("strength");
    expect(normalizeLogActivity("run")).toBe("run");
    expect(normalizeLogActivity("sprint")).toBe("sprint");
  });

  it("falls back for unsupported activity shortcuts", () => {
    expect(normalizeLogActivity("bike")).toBe("strength");
    expect(normalizeLogActivity(null, "run")).toBe("run");
  });

  it("resolves quick date shortcuts from an ISO local date", () => {
    expect(resolveDateShortcut("today", "2026-06-25")).toBe("2026-06-25");
    expect(resolveDateShortcut("yesterday", "2026-06-25")).toBe("2026-06-24");
  });

  it("handles yesterday across month boundaries", () => {
    expect(resolveDateShortcut("yesterday", "2026-03-01")).toBe("2026-02-28");
  });
});
