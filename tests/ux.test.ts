import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const index = readFileSync("index.html", "utf8");
const script = readFileSync("script.js", "utf8");
const styles = readFileSync("styles.css", "utf8");
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
    expect(index).toContain('id="phase-template-filter"');
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
    const focusIndex = script.indexOf("focusPhaseNameOverrideInput();");

    expect(openIndex).toBeGreaterThan(-1);
    expect(focusIndex).toBeGreaterThan(-1);
    expect(openIndex).toBeLessThan(focusIndex);
    expect(script).toContain("function focusPhaseNameOverrideInput()");
    expect(script).toContain("requestAnimationFrame(() => {");
    expect(script).toContain("setSelectionRange(end, end);");
  });

  it("focuses the program name field when editing an existing template too", () => {
    const editIndex = script.indexOf('phaseImportStatusEl.textContent = `Editing "');
    const focusIndex = script.indexOf("focusPhaseNameOverrideInput();");

    expect(editIndex).toBeGreaterThan(-1);
    expect(focusIndex).toBeGreaterThan(-1);
    expect(editIndex).toBeLessThan(focusIndex);
  });

  it("offers a copy action for the current import text", () => {
    expect(script).toContain('copy-program-text');
    expect(script).toContain("Program import text copied to clipboard.");
  });

  it("marks the program import form as edit mode only while editing an existing template", () => {
    expect(script).toContain('phaseImportDetails.dataset.programImportMode = "edit"');
    expect(script).toContain('delete phaseImportDetails.dataset.programImportMode');
    expect(styles).toContain('.phase-import-details[data-program-import-mode="edit"]');
    expect(styles).toContain('linear-gradient(180deg, rgb(255 216 77 / 7%)');
    expect(styles).toContain('.phase-import-details[data-program-import-mode="edit"] .dialog-actions #save-phase-button');
    expect(styles).toContain('.phase-import-details[data-program-import-mode="edit"] .dialog-actions #cancel-phase-edit');
  });

  it("offers a reset action for the builder", () => {
    expect(script).toContain('reset-program-builder');
    expect(script).toContain("Builder reset to a blank program.");
  });

  it("visually separates program days blocks and exercises", () => {
    expect(styles).toContain(".program-day-row");
    expect(styles).toContain("linear-gradient(180deg, rgb(0 229 255 / 12%)");
    expect(styles).toContain(".program-block-editor");
    expect(styles).toContain("linear-gradient(180deg, rgb(155 92 255 / 10%)");
    expect(styles).toContain(".program-exercise-editor");
    expect(styles).toContain("linear-gradient(180deg, rgb(52 211 153 / 10%)");
    expect(styles).toContain(".program-exercise-row");
  });

  it("gives the empty program states distinct visual callouts", () => {
    expect(script).toContain('program-empty-state program-empty-days');
    expect(script).toContain('program-empty-state program-empty-blocks');
    expect(script).toContain('program-empty-state program-empty-exercises');
    expect(script).toContain('program-preview-empty program-preview-empty-blocks');
    expect(script).toContain('program-preview-empty program-preview-empty-exercises');
    expect(styles).toContain('.view-panel[data-view="phases"] .program-empty-state');
    expect(styles).toContain('border: 1px dashed #76e4ff55');
    expect(styles).toContain('.view-panel[data-view="phases"] .program-empty-blocks');
    expect(styles).toContain('rgb(155 92 255 / 10%)');
    expect(styles).toContain('.view-panel[data-view="phases"] .program-empty-exercises');
    expect(styles).toContain('rgb(52 211 153 / 10%)');
  });

  it("gives the add buttons stronger palette-based emphasis", () => {
    expect(index).toContain('class="ghost-button program-add-day-button"');
    expect(script).toContain('class="ghost-button program-add-block-button"');
    expect(script).toContain('class="ghost-button program-add-exercise-button"');
    expect(styles).toContain(".program-add-day-button");
    expect(styles).toContain("linear-gradient(180deg, #00f0ff, #00b6d4)");
    expect(styles).toContain("inset 0 1px 0 rgb(255 255 255 / 18%)");
    expect(styles).toContain(".program-add-block-button");
    expect(styles).toContain("linear-gradient(180deg, #6dff5c, #2fca65)");
    expect(styles).toContain("inset 0 1px 0 rgb(255 255 255 / 16%)");
    expect(styles).toContain(".program-add-exercise-button");
    expect(styles).toContain("linear-gradient(180deg, #ffd84d, #d6a800)");
    expect(styles).toContain("inset 0 1px 0 rgb(255 255 255 / 14%)");
  });

  it("applies the same hover lift to program section buttons", () => {
    expect(styles).toContain('.view-panel[data-view="phases"] button');
    expect(styles).toContain('inset 0 1px 0 rgb(255 255 255 / 9%)');
    expect(styles).toContain('transform 120ms ease');
    expect(styles).toContain('filter 120ms ease');
    expect(styles).toContain('.view-panel[data-view="phases"] button:hover');
    expect(styles).toContain('translateY(-1px)');
    expect(styles).toContain('brightness(1.06) saturate(1.04)');
  });

  it("adds depth to the non-add program buttons without changing the add buttons", () => {
    expect(styles).toContain('.view-panel[data-view="phases"] .ghost-button:not(.program-add-day-button):not(.program-add-block-button):not(.program-add-exercise-button)');
    expect(styles).toContain('linear-gradient(180deg, #1c4268, #10253d)');
    expect(styles).toContain('#effdff');
    expect(styles).toContain('.view-panel[data-view="phases"] button:not(.program-add-day-button):not(.program-add-block-button):not(.program-add-exercise-button)');
    expect(styles).toContain('inset 0 1px 0 rgb(255 255 255 / 16%)');
    expect(styles).toContain('0 0.8rem 1.35rem rgb(0 145 255 / 18%)');
    expect(styles).toContain('.view-panel[data-view="phases"] .danger-button');
    expect(styles).toContain('linear-gradient(180deg, #ff708a, #db4966)');
    expect(styles).toContain('.view-panel[data-view="phases"] button:not(.program-add-day-button):not(.program-add-block-button):not(.program-add-exercise-button):hover');
    expect(styles).toContain('inset 0 1px 0 rgb(255 255 255 / 20%)');
    expect(styles).toContain('0 0.95rem 1.55rem rgb(0 145 255 / 24%)');
  });

  it("keeps the program schedule button on the shared ghost-button base", () => {
    expect(script).toContain('data-role="schedule-phase"');
    expect(script).toContain('class="ghost-button" data-role="schedule-phase"');
  });

  it("makes the program preview cards use the same day block exercise hierarchy cues", () => {
    expect(styles).toContain('.program-preview-heading');
    expect(styles).toContain('linear-gradient(180deg, rgb(0 229 255 / 12%)');
    expect(styles).toContain('.program-preview-block');
    expect(styles).toContain('border-left: 3px solid var(--band-purple)');
    expect(styles).toContain('.phase-training-card');
    expect(styles).toContain('linear-gradient(180deg, rgb(0 229 255 / 7%)');
  });

  it("groups the program template loader into one readable control strip", () => {
    expect(styles).toContain('.program-template-loader');
    expect(styles).toContain('border: 1px solid #00e5ff44');
    expect(styles).toContain('linear-gradient(180deg, rgb(0 229 255 / 8%)');
    expect(styles).toContain('.program-template-loader label');
    expect(styles).toContain('color: var(--accent)');
    expect(styles).toContain('font-weight: 700');
    expect(styles).toContain('.program-template-loader button');
    expect(styles).toContain('min-width: 8.5rem');
  });

  it("offers a saved-template picker in the builder", () => {
    expect(script).toContain('program-template-picker');
    expect(script).toContain('load-program-template');
    expect(script).toContain("Select a saved template to load.");
  });

  it("filters saved templates from the list and builder picker", () => {
    expect(script).toContain('phase-template-filter');
    expect(script).toContain('No saved templates match this filter.');
    expect(script).toContain('No matching templates');
    expect(script).toContain('filterPhaseTemplatesForDisplay');
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
