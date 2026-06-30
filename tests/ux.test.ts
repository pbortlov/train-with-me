import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const index = readFileSync("index.html", "utf8");

describe("local-first UX guidance", () => {
  it("keeps keyboard users a skip link to the app content", () => {
    expect(index).toContain('class="skip-link"');
    expect(index).toContain('href="#main-content"');
    expect(index).toContain('id="main-content"');
  });

  it("shows local-first onboarding and backup safety guidance", () => {
    expect(index).toContain("Train locally, protect your history");
    expect(index).toContain("Backup safety checklist");
    expect(index).toContain("Import replaces the local training data");
  });

  it("keeps colon-formatted run time and pace fields usable on mobile keyboards", () => {
    const colonEntryFieldIds = [
      "time",
      "planned-run-pace",
      "goal-run-combined-time",
      "completion-run-time",
      "planned-run-edit-pace",
      "edit-time",
    ];

    colonEntryFieldIds.forEach((id) => {
      const inputMatch = index.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`));
      expect(inputMatch?.[0], `${id} input should exist`).toBeTruthy();
      expect(inputMatch?.[0], `${id} should stay a text field`).toContain('type="text"');
      expect(inputMatch?.[0], `${id} must allow ":" entry on phones`).not.toContain('inputmode="numeric"');
    });
  });
});
