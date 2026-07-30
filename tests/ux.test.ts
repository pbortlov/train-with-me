import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const index = readFileSync("index.html", "utf8");
const script = readFileSync("script.js", "utf8");
const styles = readFileSync("styles.css", "utf8");
const previewDomain = readFileSync("src/domain/program-preview.ts", "utf8");

describe("local-first UX guidance", () => {
  it("extracts shared design tokens from the Programs palette", () => {
    expect(styles).toContain("--surface-program-panel-bg");
    expect(styles).toContain("--button-program-secondary-bg");
    expect(styles).toContain("--button-program-build-day-bg");
    expect(styles).toContain("--button-program-danger-bg");
    expect(styles).toContain(".button-primary");
    expect(styles).toContain(".button-secondary");
    expect(styles).toContain(".button-danger");
  });

  it("keeps keyboard users a skip link to the app content", () => {
    expect(index).toContain('class="skip-link"');
    expect(index).toContain('href="#main-content"');
    expect(index).toContain('id="main-content"');
  });

  it("keeps exact sprint reps as a compact optional detail list", () => {
    expect(script).toContain('class="sprint-consistency-rep-details"');
    expect(script).toContain("Rep times (${session.repCount})");
    expect(script).toContain('class="sprint-consistency-rep-list"');
    expect(script).toContain("formatSprintSeconds(rep.time)");
    expect(styles).toContain("width: min(100%, 11rem)");
    expect(styles).toContain("font-variant-numeric: tabular-nums");
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

  it("keeps actual sprint-rest entry on a text keyboard so athletes can type m:ss", () => {
    const restInputMatch = index.match(/<input[^>]*id="sprint-rest-before-sec"[^>]*>/);
    expect(restInputMatch?.[0]).toContain('type="text"');
    expect(restInputMatch?.[0]).not.toContain('inputmode="numeric"');
    expect(restInputMatch?.[0]).not.toContain("disabled");
    expect(script).toContain('type="text" data-role="completion-sprint-rest-before"');
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
    expect(index).toContain("PROGRAM,Phase 1,5");
    expect(index).toContain("TRAINING,Tuesday,Strength A,Main lower-body day");
  });

  it("orders the main navigation around athlete usage", () => {
    const todayIndex = index.indexOf('data-view-target="today"');
    const calendarIndex = index.indexOf('data-view-target="calendar"');
    const statsIndex = index.indexOf('data-view-target="stats"');
    const phasesIndex = index.indexOf('data-view-target="phases"');
    const dataIndex = index.indexOf('data-view-target="data"');

    expect(todayIndex).toBeGreaterThan(-1);
    expect(calendarIndex).toBeGreaterThan(todayIndex);
    expect(statsIndex).toBeGreaterThan(calendarIndex);
    expect(phasesIndex).toBeGreaterThan(statsIndex);
    expect(dataIndex).toBeGreaterThan(phasesIndex);
    expect(index).not.toContain('data-view-target="review"');
  });

  it("turns Today into a launchpad with a direct stats jump", () => {
    expect(index).toContain('class="card today-launchpad"');
    expect(index).toContain('data-today-action="open-stats"');
    expect(index).toContain('class="hint today-launchpad-note"');
    expect(index).toContain('Start here, jump to the week, and check progress after you log.');
    expect(index).toContain('class="button-primary today-calendar-button today-launchpad-week-button"');
    expect(index).toContain('class="button-secondary today-launchpad-stats-button"');
    expect(index).toContain('class="today-quick-log-button today-quick-log-strength"');
    expect(index).toContain('class="today-quick-log-button today-quick-log-run"');
    expect(index).toContain('class="today-quick-log-button today-quick-log-sprint"');
    expect(styles).toContain('.today-launchpad-actions .button-primary');
    expect(styles).toContain('.today-launchpad-actions .button-secondary');
    expect(styles).toContain('.today-launchpad-week-button');
    expect(styles).toContain('.today-launchpad-stats-button');
    expect(styles).toContain('.today-quick-log-button');
    expect(styles).toContain('.today-quick-log-strength');
    expect(styles).toContain('.today-quick-log-run');
    expect(styles).toContain('.today-quick-log-sprint');
    expect(script).toContain('status-${session.status} activity-${session.type}');
    expect(script).toContain('today-complete-button');
    expect(script).toContain('today-details-button');
    expect(styles).toContain('.today-session-card.status-planned');
    expect(styles).toContain('.today-session-card.status-completed');
    expect(styles).toContain('.today-session-card.status-modified');
    expect(styles).toContain('.today-session-card.status-missed');
    expect(styles).toContain('.today-session-actions');
    expect(styles).toContain('.today-details-button');
    expect(styles).toContain('.today-complete-button');
    expect(styles).toContain('.today-details-button {\n  width: 100%;');
  });

  it("makes Calendar the weekly working surface with a momentum strip", () => {
    expect(index).toContain('class="card calendar-launchpad"');
    expect(index).toContain('id="calendar-momentum"');
    expect(index).toContain('See the whole week, choose the day, and keep the plan close to the action.');
    expect(index).toContain('<details class="add-training-plan-details" id="planned-session-drawer">');
    expect(index).toContain('<summary>Plan session</summary>');
    expect(index).toContain("Moves this training day and future matching program days by the same day offset.");
    expect(index).toContain('id="strength-session-move-preview"');
    expect(styles).toContain('.calendar-launchpad');
    expect(styles).toContain('.calendar-momentum-card');
    expect(styles).toContain('.calendar-nav #current-week');
    expect(styles).toContain('.calendar-nav button {\n    flex: 1 1 0;');
    expect(styles).toContain('.add-training-plan-details summary');
    expect(styles).toContain('min-height: 9.5rem;');
    expect(script).toContain('session-detail-close-button');
    expect(script).toContain('session-action-primary');
    expect(script).toContain('session-action-danger');
    expect(script).toContain('eventTarget.closest("[data-role]")');
    expect(script).toContain('function renderCalendar(options = {})');
    expect(script).toContain('const { preserveSelectedSession = false } = options;');
    expect(script).toContain('renderCalendar({ preserveSelectedSession: true });');
    expect(script).toContain('slotDayShifts');
    expect(script).toContain('getProgramWeekIndexForDate');
    expect(script).toContain('function programOccurrenceIdentityForSession(session)');
    expect(script).toContain('label: trainingNumber ? `W${weekNumber} · T${trainingNumber}` : `W${weekNumber}`');
    expect(script).toContain('dayLabel: `W${weekNumber}`');
    expect(script).toContain('programWeekColorClass(weekIndex)');
    expect(script).toContain('function renderStrengthSessionMovePreview(session, newDate)');
    expect(script).toContain('function getStrengthSessionMoveAffectedSessions(session)');
    expect(script).toContain('addSafeEventListener(strengthSessionNewDateInput, "input", updateStrengthSessionMovePreview)');
    expect(script).toContain('This will shift ${affectedSessions.length} planned');
    expect(script).toContain('moveContext.instance.slotDayShifts = normalizePhaseSlotDayShifts');
    expect(script).toContain('blockIndex,');
    expect(script).toContain('const blockAttribute = blockIndex === null ? "" : ` data-block-index="${blockIndex}"`;');
    expect(script).toContain('role === "completion-set-band-color" && Number.isInteger(blockIndex)');
    expect(script).toContain('function isGeneratedSessionOverdue(session)');
    expect(script).toContain('session-attention-badge');
    expect(script).toContain('Needs attention');
    expect(script).toContain('program-week-mixed');
    expect(script).toContain('program-session-identity');
    expect(script).toContain('From phase template • ${programIdentity.detailLabel}');
    expect(styles).toContain('.planned-session-card.is-selected {\n  box-shadow:');
    expect(styles).toContain('.program-session-identity');
    expect(styles).toContain('.strength-session-move-preview');
    expect(styles).toContain('.move-preview-card');
    expect(styles).toContain('.planned-session-card.is-overdue-generated-session');
    expect(styles).toContain('.session-attention-badge');
    expect(styles).toContain('.calendar-day.has-program-week.program-week-mixed');
    expect(styles).toContain('.program-week-badge.program-week-mixed');
    expect(script).toContain('if (selectedCalendarSessionId && !availableSessionIds.has(selectedCalendarSessionId) && !preserveSelectedSession)');
    expect(styles).toContain('.session-detail-close-button');
    expect(styles).toContain('.session-action-primary');
    expect(styles).toContain('.session-action-danger');
  });

  it("keeps Stats reward-first with a momentum highlight", () => {
    expect(index).toContain('id="progress-hub-highlight"');
    expect(index).toContain('<h2 id="progress-hub-heading">Progress Proof</h2>');
    expect(index).toContain('<h3>Week Done</h3>');
    expect(index).toContain('data-progress-jump="review"');
    expect(index).toContain('data-progress-jump="program"');
    expect(index).toContain('class="ghost-button progress-jump-primary" data-progress-jump="adherence"');
    expect(index).toContain('class="ghost-button progress-jump-secondary" data-progress-jump="review"');
    expect(index).toContain('id="program-progress-section"');
    expect(index).toContain('<details class="card review-disclosure stats-secondary-section" id="review-disclosure">');
    expect(index).toContain('<summary>Plan vs actual</summary>');
    expect(index).toContain('id="review-summary"');
    expect(index).toContain('id="review-session-list"');
    expect(index).toContain('class="card stats-detail-section stats-program-section"');
    expect(index).toContain('<details class="review-disclosure lifecycle-guide-disclosure" id="program-lifecycle-guide">');
    expect(index).toContain('<details class="stats-insight-details">');
    expect(index).toContain('<summary>Strength details</summary>');
    expect(index).toContain('<summary>Running details</summary>');
    expect(index).toContain('<summary>Sprint details</summary>');
    expect(index).toContain('<h3>Entry Evidence</h3>');
    expect(index).toContain('<summary>Chart filters</summary>');
    expect(index).toContain('<h4>Running pace by entry</h4>');
    expect(index).toContain('<h4>Sprint times by rep</h4>');
    expect(index).toContain('<h4>Strength highest kg by exercise</h4>');
    expect(script).toContain('effectivePhaseWeekIndex');
    expect(script).toContain('visibleDurationWeeks');
    expect(script).toContain('buildProgressHubImprovement(workouts)');
    expect(script).toContain('Run pace improved');
    expect(script).toContain('Sprint time improved');
    expect(script).toContain('Previous to latest: ${formatRunPace(runs[1].pace)} to ${formatRunPace(runs[0].pace)} min/km');
    expect(script).toContain('Previous to latest: ${formatNumber(sprints[1].bestTime)}s to ${formatNumber(sprints[0].bestTime)}s');
    expect(script).toContain('function buildStrengthExerciseSnapshotMap(workout)');
    expect(script).toContain('function formatProgressHubStrengthSnapshot(snapshot)');
    expect(script).toContain('${improvement.current.name} improved');
    expect(script).toContain('program: document.getElementById("program-progress-section")');
    expect(script).toContain('detailByTarget[target]');
    expect(script).toContain('Done this week');
    expect(script).toContain('Progress proof');
    expect(script).toContain('Log one run, sprint, or strength workout to build entry evidence.');
    expect(script).toContain('No entries match these filters.');
    expect(script).toContain('<th>Previous logged session</th>');
    expect(script).toContain('<th>Latest logged session</th>');
    expect(script).toContain('function getLatestProgramExposure(row)');
    expect(script).toContain('function getPreviousProgramExposure(row)');
    expect(script).toContain('Compared with previous logged session');
    expect(script).toContain('compare each exercise against its previous logged session');
    expect(script).toContain('groupProgramExerciseRows');
    expect(styles).toContain('.program-progress-group-row th');
    expect(styles).toContain('.program-progress-table td .phase-meta');
    expect(styles).toContain('.progress-hub-highlight-card');
    expect(styles).toContain('.progress-hub-highlight-card-muted');
    expect(styles).toContain('.progress-hub-actions .ghost-button');
    expect(styles).toContain('.progress-hub-actions .progress-jump-primary');
    expect(styles).toContain('.progress-hub-actions .progress-jump-secondary');
    expect(styles).toContain('.view-panel[data-view="stats"] > .card h3');
    expect(styles).toContain('.stats-detail-section');
    expect(styles).toContain('.stats-program-section');
    expect(styles).toContain('.strength-insights-card');
    expect(styles).toContain('.running-insights-card');
    expect(styles).toContain('.sprint-insights-card');
    expect(styles).toContain('.stats-insight-details summary');
    expect(styles).toContain('.stats-insight-details[open] summary');
    expect(styles).toContain('.stats-chart-filters summary');
    expect(styles).toContain('.stats-chart-filters[open] summary');
    expect(styles).toContain('.review-disclosure summary');
    expect(styles).toContain('.review-disclosure[open] summary');
    expect(styles).toContain('.lifecycle-guide-disclosure > .hint');
  });

  it("keeps Data and dialogs in a quieter utility style", () => {
    expect(index).toContain('class="card data-utility-card"');
    expect(index).toContain('class="card data-backup-card"');
    expect(index).toContain('<details class="card data-library-card data-collapsible-card">');
    expect(index).toContain('<details class="card data-history-card data-collapsible-card">');
    expect(index).toContain('id="export-data" class="data-backup-control data-backup-export"');
    expect(index).toContain('class="data-backup-control data-backup-import data-import-button"');
    expect(styles).toContain('.view-panel[data-view="data"] > .card');
    expect(styles).toContain('.data-collapsible-card summary');
    expect(styles).toContain('background: var(--surface-program-panel-bg);');
    expect(styles).toContain('background: var(--surface-program-lead-bg);');
    expect(styles).toContain('.data-backup-export');
    expect(styles).toContain('.data-backup-import');
    expect(styles).toContain('background: var(--button-program-build-day-bg);');
    expect(styles).toContain('background: var(--button-program-secondary-bg);');
    expect(styles).toContain('.view-panel[data-view="data"] .danger-button');
    expect(styles).toContain('dialog::backdrop');
    expect(styles).toContain('background:\n    linear-gradient(180deg, rgb(10 19 38 / 98%), rgb(6 8 15 / 98%)');
  });

  it("styles the program import lead-in as a visible panel", () => {
    expect(index).toContain('class="hint program-import-lead"');
    expect(index).toContain("<summary>Create or import program</summary>");
    expect(styles).toContain('.phase-import-details summary');
    expect(styles).toContain('background: var(--surface-program-summary-bg);');
    expect(styles).toContain('.phase-import-details summary::after');
    expect(styles).toContain('content: "Open"');
    expect(styles).toContain('.phase-import-details[open] summary');
    expect(styles).toContain('border-color: var(--surface-program-summary-open-border);');
    expect(styles).toContain('.phase-import-details .program-import-lead');
    expect(styles).toContain('border: 1px solid var(--surface-program-lead-border);');
    expect(styles).toContain('background: var(--surface-program-lead-bg);');
    expect(styles).toContain('color: var(--surface-program-lead-text);');
  });

  it("renders program import errors as a stronger inline alert panel", () => {
    expect(script).toContain('program-preview-error" role="alert" aria-live="assertive"');
    expect(script).toContain('Program import error');
    expect(styles).toContain('.program-preview-error');
    expect(styles).toContain('border: 1px solid var(--surface-program-error-border);');
    expect(styles).toContain('background: var(--surface-program-error-bg);');
    expect(styles).toContain('.program-preview-error-title');
    expect(styles).toContain('.program-preview-hints');
    expect(styles).toContain('border: 1px solid var(--surface-program-error-muted-border);');
  });

  it("renders save-time program import failures with the same alert styling", () => {
    expect(script).toContain("function renderPhaseImportStatus(message, tone = \"info\")");
    expect(script).toContain('renderPhaseImportStatus(error instanceof Error ? error.message : "Could not import phase.", "error");');
    expect(styles).toContain('#phase-import-status.is-error');
    expect(styles).toContain('background: var(--surface-program-error-bg);');
    expect(styles).toContain('#phase-import-status.is-error .phase-import-status-title');
  });

  it("adds a dedicated JSON export/import flow for saved program templates", () => {
    expect(index).toContain('id="export-program-templates"');
    expect(index).toContain('id="import-program-templates-file"');
    expect(index).toContain('id="program-template-transfer-status"');
    expect(index).toContain("Export or import reusable templates as a separate JSON file.");
    expect(index).toContain("Export templates");
    expect(index).toContain("Import template JSON");
    expect(script).toContain("createProgramTemplateExportPayload");
    expect(script).toContain("parseProgramTemplateExportPayload");
    expect(script).toContain("program-template-transfer-status-title");
    expect(script).toContain("Exported ");
    expect(script).toContain("Imported ");
    expect(script).toContain("function exportSingleProgramTemplate(template)");
    expect(script).toContain('data-role="export-phase-template"');
    expect(script).toContain('">Export</button>');
    expect(styles).toContain(".program-template-transfer");
    expect(styles).toContain("#program-template-transfer-status.is-error");
  });

  it("gives the Program section cards a shared panel surface", () => {
    expect(styles).toContain('.view-panel[data-view="phases"] > .card');
    expect(styles).toContain('background: var(--surface-program-panel-bg);');
    expect(styles).toContain('.view-panel[data-view="phases"] > .card h2');
    expect(styles).toContain('.view-panel[data-view="phases"] > .card .hint');
  });

  it("explains the two program list sections with short helper copy", () => {
    expect(index).toContain('Programs already placed on the calendar for upcoming work.');
    expect(index).toContain('Reusable templates you can duplicate, edit, or load into the builder.');
  });

  it("shows lifecycle dates for scheduled programs and stats progress", () => {
    expect(script).toContain("function buildPhaseInstanceLifecycle(instance)");
    expect(script).toContain("phase-badge-lifecycle");
    expect(script).toContain("Program status");
    expect(script).toContain("Done sessions");
    expect(script).toContain("Program start");
    expect(script).toContain("Expected finish");
    expect(script).toContain("Real finish");
    expect(script).toContain('const realFinishLabel = lifecycle.actualFinishDate');
    expect(script).toContain("is ${model.lifecycleStatus.label.toLowerCase()}");
    expect(script).toContain('<span class="label">Program start</span>');
    expect(script).toContain('<span class="label">Program status</span>');
    expect(script).toContain('class="badge program-progress-primary"');
    expect(script).toContain('class="badge program-progress-timing"');
    expect(script).toContain('<span class="label">Expected finish</span>');
    expect(script).toContain('<span class="label">Real finish</span>');
    expect(styles).toContain(".phase-badge-lifecycle-on-track");
    expect(styles).toContain(".phase-badge-lifecycle-shifted");
    expect(styles).toContain(".phase-badge-lifecycle-finished-on-time");
    expect(styles).toContain(".phase-badge-lifecycle-finished-late");
    expect(styles).toContain(".program-lifecycle-status");
    expect(styles).toContain("#program-progress-summary .program-progress-primary");
    expect(styles).toContain("#program-progress-summary .program-progress-timing");
    expect(script).toContain("starts on ${formatHumanDate(model.startDate)}, is expected to finish by");
  });

  it("explains lifecycle statuses next to program progress", () => {
    expect(index).toContain('id="program-lifecycle-guide"');
    expect(index).toContain("<summary>Status guide</summary>");
    expect(index).toContain("<strong>On track</strong>");
    expect(index).toContain("<strong>Shifted</strong>");
    expect(index).toContain("<strong>Finished on time</strong>");
    expect(index).toContain("<strong>Finished late</strong>");
    expect(index).toContain("<strong>In progress</strong>");
    expect(index).toContain("<strong>Date note</strong>");
    expect(index).toContain("`Real finish` appears once all generated program sessions are closed");
    expect(styles).toContain(".lifecycle-guide-disclosure");
    expect(styles).toContain(".lifecycle-guide-list");
    expect(styles).toContain(".lifecycle-guide-item");
    expect(styles).toContain(".lifecycle-guide-note");
    expect(styles).toContain(".program-status-guide-label");
    expect(styles).toContain(".program-status-guide-list");
    expect(styles).toContain(".program-status-guide-list strong");
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
    const editIndex = script.indexOf('renderPhaseImportStatus(`Editing "');
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
    expect(styles).toContain('background: var(--surface-program-edit-bg);');
    expect(styles).toContain('.phase-import-details[data-program-import-mode="edit"] .dialog-actions #save-phase-button');
    expect(styles).toContain('.phase-import-details[data-program-import-mode="edit"] .dialog-actions #cancel-phase-edit');
  });

  it("offers a reset action for the builder", () => {
    expect(script).toContain('reset-program-builder');
    expect(script).toContain("Builder reset to a blank program.");
  });

  it("shows a live draft summary in the program builder header", () => {
    expect(index).toContain('id="program-builder-summary"');
    expect(script).toContain('programBuilderSummaryEl');
    expect(script).toContain('updateProgramBuilderSummary()');
    expect(styles).toContain('.program-builder-summary');
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

  it("surfaces empty program blocks with an inline warning and stronger block treatment", () => {
    expect(script).toContain('program-block-row${isEmpty ? " is-empty-exercises" : ""}');
    expect(script).toContain("program-block-empty-warning");
    expect(script).toContain("No exercises yet.");
    expect(script).toContain("Add one now so");
    expect(script).toContain("stays valid when you save.");
    expect(styles).toContain('.program-block-row.is-empty-exercises');
    expect(styles).toContain('border: 1px solid var(--surface-program-error-border);');
    expect(styles).toContain('.program-block-row.is-empty-exercises .program-exercise-editor');
    expect(styles).toContain('.program-block-empty-warning');
  });

  it("gives the empty program states distinct visual callouts", () => {
    expect(script).toContain('program-empty-state program-empty-days');
    expect(script).toContain('program-empty-state program-empty-blocks');
    expect(script).toContain('program-preview-empty program-preview-empty-blocks');
    expect(script).toContain('program-preview-empty program-preview-empty-exercises');
    expect(styles).toContain('.view-panel[data-view="phases"] .program-empty-state');
    expect(styles).toContain('border: 1px dashed #76e4ff55');
    expect(styles).toContain('.view-panel[data-view="phases"] .program-empty-blocks');
    expect(styles).toContain('rgb(155 92 255 / 10%)');
    expect(script).toContain('program-block-empty-warning');
    expect(styles).toContain('.program-block-empty-warning');
  });

  it("aligns the program editor rows so fields read top-to-bottom cleanly", () => {
    expect(styles).toContain('.program-day-row');
    expect(styles).toContain('align-items: start');
    expect(styles).toContain('.program-block-row');
    expect(styles).toContain('.program-exercise-row');
    expect(styles).toContain('.program-day-row > button');
    expect(styles).toContain('align-self: end');
    expect(styles).toContain('.program-day-row > label');
    expect(styles).toContain('min-width: 0');
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
    expect(script).toContain('program-preview-day-heading');
    expect(styles).toContain('.program-preview-block');
    expect(styles).toContain('border-left: 3px solid var(--band-purple)');
    expect(script).toContain('program-preview-block-heading');
    expect(styles).toContain('.program-preview-exercise-list');
    expect(styles).toContain('.program-preview-exercise');
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

  it("turns the program builder guide into a clearer step strip", () => {
    expect(index).toContain('program-builder-guide');
    expect(styles).toContain('.program-builder-guide');
    expect(styles).toContain('linear-gradient(180deg, rgb(0 229 255 / 6%)');
    expect(styles).toContain('.program-builder-guide-list li');
    expect(styles).toContain('grid-template-columns: auto minmax(0, 1fr)');
    expect(styles).toContain('.program-builder-guide-list li::before');
    expect(styles).toContain('counter(program-builder-step)');
  });

  it("groups the program import metadata fields into one control strip", () => {
    expect(index).toContain('program-import-metadata');
    expect(styles).toContain('.program-import-metadata');
    expect(styles).toContain('border: 1px solid var(--surface-program-meta-border);');
    expect(styles).toContain('background: var(--surface-program-meta-bg);');
    expect(styles).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
    expect(styles).toContain('.program-import-metadata label');
  });

  it("shows inline PROGRAM-row feedback on the metadata fields", () => {
    expect(script).toContain("function syncProgramBasicsValidation");
    expect(script).toContain("setFieldError(phaseNameOverrideInput, validation.nameError);");
    expect(script).toContain("setFieldError(phaseDurationWeeksInput, validation.durationWeeksError);");
    expect(previewDomain).toContain("PROGRAM row needs a program name.");
    expect(previewDomain).toContain("PROGRAM row needs a duration in weeks.");
    expect(previewDomain).toContain("PROGRAM row duration must be a positive whole number.");
  });

  it("styles the phase import content textarea as its own panel", () => {
    expect(index).toContain('class="program-import-content"');
    expect(styles).toContain('.program-import-content');
    expect(styles).toContain('border: 1px solid var(--surface-program-content-border);');
    expect(styles).toContain('background: var(--surface-program-content-bg);');
    expect(styles).toContain('.program-import-content textarea');
    expect(styles).toContain('min-height: 13rem');
  });

  it("frames the import preview as a visible panel", () => {
    expect(index).toContain('id="phase-import-preview"');
    expect(styles).toContain('.phase-import-preview');
    expect(styles).toContain('border: 1px solid #00e5ff33');
    expect(styles).toContain('linear-gradient(180deg, rgb(0 229 255 / 4%)');
    expect(styles).toContain('padding: 0.75rem');
  });

  it("styles the import action row as a closing footer band", () => {
    expect(styles).toContain('.phase-import-details .dialog-actions');
    expect(styles).toContain('border: 1px solid var(--surface-program-content-border);');
    expect(styles).toContain('background: var(--surface-program-content-bg);');
    expect(styles).toContain('.phase-import-details .dialog-actions button');
    expect(styles).toContain('font-size: 0.85rem;');
    expect(styles).toContain('.phase-import-details .dialog-actions #save-phase-button');
    expect(styles).toContain('min-width: 12rem');
    expect(styles).toContain('background: var(--button-program-build-submit-bg);');
  });

  it("makes program import status messages visible as feedback strips", () => {
    expect(script).toContain('phaseImportStatusEl.textContent');
    expect(styles).toContain('#phase-import-status:not(:empty)');
    expect(styles).toContain('border: 1px solid var(--surface-program-status-border);');
    expect(styles).toContain('background: var(--surface-program-status-bg);');
    expect(styles).toContain('min-height: 2.75rem');
  });

  it("renders saved templates and scheduled phases as distinct card types", () => {
    expect(styles).toContain('#phase-template-list .phase-card');
    expect(styles).toContain('linear-gradient(180deg, rgb(155 92 255 / 8%)');
    expect(styles).toContain('#phase-template-list .phase-template-details');
    expect(styles).toContain('#phase-instance-list .phase-card');
    expect(styles).toContain('linear-gradient(180deg, rgb(255 216 77 / 8%)');
    expect(styles).toContain('#phase-instance-list .phase-card header');
    expect(script).toContain('class="phase-instance-header"');
    expect(script).toContain('class="phase-instance-dates"');
    expect(script).toContain('Program start');
    expect(script).toContain('Expected finish');
    expect(script).toContain('Real finish');
    expect(script).toContain('data-role="open-phase-instance-stats"');
    expect(script).toContain('data-role="open-phase-instance-calendar"');
    expect(script).toContain('data-role="delete-phase-instance"');
    expect(script).toContain('class="phase-actions-primary"');
    expect(script).toContain('class="phase-actions-danger"');
    expect(script).toContain("selectedProgramProgressInstanceId = instance.id;");
    expect(script).toContain("setCurrentView(\"stats\")");
    expect(script).toContain("uiSettings.currentWeekStart = formatDateInput(startOfWeek(instance.startDate));");
    expect(script).toContain("setCurrentView(\"calendar\")");
    expect(script).toContain("openPhaseInstanceDeleteDialog(instance.id);");
    expect(script).toContain("function deletePhaseInstance(instanceId) {");
    expect(styles).toContain('.phase-instance-dates');
    expect(styles).toContain('.phase-instance-date-item');
    expect(styles).toContain('.phase-instance-date-label');
    expect(styles).toContain('.phase-instance-date-value');
    expect(styles).toContain('#phase-instance-list .phase-actions-primary');
    expect(styles).toContain('#phase-instance-list .phase-actions-danger');
  });

  it("confirms destructive actions through one shared dialog", () => {
    expect(index).toContain('id="delete-confirm-title"');
    expect(index).toContain('id="delete-confirm-message"');
    expect(index).toContain('id="cancel-delete-workout"');
    expect(script).toContain('const deleteConfirmTitleEl = document.getElementById("delete-confirm-title");');
    expect(script).toContain('const deleteConfirmMessageEl = document.getElementById("delete-confirm-message");');
    expect(script).toContain('const cancelDeleteWorkoutButton = document.getElementById("cancel-delete-workout");');
    expect(script).toContain("function openDestructiveActionDialog({ title, message, confirmLabel = \"Delete\", fallbackMessage = \"\", onConfirm }) {");
    expect(script).toContain("title: \"Remove scheduled program\"");
    expect(script).toContain("confirmLabel: \"Remove scheduled program\"");
  });

  it("routes saved-data destructive actions through the shared confirmation dialog", () => {
    expect(script).toContain("title: \"Delete saved exercise\"");
    expect(script).toContain("confirmLabel: \"Delete exercise\"");
    expect(script).toContain("title: \"Delete planned session\"");
    expect(script).toContain("confirmLabel: \"Delete session\"");
    expect(script).toContain("title: \"Mark session as missed\"");
    expect(script).toContain("confirmLabel: \"Mark as missed\"");
    expect(script).toContain("title: \"Reset planned session\"");
    expect(script).toContain("confirmLabel: \"Reset session\"");
    expect(script).toContain("title: \"Delete saved program template\"");
    expect(script).toContain("confirmLabel: \"Delete template\"");
    expect(script).toContain("function deletePhaseTemplate(templateId) {");
    expect(script).toContain("function deletePlannedSession(sessionId) {");
    expect(script).toContain("function resetPlannedSession(sessionId) {");
    expect(script).toContain("function missPlannedSession(sessionId) {");
  });

  it("makes the saved-template filter read like a control strip", () => {
    expect(index).toContain('class="phase-template-filter"');
    expect(styles).toContain('.phase-template-filter');
    expect(styles).toContain('border: 1px solid var(--surface-program-filter-border);');
    expect(styles).toContain('background: var(--surface-program-filter-bg);');
    expect(styles).toContain('.phase-template-filter input');
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
    expect(previewDomain).toContain('Add a `TRAINING` row before any `BLOCK` rows.');
  });

  it("generates Training # titles for blank TRAINING rows", () => {
    expect(script).toContain('`Training #${template.weekdaySlots.length + 1}`');
    expect(previewDomain).toContain("Training #");
  });

  it("shows inline BLOCK-row feedback in the builder", () => {
    expect(script).toContain("function syncProgramBlockValidation()");
    expect(script).toContain("setFieldError(labelInput, validation.labelError);");
    expect(script).toContain("setFieldError(durationInput, validation.durationError);");
    expect(script).toContain("setFieldError(restInput, validation.restError);");
    expect(script).toContain("setFieldError(setsInput, validation.setsError);");
    expect(previewDomain).toContain("BLOCK row needs a label.");
    expect(previewDomain).toContain("BLOCK row duration must look like `15 min`, `15 mins`, or `15-20 mins`.");
    expect(previewDomain).toContain("BLOCK row rest must look like `30s`, `90 sec`, or `90-120s`.");
    expect(previewDomain).toContain("BLOCK row sets must look like `3` or `3-4`.");
  });

  it("keeps single block timing values from being reformatted into fake ranges", () => {
    expect(script).toContain("isNumber(min) && isNumber(max) && max > 0");
  });

  it("shows inline EXERCISE-row feedback and generated codes in the builder", () => {
    expect(script).toContain("function syncProgramExerciseValidation()");
    expect(script).toContain("setFieldError(nameInput, validation.nameError);");
    expect(script).toContain("setFieldError(repsInput, validation.repsError);");
    expect(script).toContain("setFieldError(weightInput, validation.weightError);");
    expect(script).toContain('blockExercises.push({ code: "", name: "", reps: "", notes: "", weight: "" });');
    expect(previewDomain).toContain("EXERCISE row needs an exercise name.");
    expect(previewDomain).toContain("EXERCISE row reps must look like `8`, `8-10`, `2x10`, `2x8-10`, `30s`, or `15-30s`.");
    expect(previewDomain).toContain("EXERCISE row weight must be a positive number like `60`, `62.5`, or `28.25`.");
  });
});
