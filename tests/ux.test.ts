import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const index = readFileSync("index.html", "utf8");
const script = readFileSync("script.js", "utf8");
const previewDomain = readFileSync("src/domain/program-preview.ts", "utf8");

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

  it("orders Programs around scheduled programs, templates, then create/import", () => {
    const scheduledIndex = index.indexOf('id="phase-instance-list"');
    const templatesIndex = index.indexOf('id="phase-template-list"');
    const importDetailsIndex = index.indexOf('id="phase-import-details"');
    const importFormIndex = index.indexOf('id="phase-import-form"');

    expect(index).toContain("<h2>Programs</h2>");
    expect(scheduledIndex).toBeGreaterThan(-1);
    expect(templatesIndex).toBeGreaterThan(-1);
    expect(importDetailsIndex).toBeGreaterThan(-1);
    expect(importFormIndex).toBeGreaterThan(-1);
    expect(scheduledIndex).toBeLessThan(templatesIndex);
    expect(templatesIndex).toBeLessThan(importDetailsIndex);
    expect(importDetailsIndex).toBeLessThan(importFormIndex);
    expect(index).toContain("<summary>Create or import program</summary>");
  });

  it("keeps a readable program preview in the import flow", () => {
    expect(index).toContain('id="phase-duration-weeks"');
    expect(index).toContain('id="load-program-example"');
    expect(index).toContain('id="copy-program-text"');
    expect(index).toContain('id="reset-program-builder"');
    expect(index).toContain('id="program-template-picker"');
    expect(index).toContain('id="load-program-template"');
    expect(index).toContain('id="program-builder-guide-heading"');
    expect(index).toContain('id="add-program-day"');
    expect(index).toContain('id="program-day-list"');
    expect(index).toContain("How to build a program");
    expect(index).toContain("Load the starter example or paste your own rows.");
    expect(index).toContain("Edit weekly training days, blocks, and exercises, or load the starter example. The import text stays synced for compatibility.");
    expect(index).toContain('id="phase-import-preview"');
    expect(index).toContain("Paste or import a program to preview its training days, blocks, and exercises.");
  });

  it("offers a duplicate action for saved program templates", () => {
    expect(script).toContain('data-role="duplicate-phase-template"');
    expect(script).toContain("Load copy");
    expect(script).toContain("Loaded a copy of");
  });

  it("opens the import builder before focusing the copied program name", () => {
    const openIndex = script.indexOf("phaseImportDetails.open = true;");
    const focusIndex = script.indexOf("phaseNameOverrideInput.focus({ preventScroll: true });");

    expect(openIndex).toBeGreaterThan(-1);
    expect(focusIndex).toBeGreaterThan(-1);
    expect(openIndex).toBeLessThan(focusIndex);
    expect(script).toContain("requestAnimationFrame(() => {");
    expect(script).toContain("setSelectionRange(end, end);");
  });

  it("offers a copy action for the current import text", () => {
    expect(script).toContain('copy-program-text');
    expect(script).toContain("Program import text copied to clipboard.");
  });

  it("offers a reset action for the builder", () => {
    expect(script).toContain('reset-program-builder');
    expect(script).toContain("Builder reset to a blank program.");
  });

  it("offers a saved-template picker in the builder", () => {
    expect(script).toContain('program-template-picker');
    expect(script).toContain('load-program-template');
    expect(script).toContain("Select a saved template to load.");
  });

  it("marks recently edited saved templates in the list", () => {
    expect(script).toContain('phase-badge-recent');
    expect(script).toContain("Recently edited");
  });

  it("marks copied saved templates separately from edited ones", () => {
    expect(script).toContain('phase-badge-copied');
    expect(script).toContain("Copied");
    expect(script).toContain("copiedFromTemplateId");
  });

  it("shows import hints when the builder text is incomplete", () => {
    expect(script).toContain('program-preview-hints');
    expect(script).toContain('Fix this import');
    expect(previewDomain).toContain('Add a `SLOT` row before any `BLOCK` rows.');
  });
});
