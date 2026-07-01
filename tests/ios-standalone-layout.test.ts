import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const index = readFileSync("index.html", "utf8");
const styles = readFileSync("styles.css", "utf8");

describe("iOS standalone layout", () => {
  it("opts into safe-area viewport handling for installed iOS web apps", () => {
    expect(index).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />',
    );
  });

  it("keeps app content and fixed mobile navigation clear of iOS safe areas", () => {
    expect(styles).toContain(
      "padding: env(safe-area-inset-top) env(safe-area-inset-right) 0 env(safe-area-inset-left);",
    );
    expect(styles).toContain("right: env(safe-area-inset-right);");
    expect(styles).toContain("left: env(safe-area-inset-left);");
    expect(styles).toContain("max(0.45rem, env(safe-area-inset-bottom))");
    expect(styles).toContain("calc(4.9rem + env(safe-area-inset-bottom))");
  });
});
