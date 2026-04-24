const STORAGE_KEY_WORKOUTS = "twm_workouts_v1";
const STORAGE_KEY_GOALS = "twm_goals_v1";
const STORAGE_KEY_EXERCISES = "twm_exercise_library_v1";
const STORAGE_KEY_PLANNED_SESSIONS = "twm_planned_sessions_v2";
const STORAGE_KEY_PHASE_TEMPLATES = "twm_phase_templates_v2";
const STORAGE_KEY_PHASE_INSTANCES = "twm_phase_instances_v2";
const STORAGE_KEY_UI_SETTINGS = "twm_ui_settings_v2";

const workoutForm = document.getElementById("workout-form");
const goalsForm = document.getElementById("goals-form");
const historyBody = document.getElementById("history-body");
const summaryEl = document.getElementById("summary");
const goalProgressEl = document.getElementById("goal-progress");
const workoutSubmitButton = workoutForm.querySelector('button[type="submit"]');
const activityInput = document.getElementById("activity");
const activityFieldGroups = document.querySelectorAll(".activity-fields");
const addSprintSetButton = document.getElementById("add-sprint-set");
const sprintSetsList = document.getElementById("sprint-sets-list");
const addStrengthSetButton = document.getElementById("add-strength-set");
const addStrengthExerciseButton = document.getElementById("add-strength-exercise");
const currentStrengthSetsList = document.getElementById("current-strength-sets");
const strengthExerciseList = document.getElementById("strength-exercise-list");
const strengthSetLoadTypeInput = document.getElementById("strength-set-load-type");
const strengthSetWeightInput = document.getElementById("strength-set-weight");
const strengthSetBandColorInput = document.getElementById("strength-set-band-color");
const strengthSetWeightLabel = document.getElementById("strength-set-weight-label");
const strengthSetBandColorLabel = document.getElementById("strength-set-band-color-label");
const filterActivityInput = document.getElementById("filter-activity");
const filterFromDateInput = document.getElementById("filter-from-date");
const filterToDateInput = document.getElementById("filter-to-date");
const clearFiltersButton = document.getElementById("clear-filters");
const filterStrengthLoadInput = document.getElementById("filter-strength-load");
const chartGroupingInput = document.getElementById("chart-grouping");
const chartsStatusEl = document.getElementById("charts-status");
const strengthChartCanvas = document.getElementById("strength-chart");
const runChartCanvas = document.getElementById("run-chart");
const sprintChartCanvas = document.getElementById("sprint-chart");
const chartsGridEl = document.querySelector(".charts-grid");
const strengthChartCard = strengthChartCanvas ? strengthChartCanvas.closest(".chart-card") : null;
const runChartCard = runChartCanvas ? runChartCanvas.closest(".chart-card") : null;
const sprintChartCard = sprintChartCanvas ? sprintChartCanvas.closest(".chart-card") : null;
const exportDataButton = document.getElementById("export-data");
const importDataFileInput = document.getElementById("import-data-file");
const backupStatusEl = document.getElementById("backup-status");
const workoutFormStatusEl = document.getElementById("workout-form-status");
const installAppButton = document.getElementById("install-app");
const deleteConfirmDialog = document.getElementById("delete-confirm-dialog");
const confirmDeleteWorkoutButton = document.getElementById("confirm-delete-workout");
const cancelDeleteWorkoutButton = document.getElementById("cancel-delete-workout");
const editWorkoutDialog = document.getElementById("edit-workout-dialog");
const editDateInput = document.getElementById("edit-date");
const editActivityInput = document.getElementById("edit-activity");
const editNotesInput = document.getElementById("edit-notes");
const editDistanceInput = document.getElementById("edit-distance");
const editTimeInput = document.getElementById("edit-time");
const editPaceInput = document.getElementById("edit-pace");
const editSprintSetsInput = document.getElementById("edit-sprint-sets");
const editExerciseNameInput = document.getElementById("edit-exercise-name");
const editStrengthRepsInput = document.getElementById("edit-strength-reps");
const editStrengthLoadTypeInput = document.getElementById("edit-strength-load-type");
const editStrengthWeightInput = document.getElementById("edit-strength-weight");
const editStrengthBandColorInput = document.getElementById("edit-strength-band-color");
const editStrengthWeightLabel = document.getElementById("edit-strength-weight-label");
const editStrengthBandColorLabel = document.getElementById("edit-strength-band-color-label");
const editAddStrengthSetButton = document.getElementById("edit-add-strength-set");
const editAddStrengthExerciseButton = document.getElementById("edit-add-strength-exercise");
const editCurrentStrengthSetsList = document.getElementById("edit-current-strength-sets");
const editStrengthExercisesList = document.getElementById("edit-strength-exercises-list");
const editRunFields = document.getElementById("edit-run-fields");
const editSprintFields = document.getElementById("edit-sprint-fields");
const editStrengthFields = document.getElementById("edit-strength-fields");
const editWorkoutStatusEl = document.getElementById("edit-workout-status");
const saveEditWorkoutButton = document.getElementById("save-edit-workout");
const cancelEditWorkoutButton = document.getElementById("cancel-edit-workout");
const exerciseSuggestionsEl = document.getElementById("exercise-suggestions");
const exerciseLibraryListEl = document.getElementById("exercise-library-list");
const coachModeToggle = document.getElementById("coach-mode-toggle");
const viewNavButtons = document.querySelectorAll("[data-view-target]");
const viewPanels = document.querySelectorAll(".view-panel");
const plannerSummaryEl = document.getElementById("planner-summary");
const calendarWeekLabelEl = document.getElementById("calendar-week-label");
const calendarGridEl = document.getElementById("calendar-grid");
const calendarSessionDialog = document.getElementById("calendar-session-dialog");
const calendarSessionDetailEl = document.getElementById("calendar-session-detail");
const plannedRunEditDialog = document.getElementById("planned-run-edit-dialog");
const plannedRunEditForm = document.getElementById("planned-run-edit-form");
const plannedRunEditIdInput = document.getElementById("planned-run-edit-id");
const plannedRunEditDateInput = document.getElementById("planned-run-edit-date");
const plannedRunEditTitleInput = document.getElementById("planned-run-edit-title");
const plannedRunEditDistanceInput = document.getElementById("planned-run-edit-distance");
const plannedRunEditPaceInput = document.getElementById("planned-run-edit-pace");
const plannedRunEditNotesInput = document.getElementById("planned-run-edit-notes");
const plannedRunEditStatusEl = document.getElementById("planned-run-edit-status");
const cancelPlannedRunEditButton = document.getElementById("cancel-planned-run-edit");
const strengthSessionMoveDialog = document.getElementById("strength-session-move-dialog");
const strengthSessionMoveForm = document.getElementById("strength-session-move-form");
const strengthSessionMoveIdInput = document.getElementById("strength-session-move-id");
const strengthSessionMoveTitleEl = document.getElementById("strength-session-move-title");
const strengthSessionCurrentDateInput = document.getElementById("strength-session-current-date");
const strengthSessionNewDateInput = document.getElementById("strength-session-new-date");
const strengthSessionMoveStatusEl = document.getElementById("strength-session-move-status");
const cancelStrengthSessionMoveButton = document.getElementById("cancel-strength-session-move");
const prevWeekButton = document.getElementById("prev-week");
const nextWeekButton = document.getElementById("next-week");
const currentWeekButton = document.getElementById("current-week");
const plannedSessionForm = document.getElementById("planned-session-form");
const plannedSessionIdInput = document.getElementById("planned-session-id");
const plannedSessionDateInput = document.getElementById("planned-session-date");
const plannedSessionTypeInput = document.getElementById("planned-session-type");
const plannedSessionTitleInput = document.getElementById("planned-session-title");
const plannedSessionNotesInput = document.getElementById("planned-session-notes");
const plannedRunFields = document.getElementById("planned-run-fields");
const plannedRunDistanceInput = document.getElementById("planned-run-distance");
const plannedRunPaceInput = document.getElementById("planned-run-pace");
const plannedSprintFields = document.getElementById("planned-sprint-fields");
const plannedSprintRepsInput = document.getElementById("planned-sprint-reps");
const plannedSprintDistanceInput = document.getElementById("planned-sprint-distance");
const plannedSprintTargetTimeInput = document.getElementById("planned-sprint-target-time");
const plannedSprintRestInput = document.getElementById("planned-sprint-rest");
const addPlannedSprintBlockButton = document.getElementById("add-planned-sprint-block");
const plannedSprintBlocksListEl = document.getElementById("planned-sprint-blocks-list");
const plannedSessionStatusEl = document.getElementById("planned-session-status");
const cancelPlannedSessionButton = document.getElementById("cancel-planned-session");
const phaseImportForm = document.getElementById("phase-import-form");
const phaseEditIdInput = document.getElementById("phase-edit-id");
const phaseNameOverrideInput = document.getElementById("phase-name-override");
const phaseImportFileInput = document.getElementById("phase-import-file");
const phaseImportTextInput = document.getElementById("phase-import-text");
const savePhaseButton = document.getElementById("save-phase-button");
const cancelPhaseEditButton = document.getElementById("cancel-phase-edit");
const phaseImportStatusEl = document.getElementById("phase-import-status");
const phaseTemplateListEl = document.getElementById("phase-template-list");
const phaseInstanceListEl = document.getElementById("phase-instance-list");
const reviewSummaryEl = document.getElementById("review-summary");
const reviewSessionListEl = document.getElementById("review-session-list");
const adherenceSummaryEl = document.getElementById("adherence-summary");
const adherenceBreakdownEl = document.getElementById("adherence-breakdown");
const programProgressSelect = document.getElementById("program-progress-select");
const programExerciseSortInput = document.getElementById("program-exercise-sort");
const programProgressSummaryEl = document.getElementById("program-progress-summary");
const programProgressStatusEl = document.getElementById("program-progress-status");
const programAdherenceChartCanvas = document.getElementById("program-adherence-chart");
const programAdherenceChartCard = document.getElementById("program-adherence-chart-card");
const programExerciseProgressEl = document.getElementById("program-exercise-progress");
const completionDialog = document.getElementById("completion-dialog");
const completionForm = document.getElementById("completion-form");
const completionSessionIdInput = document.getElementById("completion-session-id");
const completionDateInput = document.getElementById("completion-date");
const completionSessionTitleEl = document.getElementById("completion-session-title");
const completionRunFields = document.getElementById("completion-run-fields");
const completionRunDistanceInput = document.getElementById("completion-run-distance");
const completionRunTimeInput = document.getElementById("completion-run-time");
const completionRunPaceInput = document.getElementById("completion-run-pace");
const completionSprintFields = document.getElementById("completion-sprint-fields");
const completionSprintBlocksEl = document.getElementById("completion-sprint-blocks");
const completionSprintFeelingInput = document.getElementById("completion-sprint-feeling");
const completionStrengthFields = document.getElementById("completion-strength-fields");
const completionStrengthBlocksEl = document.getElementById("completion-strength-blocks");
const completionNoteInput = document.getElementById("completion-note");
const completionStatusMessageEl = document.getElementById("completion-status-message");
const cancelCompletionButton = document.getElementById("cancel-completion");
const BAND_COLOR_OPTIONS = ["yellow", "red", "black", "purple", "green", "blue"];
const BAND_COLOR_LABELS = {
  yellow: "extra light",
  red: "light",
  black: "medium",
  purple: "heavy",
  green: "extra heavy",
  blue: "strongest",
};
const SPRINT_FEELING_OPTIONS = [
  { value: "sharp", label: "Sharp ⚡" },
  { value: "solid", label: "Solid 🙂" },
  { value: "flat", label: "Flat 🪫" },
  { value: "sluggish", label: "Sluggish 🐢" },
  { value: "pain", label: "Pain ⚠️" },
];

const dateInput = document.getElementById("date");

dateInput.valueAsDate = new Date();

let workouts = load(STORAGE_KEY_WORKOUTS, []).map((workout) => normalizeImportedWorkout(workout));
let goals = load(STORAGE_KEY_GOALS, {
  strength: null,
  run: null,
  runPace: null,
  sprint: null,
});
let exerciseLibrary = load(STORAGE_KEY_EXERCISES, []);
let plannedSessions = load(STORAGE_KEY_PLANNED_SESSIONS, []).map((session) => normalizePlannedSession(session));
let phaseTemplates = load(STORAGE_KEY_PHASE_TEMPLATES, []).map((template) => normalizePhaseTemplate(template));
let phaseInstances = load(STORAGE_KEY_PHASE_INSTANCES, []).map((instance) => normalizePhaseInstance(instance));
let uiSettings = load(STORAGE_KEY_UI_SETTINGS, {
  currentView: "calendar",
  coachMode: false,
  currentWeekStart: formatDateInput(startOfWeek(new Date())),
});
let editingWorkoutId = null;
let draftSprintSets = [];
let draftPlannedSprintBlocks = [];
let draftStrengthExercises = [];
let draftCurrentStrengthSets = [];
let progressFilters = {
  activity: "all",
  fromDate: "",
  toDate: "",
  strengthLoad: "all",
};
let chartGrouping = "week";
let strengthChart = null;
let runChart = null;
let sprintChart = null;
let programAdherenceChart = null;
let selectedProgramProgressInstanceId = "";
let programExerciseSortMode = "program-order";
let editingPhaseTemplateId = "";
let completionStrengthDraft = [];
let completionSprintDraft = [];
let selectedCalendarSessionId = "";
let pendingDeleteWorkoutId = null;
let deferredInstallPrompt = null;
let editingPopupWorkoutId = null;
let editDraftCurrentStrengthSets = [];
let editDraftStrengthExercises = [];

hydrateGoalInputs();
syncExerciseLibraryFromWorkouts();
renderExerciseLibrary();
refreshDetectedSessionStatuses();
updateVisibleFields();
renderSprintSets();
renderPlannedSprintBlocks();
renderCurrentStrengthSets();
renderStrengthExercises();
render();

workoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setWorkoutFormStatus("");

  const selectedActivity = valueOf("activity");
  const runDistance = toNumberOrNull(valueOf("distance"));
  const runTime = normalizeRunDurationInput(valueOf("time"));
  const runPace = calculateRunPace(runDistance, parseRunDurationToSeconds(runTime));

  const workout = {
    id: editingWorkoutId ?? crypto.randomUUID(),
    date: valueOf("date"),
    activity: selectedActivity,
    strengthExercises: selectedActivity === "strength" ? normalizeStrengthExercises(draftStrengthExercises) : [],
    distance: selectedActivity === "run" ? runDistance : toNumberOrNull(valueOf("distance")),
    time: selectedActivity === "run" ? runTime : toNumberOrNull(valueOf("time")),
    pace: selectedActivity === "run" ? runPace : toNumberOrNull(valueOf("pace")),
    sprintSets: selectedActivity === "sprint" ? normalizeSprintSets(draftSprintSets) : [],
    notes: valueOf("notes")?.trim() || "",
    createdAt: Date.now(),
  };

  if (workout.activity === "strength" && workout.strengthExercises.length === 0) {
    setWorkoutFormStatus("Please add at least one strength exercise before saving.");
    return;
  }

  if (workout.activity === "run" && (!isNumber(workout.distance) || !workout.time || !isNumber(workout.pace))) {
    setWorkoutFormStatus("Please enter run distance in km and time in hh:mm:ss.");
    return;
  }

  if (workout.activity === "sprint" && workout.sprintSets.length === 0) {
    setWorkoutFormStatus("Please add at least one sprint set before saving.");
    return;
  }

  if (editingWorkoutId) {
    const existingIndex = workouts.findIndex((savedWorkout) => savedWorkout.id === editingWorkoutId);
    if (existingIndex >= 0) {
      workouts[existingIndex] = {
        ...workout,
        createdAt: workouts[existingIndex].createdAt,
      };
    }
  } else {
    workouts.unshift(workout);
  }
  save(STORAGE_KEY_WORKOUTS, workouts);
  resetWorkoutForm();
  setWorkoutFormStatus("Workout saved.");
  render();
});

activityInput.addEventListener("change", updateVisibleFields);
addSafeEventListener(document.getElementById("distance"), "input", syncRunPaceFromInputs);
addSafeEventListener(document.getElementById("time"), "input", syncRunPaceFromInputs);
addSafeEventListener(document.getElementById("time"), "change", normalizeRunTimeField);
filterActivityInput.addEventListener("change", onFilterChange);
filterFromDateInput.addEventListener("change", onFilterChange);
filterToDateInput.addEventListener("change", onFilterChange);
filterStrengthLoadInput.addEventListener("change", onFilterChange);
clearFiltersButton.addEventListener("click", clearFilters);
chartGroupingInput.addEventListener("change", () => {
  chartGrouping = chartGroupingInput.value || "week";
  renderCharts();
});
programProgressSelect?.addEventListener("change", () => {
  selectedProgramProgressInstanceId = programProgressSelect.value || "";
  renderProgramProgress();
});
programExerciseSortInput?.addEventListener("change", () => {
  programExerciseSortMode = programExerciseSortInput.value || "program-order";
  renderProgramProgress();
});
exportDataButton.addEventListener("click", exportBackupData);
importDataFileInput.addEventListener("change", importBackupData);
confirmDeleteWorkoutButton.addEventListener("click", confirmDeleteWorkout);
cancelDeleteWorkoutButton.addEventListener("click", cancelDeleteWorkout);
addSafeEventListener(saveEditWorkoutButton, "click", saveEditedWorkout);
addSafeEventListener(cancelEditWorkoutButton, "click", closeEditWorkoutDialog);
addSafeEventListener(editDistanceInput, "input", syncEditRunPaceFromInputs);
addSafeEventListener(editTimeInput, "input", syncEditRunPaceFromInputs);
addSafeEventListener(editTimeInput, "change", normalizeEditRunTimeField);
addSafeEventListener(editAddStrengthSetButton, "click", addEditStrengthSet);
addSafeEventListener(editAddStrengthExerciseButton, "click", addEditStrengthExercise);
addSafeEventListener(editStrengthExercisesList, "input", handleInlineStrengthEdit);
addSafeEventListener(editStrengthExercisesList, "change", handleInlineStrengthEdit);
addSafeEventListener(editStrengthExercisesList, "click", handleInlineStrengthDelete);
addSafeEventListener(exerciseLibraryListEl, "click", handleExerciseLibraryClick);
document.addEventListener("click", handleBandColorPickerClick);
addSafeEventListener(editStrengthLoadTypeInput, "change", () => {
  const loadType = editStrengthLoadTypeInput.value;
  editStrengthWeightInput.disabled = loadType !== "kg";
  setBandColorPickerDisabled(editStrengthBandColorInput, loadType !== "band");
  if (editStrengthWeightLabel) {
    editStrengthWeightLabel.style.display = loadType === "kg" ? "grid" : "none";
  }
  if (editStrengthBandColorLabel) {
    editStrengthBandColorLabel.style.display = loadType === "band" ? "grid" : "none";
  }
  if (loadType !== "kg") {
    editStrengthWeightInput.value = "";
  }
  if (loadType !== "band") {
    setBandColorPickerValue(editStrengthBandColorInput, "");
  }
});
installAppButton.addEventListener("click", installPwaApp);
strengthSetLoadTypeInput.addEventListener("change", () => {
  const loadType = strengthSetLoadTypeInput.value;
  strengthSetWeightInput.disabled = loadType !== "kg";
  setBandColorPickerDisabled(strengthSetBandColorInput, loadType !== "band");
  if (strengthSetWeightLabel) {
    strengthSetWeightLabel.style.display = loadType === "kg" ? "grid" : "none";
  }
  if (strengthSetBandColorLabel) {
    strengthSetBandColorLabel.style.display = loadType === "band" ? "grid" : "none";
  }
  if (loadType !== "kg") {
    strengthSetWeightInput.value = "";
  }
  if (loadType !== "band") {
    setBandColorPickerValue(strengthSetBandColorInput, "");
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installAppButton.style.display = "inline-block";
});

strengthSetLoadTypeInput.dispatchEvent(new Event("change"));
if (editStrengthLoadTypeInput) {
  editStrengthLoadTypeInput.dispatchEvent(new Event("change"));
}

addSprintSetButton.addEventListener("click", () => {
  const sprintTime = toNumberOrNull(valueOf("sprint-time-sec"));
  const sprintDistance = toNumberOrNull(valueOf("sprint-distance-m"));

  if (!isNumber(sprintTime) || !isNumber(sprintDistance)) {
    setWorkoutFormStatus("Sprint set needs both time (sec) and distance (m).");
    return;
  }

  draftSprintSets.push({
    order: draftSprintSets.length + 1,
    time: sprintTime,
    distance: sprintDistance,
  });

  document.getElementById("sprint-time-sec").value = "";
  document.getElementById("sprint-distance-m").value = "";
  renderSprintSets();
  setWorkoutFormStatus("Sprint set added.");
});

addStrengthSetButton.addEventListener("click", () => {
  const reps = toNumberOrNull(valueOf("strength-set-reps"));
  const weight = toNumberOrNull(valueOf("strength-set-weight"));
  const loadType = valueOf("strength-set-load-type");
  const bandColor = valueOf("strength-set-band-color");

  if (!isNumber(reps)) {
    setWorkoutFormStatus("Set reps are required.");
    return;
  }

  if (loadType === "kg" && !isNumber(weight)) {
    setWorkoutFormStatus("Set weight is required for kg load type.");
    return;
  }

  if (loadType === "band" && !bandColor) {
    setWorkoutFormStatus("Pick a band color for band load type.");
    return;
  }

  draftCurrentStrengthSets.push({
    reps,
    weight: loadType === "kg" ? weight : null,
    loadType,
    bandColor: loadType === "band" ? bandColor : "",
  });

  document.getElementById("strength-set-reps").value = "";
  document.getElementById("strength-set-weight").value = "";
  setBandColorPickerValue(strengthSetBandColorInput, "");
  renderCurrentStrengthSets();
  setWorkoutFormStatus("Strength set added.");
});

addStrengthExerciseButton.addEventListener("click", () => {
  const exerciseName = valueOf("exercise-name").trim();
  if (!exerciseName || !draftCurrentStrengthSets.length) {
    setWorkoutFormStatus("Add an exercise name and at least one set.");
    return;
  }

  draftStrengthExercises.push({
    name: exerciseName,
    sets: draftCurrentStrengthSets.map((set, index) => ({
      order: index + 1,
      reps: set.reps,
      weight: set.weight,
      loadType: set.loadType || "kg",
      bandColor: set.bandColor || "",
    })),
  });
  rememberExerciseName(exerciseName);

  draftCurrentStrengthSets = [];
  document.getElementById("exercise-name").value = "";
  renderCurrentStrengthSets();
  renderStrengthExercises();
  setWorkoutFormStatus("Exercise added to workout.");
});

goalsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  goals = {
    strength: toNumberOrNull(valueOf("goal-strength")),
    run: toNumberOrNull(valueOf("goal-run")),
    runPace: parseGoalPaceInput(valueOf("goal-run-pace")),
    sprint: toNumberOrNull(valueOf("goal-sprint")),
  };
  save(STORAGE_KEY_GOALS, goals);
  renderGoals();
});

historyBody.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const { action, id } = target.dataset;
  if (!action || !id) {
    return;
  }

  if (action === "delete") {
    openDeleteConfirm(id);
    return;
  }

  if (action === "edit") {
    openEditWorkoutDialog(id);
  }
});

function render() {
  renderSummary();
  renderCharts();
  renderHistory();
  renderGoals();
  renderPlannerSummary();
  renderCalendar();
  renderCalendarSessionDetail();
  renderPhaseTemplates();
  renderPhaseInstances();
  renderReview();
  renderAdherenceStats();
  renderProgramProgress();
  syncViewState();
}

function renderSummary() {
  const filteredWorkouts = getFilteredWorkouts();

  const bestStrength = filteredWorkouts
    .filter((w) => w.activity === "strength")
    .map((w) => strengthBestWeight(w))
    .filter((weightValue) => isNumber(weightValue))
    .reduce((max, weightValue) => Math.max(max, weightValue), 0);

  const bestRunDistance = filteredWorkouts
    .filter((w) => w.activity === "run" && isNumber(w.distance))
    .reduce((max, w) => Math.max(max, w.distance), 0);

  const bestSprintTime = filteredWorkouts
    .filter((w) => w.activity === "sprint")
    .map((w) => sprintBestTime(w))
    .filter((timeValue) => isNumber(timeValue))
    .reduce((min, timeValue) => Math.min(min, timeValue), Infinity);

  summaryEl.innerHTML = `
    <article class="badge">
      <span class="label">Workouts logged</span>
      <span class="value">${filteredWorkouts.length}</span>
    </article>
    <article class="badge">
      <span class="label">Best strength weight</span>
      <span class="value">${bestStrength ? `${bestStrength} kg` : "-"}</span>
    </article>
    <article class="badge">
      <span class="label">Best run distance</span>
      <span class="value">${bestRunDistance ? `${bestRunDistance} km` : "-"}</span>
    </article>
    <article class="badge">
      <span class="label">Best sprint time</span>
      <span class="value">${Number.isFinite(bestSprintTime) ? `${bestSprintTime} sec` : "-"}</span>
    </article>
  `;
}

function renderHistory() {
  const filteredWorkouts = getFilteredWorkouts().slice().sort(compareWorkoutsByRecentDate);

  if (!filteredWorkouts.length) {
    const message = workouts.length
      ? "No workouts match your current filters."
      : "No workouts yet. Add your first one above.";
    historyBody.innerHTML = `<tr><td colspan="5">${message}</td></tr>`;
    return;
  }

  historyBody.innerHTML = filteredWorkouts
    .slice(0, 15)
    .map((w) => {
      const metric = formatMainMetric(w);
      return `
        <tr>
          <td>${w.date || "-"}</td>
          <td>${capitalize(w.activity)}</td>
          <td>${metric}</td>
          <td>${escapeHtml(w.notes || "")}</td>
          <td class="actions-cell">
            <button type="button" class="ghost-button" data-action="edit" data-id="${w.id}">Edit</button>
            <button type="button" class="ghost-button danger-button" data-action="delete" data-id="${w.id}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderGoals() {
  const currentStrength = workouts
    .filter((w) => w.activity === "strength")
    .map((w) => strengthBestWeight(w))
    .filter((weightValue) => isNumber(weightValue))
    .reduce((max, weightValue) => Math.max(max, weightValue), 0);

  const currentRun = workouts
    .filter((w) => w.activity === "run" && isNumber(w.distance))
    .reduce((max, w) => Math.max(max, w.distance), 0);

  const currentRunPace = workouts
    .filter((w) => w.activity === "run" && isNumber(w.pace))
    .map((w) => w.pace)
    .reduce((min, paceValue) => Math.min(min, paceValue), Infinity);

  const currentSprint = workouts
    .filter((w) => w.activity === "sprint")
    .map((w) => sprintBestTime(w))
    .filter((timeValue) => isNumber(timeValue))
    .reduce((min, timeValue) => Math.min(min, timeValue), Infinity);

  goalProgressEl.innerHTML = `
    ${goalRow("Strength", currentStrength, goals.strength, "kg", true)}
    ${goalRow("Run distance", currentRun, goals.run, "km", true)}
    ${goalRow("Run best pace", Number.isFinite(currentRunPace) ? currentRunPace : null, goals.runPace, "min/km", false)}
    ${goalRow("Sprint best time", Number.isFinite(currentSprint) ? currentSprint : null, goals.sprint, "sec", false)}
  `;
}

function goalRow(label, current, goal, unit, higherIsBetter) {
  if (!isNumber(goal)) {
    return `<div class="goal-item"><strong>${label}:</strong> No goal set yet.</div>`;
  }

  const safeCurrent = isNumber(current) ? current : 0;
  const rawPercent = higherIsBetter ? (safeCurrent / goal) * 100 : (goal / Math.max(safeCurrent, 0.0001)) * 100;
  const percent = Math.max(0, Math.min(100, rawPercent));

  return `
    <div class="goal-item">
      <strong>${label}:</strong> ${formatGoalValue(safeCurrent, unit)} / ${formatGoalValue(goal, unit)} ${unit}
      <div class="progress-bar"><span style="width:${percent.toFixed(0)}%"></span></div>
    </div>
  `;
}

function hydrateGoalInputs() {
  document.getElementById("goal-strength").value = goals.strength ?? "";
  document.getElementById("goal-run").value = goals.run ?? "";
  document.getElementById("goal-run-pace").value = isNumber(goals.runPace) ? formatGoalPace(goals.runPace) : "";
  document.getElementById("goal-sprint").value = goals.sprint ?? "";
}

function formatGoalValue(value, unit) {
  if (!isNumber(value)) {
    return "0";
  }
  return unit === "min/km" ? formatGoalPace(value) : formatNumber(value);
}

function parseGoalPaceInput(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parts = trimmed.split(":");
  if (parts.length !== 2 || parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }

  const [minutes, seconds] = parts.map(Number);
  if (seconds > 59) {
    return null;
  }

  return minutes + (seconds / 60);
}

function formatGoalPace(value) {
  if (!isNumber(value) || value < 0) {
    return "";
  }

  const totalSeconds = Math.round(value * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatMainMetric(w) {
  if (w.activity === "strength") {
    const exercises = normalizeStrengthExercises(w.strengthExercises);
    if (exercises.length) {
      return exercises
        .map((exercise) => {
          const setSummary = exercise.sets
            .map((set) => `${set.reps} reps @ ${formatStrengthLoad(set)}`)
            .join(", ");
          return `<div class="metric-line"><strong class="exercise-name">${escapeHtml(exercise.name)}</strong> (${setSummary})</div>`;
        })
        .join("");
    }

    return "-";
  }

  if (w.activity === "run") {
    const parts = [
      isNumber(w.distance) ? `${w.distance} km` : null,
      formatRunDuration(w.time),
      isNumber(w.pace) ? `${formatRunPace(w.pace)} min/km` : null,
    ].filter(Boolean);
    return parts.join(" • ") || "-";
  }

  const sprintSets = normalizeSprintSets(w.sprintSets);
  if (sprintSets.length) {
    const feeling = formatSprintFeeling(w.sprintFeeling);
    return [sprintSets.map((set) => `#${set.order} ${set.distance}m/${set.time}s`).join(" • "), feeling].filter(Boolean).join(" • ");
  }

  const parts = [isNumber(w.time) ? `${w.time} sec` : null, isNumber(w.distance) ? `${w.distance} m` : null, formatSprintFeeling(w.sprintFeeling)].filter(Boolean);
  return parts.join(" • ") || "-";
}

function valueOf(id) {
  return document.getElementById(id).value;
}

function renderBandColorDots(selectedColor, options = {}) {
  const { role = null, exerciseIndex = null, setIndex = null, disabled = false } = options;
  return BAND_COLOR_OPTIONS.map((color) => {
    const isSelected = color === selectedColor;
    const resistanceLabel = BAND_COLOR_LABELS[color] || color;
    const roleAttributes = role ? ` data-role="${role}" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}"` : "";
    return `<button type="button" class="band-color-dot${isSelected ? " is-selected" : ""}" data-band-color="${color}" data-resistance-label="${resistanceLabel}" aria-label="${capitalize(color)} band, ${resistanceLabel}" title="${capitalize(color)} - ${resistanceLabel}" aria-pressed="${isSelected ? "true" : "false"}"${disabled ? " disabled" : ""}${roleAttributes}></button>`;
  }).join("");
}

function syncBandColorPicker(input) {
  if (!input) {
    return;
  }
  const field = input.closest(".band-color-field");
  const picker = field?.querySelector(".band-color-picker");
  if (!picker) {
    return;
  }

  const selectedColor = input.value || "";
  picker.querySelectorAll(".band-color-dot").forEach((dot) => {
    const isSelected = dot.dataset.bandColor === selectedColor;
    dot.classList.toggle("is-selected", isSelected);
    dot.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
}

function setBandColorPickerValue(input, value) {
  if (!input) {
    return;
  }
  input.value = BAND_COLOR_OPTIONS.includes(value) ? value : "";
  syncBandColorPicker(input);
}

function setBandColorPickerDisabled(input, disabled) {
  if (!input) {
    return;
  }
  input.disabled = disabled;
  const field = input.closest(".band-color-field");
  const picker = field?.querySelector(".band-color-picker");
  if (!picker) {
    return;
  }

  picker.classList.toggle("is-disabled", disabled);
  picker.querySelectorAll(".band-color-dot").forEach((dot) => {
    dot.disabled = disabled;
  });
}

function handleBandColorPickerClick(event) {
  const dot = event.target.closest(".band-color-dot");
  if (!(dot instanceof HTMLButtonElement) || dot.closest(".inline-band-color-picker")) {
    return;
  }

  const field = dot.closest(".band-color-field");
  const input = field?.querySelector('input[type="hidden"]');
  if (!input || input.disabled) {
    return;
  }

  setBandColorPickerValue(input, dot.dataset.bandColor || "");
}

function toNumberOrNull(value) {
  if (value === "" || value == null) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function parseRunDurationToSeconds(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parts = trimmed.split(":");
  if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }

  const [hours, minutes, seconds] = parts.map(Number);
  if (minutes > 59 || seconds > 59) {
    return null;
  }

  return (hours * 3600) + (minutes * 60) + seconds;
}

function parseFlexibleRunDurationToSeconds(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parts = trimmed.split(":");
  if ((parts.length !== 2 && parts.length !== 3) || parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }

  const numbers = parts.map(Number);
  const [hours, minutes, seconds] = parts.length === 3 ? numbers : [0, numbers[0], numbers[1]];
  if (seconds > 59 || (parts.length === 3 && minutes > 59)) {
    return null;
  }

  return (hours * 3600) + (minutes * 60) + seconds;
}

function formatSecondsAsRunDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return null;
  }

  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function normalizeRunDurationInput(value) {
  const totalSeconds = parseRunDurationToSeconds(value);
  return totalSeconds == null ? "" : formatSecondsAsRunDuration(totalSeconds);
}

function normalizeFlexibleRunDurationInput(value) {
  const totalSeconds = parseFlexibleRunDurationToSeconds(value);
  return totalSeconds == null ? "" : formatSecondsAsRunDuration(totalSeconds);
}

function legacyRunMinutesToDuration(value) {
  if (!isNumber(value) || value < 0) {
    return "";
  }

  return formatSecondsAsRunDuration(value * 60) || "";
}

function formatRunDuration(value) {
  if (typeof value === "string") {
    return normalizeRunDurationInput(value) || null;
  }

  if (isNumber(value)) {
    return legacyRunMinutesToDuration(value) || null;
  }

  return null;
}

function calculateRunPace(distanceKm, totalSeconds) {
  if (!isNumber(distanceKm) || distanceKm <= 0 || !Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return null;
  }

  return totalSeconds / 60 / distanceKm;
}

function formatRunPace(value) {
  return formatNumber(value);
}

function syncRunPaceFromInputs() {
  const distanceInput = document.getElementById("distance");
  const timeInput = document.getElementById("time");
  const paceInput = document.getElementById("pace");
  if (!distanceInput || !timeInput || !paceInput) {
    return;
  }

  const pace = calculateRunPace(toNumberOrNull(distanceInput.value), parseRunDurationToSeconds(timeInput.value));
  paceInput.value = isNumber(pace) ? formatRunPace(pace) : "";
}

function normalizeRunTimeField() {
  const timeInput = document.getElementById("time");
  if (!timeInput) {
    return;
  }

  timeInput.value = normalizeRunDurationInput(timeInput.value);
  syncRunPaceFromInputs();
}

function syncEditRunPaceFromInputs() {
  if (!editDistanceInput || !editTimeInput || !editPaceInput) {
    return;
  }

  const pace = calculateRunPace(toNumberOrNull(editDistanceInput.value), parseRunDurationToSeconds(editTimeInput.value));
  editPaceInput.value = isNumber(pace) ? formatRunPace(pace) : "";
}

function normalizeEditRunTimeField() {
  if (!editTimeInput) {
    return;
  }

  editTimeInput.value = normalizeRunDurationInput(editTimeInput.value);
  syncEditRunPaceFromInputs();
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function capitalize(text) {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function formatNumber(value) {
  return Number(value).toFixed(2).replace(/\.00$/, "");
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function deleteWorkout(workoutId) {
  workouts = workouts.filter((workout) => workout.id !== workoutId);

  if (editingWorkoutId === workoutId) {
    resetWorkoutForm();
  }

  save(STORAGE_KEY_WORKOUTS, workouts);
  render();
}

function openDeleteConfirm(workoutId) {
  pendingDeleteWorkoutId = workoutId;
  if (typeof deleteConfirmDialog.showModal === "function") {
    deleteConfirmDialog.showModal();
    return;
  }

  const shouldDelete = confirm("Delete this workout?");
  if (shouldDelete) {
    deleteWorkout(workoutId);
  }
  pendingDeleteWorkoutId = null;
}

function openEditWorkoutDialog(workoutId) {
  if (
    !editWorkoutDialog ||
    !editDateInput ||
    !editActivityInput ||
    !editNotesInput ||
    !editWorkoutStatusEl ||
    !editSprintSetsInput
  ) {
    alert("Edit popup UI is missing. Please hard refresh (Ctrl+Shift+R) after clearing cache.");
    return;
  }

  const workout = workouts.find((item) => item.id === workoutId);
  if (!workout) {
    return;
  }

  editingPopupWorkoutId = workoutId;
  editDateInput.value = workout.date || "";
  editActivityInput.value = capitalize(workout.activity || "run");
  editNotesInput.value = workout.notes || "";
  editDistanceInput.value = workout.distance ?? "";
  editTimeInput.value = formatRunDuration(workout.time) || "";
  editPaceInput.value = isNumber(workout.pace) ? formatRunPace(workout.pace) : "";
  editSprintSetsInput.value = formatSprintSetsForEditor(workout.sprintSets);
  editDraftStrengthExercises = normalizeStrengthExercises(workout.strengthExercises);
  editDraftCurrentStrengthSets = [];
  if (editExerciseNameInput) {
    editExerciseNameInput.value = "";
  }
  if (editStrengthRepsInput) {
    editStrengthRepsInput.value = "";
  }
  if (editStrengthLoadTypeInput) {
    editStrengthLoadTypeInput.value = "kg";
    editStrengthLoadTypeInput.dispatchEvent(new Event("change"));
  }
  setBandColorPickerValue(editStrengthBandColorInput, "");
  renderEditStrengthSets();
  renderEditStrengthExercises();
  toggleEditDialogFields(workout.activity);
  syncEditRunPaceFromInputs();
  editWorkoutStatusEl.textContent = "";
  if (typeof editWorkoutDialog.showModal === "function") {
    editWorkoutDialog.showModal();
  } else {
    editWorkoutDialog.setAttribute("open", "true");
  }
}

function closeEditWorkoutDialog() {
  editingPopupWorkoutId = null;
  if (!editWorkoutDialog) {
    return;
  }
  if (typeof editWorkoutDialog.close === "function") {
    editWorkoutDialog.close();
  } else {
    editWorkoutDialog.removeAttribute("open");
  }
}

function saveEditedWorkout() {
  if (!editingPopupWorkoutId) {
    return;
  }

  try {
    const existingWorkout = workouts.find((workout) => workout.id === editingPopupWorkoutId);
    if (!existingWorkout) {
      return;
    }

    const normalized = normalizeImportedWorkout({
      ...existingWorkout,
      date: editDateInput.value,
      notes: editNotesInput.value.trim(),
      distance: editDistanceInput.value,
      time: editTimeInput.value,
      pace: editPaceInput.value,
      sprintSets: parseSprintSetsFromEditor(editSprintSetsInput.value),
      strengthExercises: editDraftStrengthExercises,
    });
    if (normalized.activity === "run" && (!isNumber(normalized.distance) || !normalized.time || !isNumber(normalized.pace))) {
      editWorkoutStatusEl.textContent = "Run entries require distance in km and time in hh:mm:ss.";
      return;
    }
    normalized.id = editingPopupWorkoutId;
    const index = workouts.findIndex((workout) => workout.id === editingPopupWorkoutId);
    if (index >= 0) {
      workouts[index] = normalized;
      save(STORAGE_KEY_WORKOUTS, workouts);
      syncExerciseLibraryFromWorkouts();
      renderExerciseLibrary();
      editWorkoutStatusEl.textContent = "Workout updated.";
      render();
      closeEditWorkoutDialog();
    }
  } catch {
    editWorkoutStatusEl.textContent = "Invalid edit format. Please check your lines and try again.";
  }
}

function confirmDeleteWorkout() {
  if (pendingDeleteWorkoutId) {
    deleteWorkout(pendingDeleteWorkoutId);
  }
  pendingDeleteWorkoutId = null;
  deleteConfirmDialog.close();
}

function cancelDeleteWorkout() {
  pendingDeleteWorkoutId = null;
  deleteConfirmDialog.close();
}

function resetWorkoutForm() {
  editingWorkoutId = null;
  draftSprintSets = [];
  draftStrengthExercises = [];
  draftCurrentStrengthSets = [];
  workoutForm.reset();
  strengthSetLoadTypeInput.value = "kg";
  strengthSetWeightInput.disabled = false;
  setBandColorPickerValue(strengthSetBandColorInput, "");
  setBandColorPickerDisabled(strengthSetBandColorInput, true);
  dateInput.valueAsDate = new Date();
  renderCurrentStrengthSets();
  renderStrengthExercises();
  renderSprintSets();
  updateVisibleFields();
  syncRunPaceFromInputs();
  workoutSubmitButton.textContent = "Save Workout";
}

function updateVisibleFields() {
  const selectedActivity = valueOf("activity");

  activityFieldGroups.forEach((group) => {
    group.classList.toggle("is-hidden", group.dataset.activity !== selectedActivity);
  });

  if (selectedActivity === "run") {
    syncRunPaceFromInputs();
  }
}

function onFilterChange() {
  progressFilters = {
    activity: filterActivityInput.value || "all",
    fromDate: filterFromDateInput.value || "",
    toDate: filterToDateInput.value || "",
    strengthLoad: filterStrengthLoadInput.value || "all",
  };
  render();
}

function clearFilters() {
  filterActivityInput.value = "all";
  filterFromDateInput.value = "";
  filterToDateInput.value = "";
  filterStrengthLoadInput.value = "all";
  onFilterChange();
}

function getFilteredWorkouts() {
  return workouts.filter((workout) => {
    const activityMatch = progressFilters.activity === "all" || workout.activity === progressFilters.activity;
    const dateValue = workout.date || "";
    const fromMatch = !progressFilters.fromDate || (dateValue && dateValue >= progressFilters.fromDate);
    const toMatch = !progressFilters.toDate || (dateValue && dateValue <= progressFilters.toDate);
    const loadMatch =
      progressFilters.strengthLoad === "all" ||
      workout.activity !== "strength" ||
      normalizeStrengthExercises(workout.strengthExercises).some((exercise) =>
        exercise.sets.some((set) => set.loadType === progressFilters.strengthLoad),
      );
    return activityMatch && fromMatch && toMatch && loadMatch;
  });
}

function compareWorkoutsByRecentDate(a, b) {
  const dateComparison = (b.date || "").localeCompare(a.date || "");
  if (dateComparison !== 0) {
    return dateComparison;
  }

  return (b.createdAt || 0) - (a.createdAt || 0);
}

function renderCharts() {
  if (typeof Chart === "undefined") {
    chartsStatusEl.textContent = "Charts unavailable (Chart.js failed to load).";
    return;
  }

  const filteredWorkouts = getFilteredWorkouts().slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const strengthData = filteredWorkouts
    .filter((workout) => workout.activity === "strength")
    .map((workout) => ({ x: workout.date, y: strengthBestWeight(workout) }))
    .filter((point) => point.x && isNumber(point.y));
  const runData = filteredWorkouts
    .filter((workout) => workout.activity === "run" && isNumber(workout.pace))
    .map((workout) => ({ x: workout.date, y: workout.pace }))
    .filter((point) => point.x && isNumber(point.y));
  const sprintData = filteredWorkouts
    .filter((workout) => workout.activity === "sprint")
    .map((workout) => ({ x: workout.date, y: sprintBestTime(workout) }))
    .filter((point) => point.x && isNumber(point.y));

  const groupedStrengthData = groupChartPoints(strengthData, chartGrouping);
  const groupedRunData = groupChartPoints(runData, chartGrouping);
  const groupedSprintData = groupChartPoints(sprintData, chartGrouping);

  strengthChart = createOrUpdateChart(strengthChart, strengthChartCanvas, groupedStrengthData, "kg", "#00E5FF");
  runChart = createOrUpdateChart(runChart, runChartCanvas, groupedRunData, "min/km", "#6DFF5C");
  sprintChart = createOrUpdateChart(sprintChart, sprintChartCanvas, groupedSprintData, "sec", "#FF7A00");

  toggleChartCardVisibility(strengthChartCard, groupedStrengthData.length > 0);
  toggleChartCardVisibility(runChartCard, groupedRunData.length > 0);
  toggleChartCardVisibility(sprintChartCard, groupedSprintData.length > 0);

  const hasVisibleCharts = groupedStrengthData.length > 0 || groupedRunData.length > 0 || groupedSprintData.length > 0;
  if (chartsGridEl) {
    chartsGridEl.classList.toggle("is-hidden", !hasVisibleCharts);
  }

  if (!filteredWorkouts.length) {
    chartsStatusEl.textContent = workouts.length
      ? "No charts to show for the current filters."
      : "Charts will appear after you log your first workout.";
    return;
  }

  chartsStatusEl.textContent = hasVisibleCharts
    ? ""
    : "No chartable data is available for the current filters.";
}

function createOrUpdateChart(existingChart, canvas, points, unit, color) {
  if (!canvas) {
    return existingChart;
  }

  if (existingChart) {
    existingChart.destroy();
    existingChart = null;
  }

  if (!points.length) {
    return null;
  }

  return new Chart(canvas, {
    type: "line",
    data: {
      datasets: [
        {
          data: points,
          borderColor: color,
          backgroundColor: `${color}33`,
          tension: 0.25,
          fill: false,
          pointRadius: 3,
        },
      ],
    },
    options: {
      parsing: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { type: "category", title: { display: true, text: "Date" } },
        y: { title: { display: true, text: unit }, beginAtZero: unit !== "min/km" },
      },
    },
  });
}

function toggleChartCardVisibility(card, isVisible) {
  if (!card) {
    return;
  }

  card.classList.toggle("is-hidden", !isVisible);
}

function groupChartPoints(points, mode) {
  const grouped = new Map();
  points.forEach((point) => {
    const label = groupingLabel(point.x, mode);
    if (!label) {
      return;
    }
    const values = grouped.get(label) || [];
    values.push(point.y);
    grouped.set(label, values);
  });

  return [...grouped.entries()].map(([label, values]) => ({
    x: label,
    y: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
  }));
}

function groupingLabel(dateText, mode) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  if (mode === "quarter") {
    const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
    return `${date.getUTCFullYear()}-Q${quarter}`;
  }

  if (mode === "month") {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  if (mode === "week") {
    const firstDayOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - firstDayOfYear) / 86400000) + 1;
    const week = Math.ceil(dayOfYear / 7);
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  const fallbackWeek = Math.ceil((Math.floor((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(fallbackWeek).padStart(2, "0")}`;
}

function exportBackupData() {
  const backupPayload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    workouts,
    goals,
    plannedSessions,
    phaseTemplates,
    phaseInstances,
    uiSettings,
  };

  const fileBlob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(fileBlob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `train-with-me-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(downloadUrl);
  backupStatusEl.textContent = "Backup exported successfully.";
}

function importBackupData(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      if (!parsed || !Array.isArray(parsed.workouts) || typeof parsed.goals !== "object") {
        backupStatusEl.textContent = "Invalid backup file format.";
        return;
      }

      workouts = parsed.workouts.map((workout) => normalizeImportedWorkout(workout));
      syncExerciseLibraryFromWorkouts();
      renderExerciseLibrary();

      goals = {
        strength: toNumberOrNull(parsed.goals.strength),
        run: toNumberOrNull(parsed.goals.run),
        runPace: parseGoalPaceInput(parsed.goals.runPace) ?? toNumberOrNull(parsed.goals.runPace),
        sprint: toNumberOrNull(parsed.goals.sprint),
      };
      plannedSessions = Array.isArray(parsed.plannedSessions)
        ? parsed.plannedSessions.map((session) => normalizePlannedSession(session))
        : [];
      phaseTemplates = Array.isArray(parsed.phaseTemplates)
        ? parsed.phaseTemplates.map((template) => normalizePhaseTemplate(template))
        : [];
      phaseInstances = Array.isArray(parsed.phaseInstances)
        ? parsed.phaseInstances.map((instance) => normalizePhaseInstance(instance))
        : [];
      uiSettings = {
        currentView: typeof parsed.uiSettings?.currentView === "string" ? parsed.uiSettings.currentView : "calendar",
        coachMode: Boolean(parsed.uiSettings?.coachMode),
        currentWeekStart: normalizeDateInput(parsed.uiSettings?.currentWeekStart) || formatDateInput(startOfWeek(new Date())),
      };
      refreshDetectedSessionStatuses({ persist: false });

      save(STORAGE_KEY_WORKOUTS, workouts);
      save(STORAGE_KEY_GOALS, goals);
      save(STORAGE_KEY_PLANNED_SESSIONS, plannedSessions);
      save(STORAGE_KEY_PHASE_TEMPLATES, phaseTemplates);
      save(STORAGE_KEY_PHASE_INSTANCES, phaseInstances);
      save(STORAGE_KEY_UI_SETTINGS, uiSettings);
      hydrateGoalInputs();
      render();
      backupStatusEl.textContent = `Imported ${workouts.length} workout(s) successfully.`;
    } catch {
      backupStatusEl.textContent = "Could not read JSON backup file.";
    } finally {
      importDataFileInput.value = "";
    }
  };

  reader.readAsText(file);
}

async function installPwaApp() {
  if (!deferredInstallPrompt) {
    workoutFormStatusEl.textContent = "Install prompt is not available on this device/browser yet.";
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installAppButton.style.display = "none";
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

function setWorkoutFormStatus(message) {
  workoutFormStatusEl.textContent = message;
}

function addSafeEventListener(element, eventName, handler) {
  if (!element) {
    return;
  }
  element.addEventListener(eventName, handler);
}

function toggleEditDialogFields(activity) {
  editRunFields.style.display = activity === "run" ? "grid" : "none";
  editSprintFields.style.display = activity === "sprint" ? "grid" : "none";
  editStrengthFields.style.display = activity === "strength" ? "block" : "none";
}

function formatSprintSetsForEditor(sprintSets) {
  const normalized = normalizeSprintSets(sprintSets);
  return normalized.map((set) => `${set.time},${set.distance}`).join("\n");
}

function parseSprintSetsFromEditor(text) {
  if (!text.trim()) {
    return [];
  }

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [timeValue, distanceValue] = line.split(",").map((value) => Number(value.trim()));
      if (!Number.isFinite(timeValue) || !Number.isFinite(distanceValue)) {
        throw new Error("Invalid sprint line");
      }
      return { time: timeValue, distance: distanceValue };
    });
}

function addEditStrengthSet() {
  const reps = toNumberOrNull(editStrengthRepsInput?.value);
  const loadType = editStrengthLoadTypeInput?.value || "kg";
  const weight = toNumberOrNull(editStrengthWeightInput?.value);
  const bandColor = editStrengthBandColorInput?.value || "";

  if (!isNumber(reps)) {
    editWorkoutStatusEl.textContent = "Edit set reps are required.";
    return;
  }
  if (loadType === "kg" && !isNumber(weight)) {
    editWorkoutStatusEl.textContent = "Edit set kg weight is required.";
    return;
  }
  if (loadType === "band" && !bandColor) {
    editWorkoutStatusEl.textContent = "Choose a band color for band sets.";
    return;
  }

  editDraftCurrentStrengthSets.push({
    reps,
    loadType,
    weight: loadType === "kg" ? weight : null,
    bandColor: loadType === "band" ? bandColor : "",
  });
  editStrengthRepsInput.value = "";
  editStrengthWeightInput.value = "";
  setBandColorPickerValue(editStrengthBandColorInput, "");
  renderEditStrengthSets();
}

function addEditStrengthExercise() {
  const name = editExerciseNameInput?.value?.trim();
  if (!name || !editDraftCurrentStrengthSets.length) {
    editWorkoutStatusEl.textContent = "Add exercise name and at least one set.";
    return;
  }

  editDraftStrengthExercises.push({
    name,
    sets: editDraftCurrentStrengthSets.map((set, index) => ({ ...set, order: index + 1 })),
  });
  rememberExerciseName(name);
  editDraftCurrentStrengthSets = [];
  editExerciseNameInput.value = "";
  renderEditStrengthSets();
  renderEditStrengthExercises();
}

function renderEditStrengthSets() {
  if (!editCurrentStrengthSetsList) {
    return;
  }
  if (!editDraftCurrentStrengthSets.length) {
    editCurrentStrengthSetsList.innerHTML = "<li>No edit sets added yet.</li>";
    return;
  }
  editCurrentStrengthSetsList.innerHTML = editDraftCurrentStrengthSets
    .map((set, index) => `<li>Set #${index + 1}: ${set.reps} reps @ ${formatStrengthLoad(set)}</li>`)
    .join("");
}

function renderEditStrengthExercises() {
  if (!editStrengthExercisesList) {
    return;
  }
  if (!editDraftStrengthExercises.length) {
    editStrengthExercisesList.innerHTML = "<li>No edit exercises added yet.</li>";
    return;
  }
  editStrengthExercisesList.innerHTML = editDraftStrengthExercises
    .map((exercise, exerciseIndex) => {
      const sets = exercise.sets
        .map(
          (set, setIndex) => `
            <div class="inline-set-row">
              <input type="number" min="0" data-role="set-reps" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}" value="${set.reps}" />
              <select data-role="set-load-type" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}">
                <option value="kg" ${set.loadType === "kg" ? "selected" : ""}>kg</option>
                <option value="bodyweight" ${set.loadType === "bodyweight" ? "selected" : ""}>body weight</option>
                <option value="band" ${set.loadType === "band" ? "selected" : ""}>band</option>
              </select>
              <input type="number" min="0" step="0.1" data-role="set-weight" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}" value="${
                set.weight ?? ""
              }" ${set.loadType !== "kg" ? "disabled" : ""} />
              <div class="band-color-picker inline-band-color-picker${set.loadType !== "band" ? " is-disabled" : ""}">
                ${renderBandColorDots(set.bandColor || "", {
                  role: "set-band-color-option",
                  exerciseIndex,
                  setIndex,
                  disabled: set.loadType !== "band",
                })}
              </div>
              <button type="button" class="danger-button" data-role="delete-set" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}">Delete Set</button>
            </div>
          `,
        )
        .join("");
      return `<li>
        <div class="inline-exercise-row">
          <input type="text" data-role="exercise-name" data-exercise-index="${exerciseIndex}" value="${escapeHtml(exercise.name)}" />
          <button type="button" class="danger-button" data-role="delete-exercise" data-exercise-index="${exerciseIndex}">Delete Exercise</button>
        </div>
        ${sets}
      </li>`;
    })
    .join("");
}

function handleInlineStrengthEdit(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const exerciseIndex = Number(target.dataset.exerciseIndex);
  const setIndex = Number(target.dataset.setIndex);
  const role = target.dataset.role;
  if (!Number.isInteger(exerciseIndex) || !role) {
    return;
  }

  const exercise = editDraftStrengthExercises[exerciseIndex];
  if (!exercise) {
    return;
  }

  if (role === "exercise-name") {
    exercise.name = target.value.trim();
    return;
  }

  if (!Number.isInteger(setIndex)) {
    return;
  }

  const set = exercise.sets[setIndex];
  if (!set) {
    return;
  }

  if (role === "set-reps") {
    const reps = Number(target.value);
    if (Number.isFinite(reps)) {
      set.reps = reps;
    }
  }

  if (role === "set-load-type") {
    set.loadType = target.value;
    if (set.loadType !== "kg") {
      set.weight = null;
    }
    if (set.loadType !== "band") {
      set.bandColor = "";
    }
    renderEditStrengthExercises();
  }

  if (role === "set-weight") {
    const weight = Number(target.value);
    set.weight = Number.isFinite(weight) ? weight : null;
  }

}

function handleInlineStrengthDelete(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const role = target.dataset.role;
  if (!role) {
    return;
  }

  const exerciseIndex = Number(target.dataset.exerciseIndex);
  const setIndex = Number(target.dataset.setIndex);
  if (!Number.isInteger(exerciseIndex)) {
    return;
  }

  if (role === "set-band-color-option" && Number.isInteger(setIndex)) {
    const exercise = editDraftStrengthExercises[exerciseIndex];
    const set = exercise?.sets[setIndex];
    if (!set || set.loadType !== "band") {
      return;
    }
    set.bandColor = target.dataset.bandColor || "";
    renderEditStrengthExercises();
    return;
  }

  if (role === "delete-exercise") {
    editDraftStrengthExercises.splice(exerciseIndex, 1);
    renderEditStrengthExercises();
    return;
  }

  if (role === "delete-set" && Number.isInteger(setIndex)) {
    const exercise = editDraftStrengthExercises[exerciseIndex];
    if (!exercise) {
      return;
    }
    exercise.sets.splice(setIndex, 1);
    if (!exercise.sets.length) {
      editDraftStrengthExercises.splice(exerciseIndex, 1);
    }
    renderEditStrengthExercises();
  }
}

function renderSprintSets() {
  if (!draftSprintSets.length) {
    sprintSetsList.innerHTML = "<li>No sprint sets yet.</li>";
    return;
  }

  sprintSetsList.innerHTML = draftSprintSets
    .map((set) => `<li>#${set.order}: ${formatNumber(set.time)} sec • ${formatNumber(set.distance)} m</li>`)
    .join("");
}

function normalizeSprintSets(sprintSets) {
  if (!Array.isArray(sprintSets)) {
    return [];
  }

  return sprintSets
    .filter((set) => isNumber(set?.time) && isNumber(set?.distance))
    .map((set, index) => ({
      order: index + 1,
      time: Number(set.time),
      distance: Number(set.distance),
    }));
}

function formatSprintFeeling(value) {
  const option = SPRINT_FEELING_OPTIONS.find((item) => item.value === value);
  return option ? option.label : "";
}

function sprintBestTime(workout) {
  const sprintSets = normalizeSprintSets(workout.sprintSets);
  if (sprintSets.length) {
    return sprintSets.reduce((min, set) => Math.min(min, set.time), Infinity);
  }

  return isNumber(workout.time) ? workout.time : null;
}

function normalizeStrengthExercises(exercises) {
  if (!Array.isArray(exercises)) {
    return [];
  }

  return exercises
    .filter((exercise) => typeof exercise?.name === "string" && exercise.name.trim() && Array.isArray(exercise.sets))
    .map((exercise) => ({
      name: exercise.name.trim(),
      sets: exercise.sets
        .filter((set) => isNumber(set?.reps))
        .map((set, index) => ({
          order: index + 1,
          reps: Number(set.reps),
          weight: set.loadType === "kg" && isNumber(set.weight) ? Number(set.weight) : null,
          loadType: set.loadType === "band" || set.loadType === "bodyweight" ? set.loadType : "kg",
          bandColor: typeof set.bandColor === "string" ? set.bandColor : "",
        })),
    }))
    .filter((exercise) => exercise.sets.length > 0);
}

function normalizeImportedWorkout(workout) {
  const activity = workout.activity || "run";
  const normalizedDistance = toNumberOrNull(workout.distance);
  const normalizedTime =
    activity === "run"
      ? typeof workout.time === "string"
        ? normalizeRunDurationInput(workout.time)
        : legacyRunMinutesToDuration(toNumberOrNull(workout.time))
      : toNumberOrNull(workout.time);
  const normalizedPace =
    activity === "run"
      ? calculateRunPace(normalizedDistance, parseRunDurationToSeconds(normalizedTime))
      : toNumberOrNull(workout.pace);

  return {
    id: workout.id || crypto.randomUUID(),
    date: workout.date || "",
    activity,
    strengthExercises: normalizeStrengthExercises(workout.strengthExercises),
    distance: normalizedDistance,
    time: normalizedTime,
    pace: normalizedPace,
    sprintSets: normalizeSprintSets(workout.sprintSets),
    sprintFeeling: typeof workout.sprintFeeling === "string" ? workout.sprintFeeling : "",
    notes: typeof workout.notes === "string" ? workout.notes : "",
    createdAt: isNumber(workout.createdAt) ? workout.createdAt : Date.now(),
  };
}

function renderCurrentStrengthSets() {
  if (!draftCurrentStrengthSets.length) {
    currentStrengthSetsList.innerHTML = "<li>No sets added yet.</li>";
    return;
  }

  currentStrengthSetsList.innerHTML = draftCurrentStrengthSets
    .map(
      (set, index) =>
        `<li>Set #${index + 1}: ${set.reps} reps @ ${formatStrengthLoad(set)}</li>`,
    )
    .join("");
}

function renderStrengthExercises() {
  if (!draftStrengthExercises.length) {
    strengthExerciseList.innerHTML = "<li>No strength exercises yet.</li>";
    return;
  }

  strengthExerciseList.innerHTML = draftStrengthExercises
    .map((exercise, exerciseIndex) => {
      const setSummary = exercise.sets
        .map((set) => `#${set.order}: ${set.reps} reps @ ${formatStrengthLoad(set)}`)
        .join(", ");
      return `<li>${exerciseIndex + 1}. ${escapeHtml(exercise.name)} — ${setSummary}</li>`;
    })
    .join("");
}

function formatStrengthLoad(set) {
  if (set.loadType === "bodyweight") {
    return "body weight";
  }
  if (set.loadType === "band") {
    return set.bandColor ? `band (${set.bandColor})` : "band";
  }
  return isNumber(set.weight) ? `${formatNumber(set.weight)} kg` : "kg";
}

function rememberExerciseName(name) {
  const normalized = name?.trim();
  if (!normalized) {
    return;
  }
  if (!exerciseLibrary.includes(normalized)) {
    exerciseLibrary.push(normalized);
    exerciseLibrary.sort((a, b) => a.localeCompare(b));
    save(STORAGE_KEY_EXERCISES, exerciseLibrary);
    renderExerciseLibrary();
  }
}

function syncExerciseLibraryFromWorkouts() {
  const namesFromWorkouts = workouts
    .flatMap((workout) => normalizeStrengthExercises(workout.strengthExercises).map((exercise) => exercise.name))
    .filter(Boolean);
  exerciseLibrary = [...new Set([...exerciseLibrary, ...namesFromWorkouts])].sort((a, b) => a.localeCompare(b));
  save(STORAGE_KEY_EXERCISES, exerciseLibrary);
}

function renderExerciseLibrary() {
  if (exerciseSuggestionsEl) {
    exerciseSuggestionsEl.innerHTML = exerciseLibrary.map((name) => `<option value="${escapeHtml(name)}"></option>`).join("");
  }

  if (!exerciseLibraryListEl) {
    return;
  }

  if (!exerciseLibrary.length) {
    exerciseLibraryListEl.innerHTML = "<li>No saved exercises yet.</li>";
    return;
  }

  exerciseLibraryListEl.innerHTML = exerciseLibrary
    .map(
      (name) =>
        `<li><strong>${escapeHtml(name)}</strong> <button type="button" class="ghost-button danger-button" data-role="delete-exercise-library" data-name="${escapeHtml(name)}">Delete</button></li>`,
    )
    .join("");
}

function handleExerciseLibraryClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (target.dataset.role !== "delete-exercise-library") {
    return;
  }
  const name = target.dataset.name;
  if (!name) {
    return;
  }
  exerciseLibrary = exerciseLibrary.filter((item) => item !== name);
  save(STORAGE_KEY_EXERCISES, exerciseLibrary);
  renderExerciseLibrary();
}

function strengthBestWeight(workout) {
  const exercises = normalizeStrengthExercises(workout.strengthExercises);
  if (exercises.length) {
    const weightedSets = exercises.flatMap((exercise) => exercise.sets.map((set) => set.weight)).filter(isNumber);
    if (weightedSets.length) {
      return Math.max(...weightedSets);
    }
  }

  return null;
}

function initializeV2() {
  setCoachMode(uiSettings.coachMode);
  bindV2Events();
  plannedSessionDateInput.value = formatDateInput(new Date());
  updatePlannedTypeFields();
  render();
}

function bindV2Events() {
  viewNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCurrentView(button.dataset.viewTarget || "calendar");
    });
  });

  addSafeEventListener(coachModeToggle, "change", () => {
    setCoachMode(Boolean(coachModeToggle.checked));
  });
  addSafeEventListener(prevWeekButton, "click", () => shiftCurrentWeek(-7));
  addSafeEventListener(nextWeekButton, "click", () => shiftCurrentWeek(7));
  addSafeEventListener(currentWeekButton, "click", () => {
    uiSettings.currentWeekStart = formatDateInput(startOfWeek(new Date()));
    savePlannerCollections();
    render();
  });
  addSafeEventListener(plannedSessionTypeInput, "change", updatePlannedTypeFields);
  addSafeEventListener(plannedSessionForm, "submit", savePlannedSessionFromForm);
  addSafeEventListener(cancelPlannedSessionButton, "click", resetPlannedSessionForm);
  addSafeEventListener(addPlannedSprintBlockButton, "click", addPlannedSprintBlock);
  addSafeEventListener(plannedSprintBlocksListEl, "click", handlePlannedSprintBlockAction);
  addSafeEventListener(calendarGridEl, "click", handleCalendarAction);
  addSafeEventListener(calendarSessionDetailEl, "click", handleCalendarAction);
  addSafeEventListener(calendarSessionDialog, "click", handleCalendarSessionDialogClick);
  addSafeEventListener(calendarSessionDialog, "close", () => {
    if (selectedCalendarSessionId) {
      selectedCalendarSessionId = "";
      renderCalendar();
    }
  });
  addSafeEventListener(phaseImportFileInput, "change", loadPhaseImportFile);
  addSafeEventListener(phaseImportForm, "submit", importStrengthPhase);
  addSafeEventListener(cancelPhaseEditButton, "click", resetPhaseImportForm);
  addSafeEventListener(phaseTemplateListEl, "click", handlePhaseTemplateAction);
  addSafeEventListener(phaseInstanceListEl, "click", handlePhaseInstanceAction);
  addSafeEventListener(completionRunTimeInput, "input", syncCompletionRunPace);
  addSafeEventListener(completionRunTimeInput, "change", normalizeCompletionRunTimeField);
  addSafeEventListener(completionRunDistanceInput, "input", syncCompletionRunPace);
  addSafeEventListener(completionSprintBlocksEl, "input", handleCompletionSprintInput);
  addSafeEventListener(completionStrengthBlocksEl, "click", handleCompletionStrengthAction);
  addSafeEventListener(completionStrengthBlocksEl, "input", handleCompletionStrengthInput);
  addSafeEventListener(completionStrengthBlocksEl, "change", handleCompletionStrengthInput);
  addSafeEventListener(completionForm, "submit", saveCompletedSession);
  addSafeEventListener(cancelCompletionButton, "click", closeCompletionDialog);
  addSafeEventListener(plannedRunEditForm, "submit", savePlannedRunEdit);
  addSafeEventListener(cancelPlannedRunEditButton, "click", closePlannedRunEditDialog);
  addSafeEventListener(plannedRunEditDialog, "click", (event) => {
    if (event.target === plannedRunEditDialog) {
      closePlannedRunEditDialog();
    }
  });
  addSafeEventListener(strengthSessionMoveForm, "submit", saveStrengthSessionMove);
  addSafeEventListener(cancelStrengthSessionMoveButton, "click", closeStrengthSessionMoveDialog);
  addSafeEventListener(strengthSessionMoveDialog, "click", (event) => {
    if (event.target === strengthSessionMoveDialog) {
      closeStrengthSessionMoveDialog();
    }
  });
}

function savePlannerCollections() {
  save(STORAGE_KEY_PLANNED_SESSIONS, plannedSessions);
  save(STORAGE_KEY_PHASE_TEMPLATES, phaseTemplates);
  save(STORAGE_KEY_PHASE_INSTANCES, phaseInstances);
  save(STORAGE_KEY_UI_SETTINGS, uiSettings);
}

function setCurrentView(view) {
  uiSettings.currentView = ["calendar", "phases", "review", "stats", "data"].includes(view) ? view : "calendar";
  savePlannerCollections();
  syncViewState();
}

function setCoachMode(enabled) {
  uiSettings.coachMode = enabled;
  document.body.classList.toggle("coach-mode", enabled);
  if (coachModeToggle) {
    coachModeToggle.checked = enabled;
  }
  savePlannerCollections();
}

function syncViewState() {
  viewPanels.forEach((panel) => {
    panel.classList.toggle("is-hidden", panel.dataset.view !== uiSettings.currentView);
  });
  viewNavButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewTarget === uiSettings.currentView);
  });
}

function startOfWeek(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(dateInputValue, days) {
  const date = new Date(dateInputValue);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDateInput(value) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function normalizeDateInput(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }
  return value;
}

function shiftCurrentWeek(days) {
  uiSettings.currentWeekStart = formatDateInput(addDays(uiSettings.currentWeekStart, days));
  savePlannerCollections();
  render();
}

function getWeekDates(weekStart) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

function getPlannedSessionsForWeek(weekStart) {
  const days = getWeekDates(weekStart).map((date) => formatDateInput(date));
  return plannedSessions
    .filter((session) => days.includes(session.date))
    .sort((a, b) => (a.date === b.date ? (a.title || "").localeCompare(b.title || "") : a.date.localeCompare(b.date)));
}

function computeWeeklyAdherence(weekStart) {
  const sessions = getPlannedSessionsForWeek(weekStart);
  const completed = sessions.filter((session) => ["completed", "modified"].includes(session.status)).length;
  const modified = sessions.filter((session) => session.status === "modified").length;
  const missed = sessions.filter((session) => session.status === "missed").length;
  return {
    total: sessions.length,
    completed,
    modified,
    missed,
    planned: sessions.filter((session) => session.status === "planned").length,
  };
}

function renderPlannerSummary() {
  if (!plannerSummaryEl) {
    return;
  }
  const stats = computeWeeklyAdherence(uiSettings.currentWeekStart);
  plannerSummaryEl.innerHTML = `
    <article class="badge">
      <span class="label">This Week</span>
      <span class="value">${stats.completed}/${stats.total || 0}</span>
    </article>
    <article class="badge">
      <span class="label">Modified</span>
      <span class="value">${stats.modified}</span>
    </article>
    <article class="badge">
      <span class="label">Missed</span>
      <span class="value">${stats.missed}</span>
    </article>
  `;
}

function renderCalendar() {
  if (!calendarGridEl || !calendarWeekLabelEl) {
    return;
  }
  const weekDates = getWeekDates(uiSettings.currentWeekStart);
  const weekSessions = getPlannedSessionsForWeek(uiSettings.currentWeekStart);
  const availableSessionIds = new Set(weekSessions.map((session) => session.id));
  if (!selectedCalendarSessionId || !availableSessionIds.has(selectedCalendarSessionId)) {
    selectedCalendarSessionId = weekSessions[0]?.id || "";
  }
  calendarWeekLabelEl.textContent = `Week of ${formatHumanDate(weekDates[0])} to ${formatHumanDate(weekDates[6])}`;

  calendarGridEl.innerHTML = weekDates
    .map((date) => {
      const dayKey = formatDateInput(date);
      const daySessions = weekSessions.filter((session) => session.date === dayKey);
      const isToday = dayKey === formatDateInput(new Date());
      const sessionsMarkup = daySessions.length
        ? daySessions.map((session) => renderPlannedSessionCard(session)).join("")
        : `<p class="planner-empty">No planned sessions.</p>`;
      return `
        <article class="calendar-day${isToday ? " is-today" : ""}">
          <div class="calendar-day-header">
            <h4>${date.toLocaleDateString(undefined, { weekday: "short" })}</h4>
            <span class="calendar-day-date">${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          </div>
          ${sessionsMarkup}
        </article>
      `;
    })
    .join("");
}

function renderPlannedSessionCard(session) {
  const primaryMeta = session.type === "strength"
    ? formatStrengthSessionTotalDuration(session)
    : `${capitalize(session.type)} • ${formatPlannedSessionSummary(session)}`;
  return `
    <article class="planned-session-card${session.id === selectedCalendarSessionId ? " is-selected" : ""}">
      <div class="planned-session-title">${escapeHtml(session.title)}</div>
      <div class="planned-session-time">${escapeHtml(primaryMeta)}</div>
      <div class="planned-session-footer">
        <span class="planned-session-status-inline status-${session.status}">${escapeHtml(session.status)}</span>
      </div>
      <button type="button" class="ghost-button planned-session-button" data-role="select-planned-session" data-id="${session.id}">View training</button>
    </article>
  `;
}

function renderCalendarSessionDetail() {
  if (!calendarSessionDetailEl) {
    return;
  }
  const session = plannedSessions.find((item) => item.id === selectedCalendarSessionId);
  if (!session) {
    calendarSessionDetailEl.innerHTML = "";
    if (calendarSessionDialog?.open) {
      closeCalendarSessionDialog();
    }
    return;
  }

  const headerMeta = [formatHumanDate(session.date), capitalize(session.type)];
  if (session.type === "strength") {
    headerMeta.push(formatStrengthSessionTotalDuration(session));
  }

  calendarSessionDetailEl.innerHTML = `
    <article class="card session-detail-card session-detail-modal-card">
      <header class="session-detail-modal-header">
        <div>
          <p class="hint">Training view</p>
          <h3>${escapeHtml(session.title)}</h3>
          <div class="session-meta">${escapeHtml(headerMeta.join(" • "))}</div>
        </div>
        <div class="session-detail-modal-controls">
          <span class="session-status status-${session.status}">${escapeHtml(session.status)}</span>
          <button type="button" class="ghost-button" data-role="close-calendar-session-dialog">Close</button>
        </div>
      </header>
      ${session.source === "phase-generated" ? `<div class="session-meta">From phase template</div>` : ""}
      ${session.notes ? `<div class="session-meta">${escapeHtml(session.notes)}</div>` : ""}
      <div class="session-detail-body">
        ${renderSessionStructure(session, "planned")}
        ${
          session.status !== "planned" && session.actual
            ? `<div class="session-detail-split">${renderSessionStructure(session, "actual")}</div>`
            : ""
        }
      </div>
      <div class="session-actions">
        <button type="button" class="ghost-button" data-role="edit-planned-session" data-id="${session.id}">Edit</button>
        ${isMovableGeneratedStrengthSession(session) ? `<button type="button" class="ghost-button" data-role="move-strength-session" data-id="${session.id}">Move</button>` : ""}
        ${
          session.status === "planned"
            ? `<button type="button" data-role="complete-planned-session" data-id="${session.id}">Log &amp; Complete</button>
               <button type="button" class="ghost-button danger-button" data-role="miss-planned-session" data-id="${session.id}">Miss</button>`
            : `<button type="button" class="ghost-button" data-role="reset-planned-session" data-id="${session.id}">Reset</button>`
        }
        <button type="button" class="ghost-button danger-button" data-role="delete-planned-session" data-id="${session.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderSessionStructure(session, mode) {
  if (session.type === "run") {
    const heading = mode === "planned" ? "Planned" : "Actual";
    const value =
      mode === "planned"
        ? formatPlannedSessionSummary(session)
        : `${formatNumber(session.actual?.distance || 0)} km • ${session.actual?.time || ""} • ${formatRunPace(session.actual?.pace || 0)} min/km`;
    return `<section class="session-structure"><h4>${heading}</h4><pre>${escapeHtml(value)}</pre></section>`;
  }
  if (session.type === "sprint") {
    const heading = mode === "planned" ? "Planned" : "Actual";
    const rows =
      mode === "planned"
        ? (session.details?.blocks || []).map((block) => formatPlannedSprintBlock(block))
        : (session.actual?.sprintSets || []).map((set) => `${formatNumber(set.distance)}m in ${formatNumber(set.time)}s`);
    const feeling = mode === "actual" ? formatSprintFeeling(session.actual?.feeling) : "";
    return `<section class="session-structure"><h4>${heading}</h4><ul>${rows.map((row) => `<li>${escapeHtml(row)}</li>`).join("")}</ul>${feeling ? `<div class="review-meta">Feeling: ${escapeHtml(feeling)}</div>` : ""}</section>`;
  }
  return renderStrengthStructure(mode === "planned" ? session.details?.blocks || [] : session.actual?.blocks || [], {
    mode,
    title: mode === "planned" ? "Planned" : "Actual",
    notes: mode === "planned" ? session.notes : "",
  });
}

function renderStrengthStructure(blocks, options = {}) {
  const { mode = "planned", title = "", notes = "" } = options;
  return `
    <section class="session-structure">
      ${title ? `<h4>${escapeHtml(title)}</h4>` : ""}
      ${notes ? `<div class="review-meta">Notes: ${escapeHtml(notes)}</div>` : ""}
      ${
        blocks.length
          ? blocks
              .map((block, blockIndex) => renderStrengthBlockCard(block, blockIndex, mode))
              .join("")
          : `<p class="planner-empty">No strength detail.</p>`
      }
    </section>
  `;
}

function renderStrengthBlockCard(block, blockIndex, mode) {
  const meta =
    mode === "planned"
      ? [formatBlockDuration(block), formatBlockRest(block) ? `${formatBlockRest(block)} rest` : "", block.sets ? `${escapeHtml(String(block.sets))} sets` : ""]
      : [block.actualSets || block.plannedSets ? `${escapeHtml(String(block.actualSets || block.plannedSets))} sets` : "", block.note ? `Note: ${escapeHtml(block.note)}` : ""];
  const exercises = mode === "planned" ? block.exercises || [] : block.exercises || [];
  return `
    <article class="strength-block-card">
      <div class="strength-block-header">
        <h5>${escapeHtml(block.label || `Block ${blockIndex + 1}`)}</h5>
        <div class="phase-meta">${meta.filter(Boolean).join(" • ")}</div>
      </div>
      <div class="strength-exercise-list">
        ${exercises.length ? exercises.map((exercise) => renderStrengthExerciseRow(exercise, mode)).join("") : `<p class="planner-empty">No exercises.</p>`}
      </div>
    </article>
  `;
}

function renderStrengthExerciseRow(exercise, mode) {
  const code = exercise.code ? `<span class="exercise-code">${escapeHtml(exercise.code)}</span>` : "";
  const name = `<strong class="exercise-highlight">${escapeHtml(exercise.name || "Exercise")}</strong>`;
  if (mode === "planned") {
    const detail = [
      escapeHtml(exercise.reps || "-"),
      isNumber(exercise.weight) ? `@ ${escapeHtml(formatNumber(exercise.weight))} kg` : "",
      exercise.notes ? escapeHtml(exercise.notes) : "",
    ]
      .filter(Boolean)
      .join(" • ");
    return `<div class="strength-exercise-row">${code}${name}<span class="strength-exercise-detail">${detail}</span></div>`;
  }
  const setRows = (exercise.actualSets || [])
    .map((set) => `<div class="strength-set-row">Set ${escapeHtml(String(set.order || 0))}: ${escapeHtml(formatNumber(set.reps))} reps @ ${escapeHtml(formatStrengthLoad(set))}</div>`)
    .join("");
  return `
    <div class="strength-exercise-row${exercise.completed ? "" : " is-skipped"}">
      ${code}${name}
      <div class="strength-exercise-detail">${exercise.completed ? setRows || "Completed" : "Skipped"}${exercise.actualNote ? `<div class="phase-meta">${escapeHtml(exercise.actualNote)}</div>` : ""}</div>
    </div>
  `;
}

function formatPlannedSessionSummary(session) {
  if (session.type === "run") {
    const parts = [];
    if (isNumber(session.details?.distance)) {
      parts.push(`${formatNumber(session.details.distance)} km`);
    }
    if (isNumber(session.details?.paceGoal)) {
      parts.push(`${formatGoalPace(session.details.paceGoal)} target`);
    }
    return parts.join(" • ") || "planned run";
  }

  if (session.type === "sprint") {
    const blocks = session.details?.blocks || [];
    return blocks.map((block) => formatPlannedSprintBlock(block)).join(", ") || "planned sprint session";
  }

  const blocks = session.details?.blocks || [];
  const exerciseCount = blocks.flatMap((block) => block.exercises || []).length;
  const durationSummary = blocks.map((block) => formatBlockDuration(block)).filter(Boolean).join(", ");
  return [durationSummary, `${blocks.length} blocks • ${exerciseCount} exercises`].filter(Boolean).join(" • ");
}

function formatStrengthSessionTotalDuration(session) {
  const total = getStrengthSessionTotalDuration(session);
  if (!total) {
    return "Time not set";
  }

  const roundedMin = Math.ceil(total.minMinutes);
  const roundedMax = Math.ceil(total.maxMinutes);
  if (roundedMin === roundedMax) {
    return `${formatNumber(roundedMin)} mins`;
  }
  return `${formatNumber(roundedMin)}-${formatNumber(roundedMax)} mins`;
}

function getStrengthSessionTotalDuration(session) {
  if (session.type !== "strength") {
    return null;
  }

  const warmUp = parseWarmUpDuration(session.notes);
  let minMinutes = warmUp.minMinutes;
  let maxMinutes = warmUp.maxMinutes;
  let hasDuration = warmUp.hasDuration;

  (session.details?.blocks || []).forEach((block) => {
    const blockDuration = getStrengthBlockTotalDuration(block);
    minMinutes += blockDuration.minMinutes;
    maxMinutes += blockDuration.maxMinutes;
    hasDuration = hasDuration || blockDuration.hasDuration;
  });

  if (!hasDuration) {
    return null;
  }

  return { minMinutes, maxMinutes };
}

function parseWarmUpDuration(notes) {
  const match = String(notes || "").match(/(?:^|\n)\s*Warm Up:\s*([^\n]+)/i);
  if (!match) {
    return { minMinutes: 0, maxMinutes: 0, hasDuration: false };
  }

  const duration = parseBlockDurationRange(match[1]);
  const minMinutes = isNumber(duration.durationMin) ? Number(duration.durationMin) : isNumber(duration.durationMax) ? Number(duration.durationMax) : 0;
  const maxMinutes = isNumber(duration.durationMax) ? Number(duration.durationMax) : minMinutes;
  return {
    minMinutes,
    maxMinutes,
    hasDuration: minMinutes > 0 || maxMinutes > 0,
  };
}

function getStrengthBlockTotalDuration(block) {
  const durationBounds = getBlockDurationBounds(block);
  const setBounds = getSetPrescriptionBounds(block?.sets);
  const restBounds = getBlockRestBounds(block);
  const minRestCount = Math.max(setBounds.minSets - 1, 0);
  const maxRestCount = Math.max(setBounds.maxSets - 1, 0);
  return {
    minMinutes: durationBounds.minMinutes + (minRestCount * restBounds.minSeconds) / 60,
    maxMinutes: durationBounds.maxMinutes + (maxRestCount * restBounds.maxSeconds) / 60,
    hasDuration: durationBounds.hasDuration || restBounds.hasDuration,
  };
}

function getBlockDurationBounds(block) {
  const min = toNumberOrNull(block?.durationMin);
  const max = toNumberOrNull(block?.durationMax);
  const minMinutes = isNumber(min) ? Number(min) : isNumber(max) ? Number(max) : 0;
  const maxMinutes = isNumber(max) ? Number(max) : minMinutes;
  return {
    minMinutes,
    maxMinutes,
    hasDuration: isNumber(min) || isNumber(max),
  };
}

function getBlockRestBounds(block) {
  const min = toNumberOrNull(block?.restSec);
  const max = toNumberOrNull(block?.restMaxSec);
  const minSeconds = isNumber(min) ? Number(min) : isNumber(max) ? Number(max) : 0;
  const maxSeconds = isNumber(max) ? Number(max) : minSeconds;
  return {
    minSeconds,
    maxSeconds,
    hasDuration: isNumber(min) || isNumber(max),
  };
}

function getSetPrescriptionBounds(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return { minSets: 0, maxSets: 0 };
  }
  const match = raw.match(/^(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?$/);
  if (!match) {
    const firstNumber = raw.match(/\d+(?:\.\d+)?/);
    const parsed = firstNumber ? Number(firstNumber[0]) : 0;
    return { minSets: parsed, maxSets: parsed };
  }
  const minSets = Number(match[1]);
  const maxSets = match[2] ? Number(match[2]) : minSets;
  return { minSets, maxSets };
}

function updatePlannedTypeFields() {
  const selectedType = plannedSessionTypeInput?.value || "run";
  if (plannedRunFields) {
    plannedRunFields.classList.toggle("is-hidden", selectedType !== "run");
  }
  if (plannedSprintFields) {
    plannedSprintFields.classList.toggle("is-hidden", selectedType !== "sprint");
  }
}

function resetPlannedSessionForm() {
  if (!plannedSessionForm) {
    return;
  }
  plannedSessionForm.reset();
  draftPlannedSprintBlocks = [];
  plannedSessionIdInput.value = "";
  plannedSessionDateInput.value = formatDateInput(new Date());
  plannedSessionTypeInput.value = "run";
  updatePlannedTypeFields();
  plannedSessionStatusEl.textContent = "";
  renderPlannedSprintBlocks();
}

function savePlannedSessionFromForm(event) {
  event.preventDefault();
  const type = plannedSessionTypeInput.value;
  const session = {
    id: plannedSessionIdInput.value || crypto.randomUUID(),
    date: normalizeDateInput(plannedSessionDateInput.value),
    type,
    title: plannedSessionTitleInput.value.trim(),
    source: "manual",
    status: "planned",
    notes: plannedSessionNotesInput.value.trim(),
    details: type === "run"
      ? {
          distance: toNumberOrNull(plannedRunDistanceInput.value),
          paceGoal: parseGoalPaceInput(plannedRunPaceInput.value),
        }
      : {
          blocks: normalizePlannedSprintBlocks(draftPlannedSprintBlocks),
        },
  };

  if (!session.date || !session.title) {
    plannedSessionStatusEl.textContent = "Planned sessions need a date and title.";
    return;
  }
  if (type === "run" && !isNumber(session.details.distance)) {
    plannedSessionStatusEl.textContent = "Run plans need a distance.";
    return;
  }
  if (type === "sprint" && !session.details.blocks.length) {
    plannedSessionStatusEl.textContent = "Sprint plans need at least one block.";
    return;
  }

  const existingIndex = plannedSessions.findIndex((planned) => planned.id === session.id);
  const normalized = normalizePlannedSession(existingIndex >= 0 ? { ...plannedSessions[existingIndex], ...session } : session);
  if (existingIndex >= 0) {
    plannedSessions[existingIndex] = normalized;
  } else {
    plannedSessions.push(normalized);
  }
  savePlannerCollections();
  resetPlannedSessionForm();
  plannedSessionStatusEl.textContent = "Planned session saved.";
  render();
}

function addPlannedSprintBlock() {
  const reps = toNumberOrNull(plannedSprintRepsInput?.value);
  const distance = toNumberOrNull(plannedSprintDistanceInput?.value);
  const targetTime = toNumberOrNull(plannedSprintTargetTimeInput?.value);
  const restSec = toNumberOrNull(plannedSprintRestInput?.value);
  if (!isNumber(reps) || !isNumber(distance)) {
    plannedSessionStatusEl.textContent = "Sprint block needs reps and meters.";
    return;
  }
  draftPlannedSprintBlocks.push({
    reps: Number(reps),
    distance: Number(distance),
    targetTime: isNumber(targetTime) ? Number(targetTime) : null,
    restSec: isNumber(restSec) ? Number(restSec) : null,
  });
  if (plannedSprintRepsInput) plannedSprintRepsInput.value = "";
  if (plannedSprintDistanceInput) plannedSprintDistanceInput.value = "";
  if (plannedSprintTargetTimeInput) plannedSprintTargetTimeInput.value = "";
  if (plannedSprintRestInput) plannedSprintRestInput.value = "";
  plannedSessionStatusEl.textContent = "Sprint block added.";
  renderPlannedSprintBlocks();
}

function handlePlannedSprintBlockAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (target.dataset.role !== "delete-planned-sprint-block") {
    return;
  }
  const index = Number(target.dataset.index);
  if (!Number.isInteger(index)) {
    return;
  }
  draftPlannedSprintBlocks.splice(index, 1);
  renderPlannedSprintBlocks();
}

function renderPlannedSprintBlocks() {
  if (!plannedSprintBlocksListEl) {
    return;
  }
  if (!draftPlannedSprintBlocks.length) {
    plannedSprintBlocksListEl.innerHTML = "<li>No sprint blocks yet.</li>";
    return;
  }
  plannedSprintBlocksListEl.innerHTML = draftPlannedSprintBlocks
    .map(
      (block, index) => `
        <li>
          ${escapeHtml(formatPlannedSprintBlock(block))}
          <button type="button" class="ghost-button" data-role="delete-planned-sprint-block" data-index="${index}">Remove</button>
        </li>`,
    )
    .join("");
}

function normalizePlannedSprintBlocks(blocks) {
  if (!Array.isArray(blocks)) {
    return [];
  }
  return blocks
    .map((block) => ({
      reps: toNumberOrNull(block?.reps),
      distance: toNumberOrNull(block?.distance),
      targetTime: toNumberOrNull(block?.targetTime),
      restSec: toNumberOrNull(block?.restSec),
    }))
    .filter((block) => isNumber(block.reps) && isNumber(block.distance))
    .map((block) => ({
      reps: Number(block.reps),
      distance: Number(block.distance),
      targetTime: isNumber(block.targetTime) ? Number(block.targetTime) : null,
      restSec: isNumber(block.restSec) ? Number(block.restSec) : null,
    }));
}

function formatPlannedSprintBlock(block) {
  const referenceTime = getPlannedSprintReferenceTime(block);
  return [
    `${formatNumber(block.reps)} x ${formatNumber(block.distance)}m`,
    isNumber(block.targetTime)
      ? `@ ${formatNumber(block.targetTime)}s`
      : isNumber(referenceTime)
        ? `best ${formatNumber(referenceTime)}s`
        : "",
    isNumber(block.restSec) ? `${formatNumber(block.restSec)}s rest` : "",
  ]
    .filter(Boolean)
    .join(" • ");
}

function getPlannedSprintReferenceTime(block) {
  if (isNumber(block?.targetTime)) {
    return Number(block.targetTime);
  }
  return findBestSprintTimeForDistance(block?.distance);
}

function handleCalendarAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const role = target.dataset.role;
  if (role === "close-calendar-session-dialog") {
    closeCalendarSessionDialog();
    return;
  }
  const sessionId = target.dataset.id;
  if (!role || !sessionId) {
    return;
  }

  const session = plannedSessions.find((item) => item.id === sessionId);
  if (!session) {
    return;
  }

  if (role === "select-planned-session") {
    openCalendarSessionDialog(sessionId);
    return;
  }

  if (role === "edit-planned-session") {
    closeCalendarSessionDialog();
    if (session.type === "run") {
      openPlannedRunEditDialog(session);
    } else {
      fillPlannedSessionForm(session);
    }
  }
  if (role === "move-strength-session") {
    closeCalendarSessionDialog();
    openStrengthSessionMoveDialog(session);
    return;
  }
  if (role === "delete-planned-session") {
    closeCalendarSessionDialog();
    plannedSessions = plannedSessions.filter((item) => item.id !== sessionId);
    if (selectedCalendarSessionId === sessionId) {
      selectedCalendarSessionId = "";
    }
    savePlannerCollections();
    render();
  }
  if (role === "miss-planned-session") {
    session.status = "missed";
    session.actual = null;
    session.linkedWorkoutId = "";
    savePlannerCollections();
    render();
  }
  if (role === "reset-planned-session") {
    session.status = "planned";
    session.actual = null;
    session.linkedWorkoutId = "";
    session.modificationNote = "";
    savePlannerCollections();
    render();
  }
  if (role === "complete-planned-session") {
    closeCalendarSessionDialog();
    openCompletionDialog(session);
  }
}

function handleCalendarSessionDialogClick(event) {
  if (event.target === calendarSessionDialog) {
    closeCalendarSessionDialog();
  }
}

function openCalendarSessionDialog(sessionId) {
  selectedCalendarSessionId = sessionId;
  renderCalendar();
  renderCalendarSessionDetail();
  if (!calendarSessionDialog) {
    return;
  }
  if (typeof calendarSessionDialog.showModal === "function") {
    if (!calendarSessionDialog.open) {
      calendarSessionDialog.showModal();
    }
    return;
  }
  calendarSessionDialog.setAttribute("open", "true");
}

function closeCalendarSessionDialog() {
  if (!calendarSessionDialog) {
    return;
  }
  if (typeof calendarSessionDialog.close === "function" && calendarSessionDialog.open) {
    calendarSessionDialog.close();
  } else {
    calendarSessionDialog.removeAttribute("open");
  }
  if (selectedCalendarSessionId) {
    selectedCalendarSessionId = "";
    renderCalendar();
  }
}

function openPlannedRunEditDialog(session) {
  if (!plannedRunEditDialog || !plannedRunEditForm) {
    fillPlannedSessionForm(session);
    return;
  }
  plannedRunEditForm.reset();
  plannedRunEditIdInput.value = session.id;
  plannedRunEditDateInput.value = session.date;
  plannedRunEditTitleInput.value = session.title;
  plannedRunEditDistanceInput.value = session.details?.distance ?? "";
  plannedRunEditPaceInput.value = isNumber(session.details?.paceGoal) ? formatGoalPace(session.details.paceGoal) : "";
  plannedRunEditNotesInput.value = session.notes || "";
  plannedRunEditStatusEl.textContent = "";

  if (typeof plannedRunEditDialog.showModal === "function") {
    plannedRunEditDialog.showModal();
  } else {
    plannedRunEditDialog.setAttribute("open", "true");
  }
}

function closePlannedRunEditDialog() {
  if (!plannedRunEditDialog) {
    return;
  }
  if (typeof plannedRunEditDialog.close === "function" && plannedRunEditDialog.open) {
    plannedRunEditDialog.close();
  } else {
    plannedRunEditDialog.removeAttribute("open");
  }
}

function savePlannedRunEdit(event) {
  event.preventDefault();
  const session = plannedSessions.find((item) => item.id === plannedRunEditIdInput.value);
  if (!session || session.type !== "run") {
    plannedRunEditStatusEl.textContent = "Planned run was not found.";
    return;
  }

  const date = normalizeDateInput(plannedRunEditDateInput.value);
  const title = plannedRunEditTitleInput.value.trim();
  const distance = toNumberOrNull(plannedRunEditDistanceInput.value);
  const paceGoal = parseGoalPaceInput(plannedRunEditPaceInput.value);
  if (!date || !title || !isNumber(distance)) {
    plannedRunEditStatusEl.textContent = "Planned run needs date, title, and distance.";
    return;
  }
  if (plannedRunEditPaceInput.value.trim() && !isNumber(paceGoal)) {
    plannedRunEditStatusEl.textContent = "Target pace must use mm:ss.";
    return;
  }

  session.date = date;
  session.title = title;
  session.notes = plannedRunEditNotesInput.value.trim();
  session.details = {
    distance,
    paceGoal: isNumber(paceGoal) ? paceGoal : null,
  };
  savePlannerCollections();
  closePlannedRunEditDialog();
  render();
}

function isMovableGeneratedStrengthSession(session) {
  return session?.type === "strength" && session.source === "phase-generated" && session.status === "planned";
}

function openStrengthSessionMoveDialog(session) {
  if (!strengthSessionMoveDialog || !strengthSessionMoveForm || !isMovableGeneratedStrengthSession(session)) {
    return;
  }
  strengthSessionMoveForm.reset();
  strengthSessionMoveIdInput.value = session.id;
  strengthSessionMoveTitleEl.textContent = `${session.title} • ${formatHumanDate(session.date)}`;
  strengthSessionCurrentDateInput.value = session.date;
  strengthSessionNewDateInput.value = session.date;
  strengthSessionMoveStatusEl.textContent = "";

  if (typeof strengthSessionMoveDialog.showModal === "function") {
    strengthSessionMoveDialog.showModal();
  } else {
    strengthSessionMoveDialog.setAttribute("open", "true");
  }
}

function closeStrengthSessionMoveDialog() {
  if (!strengthSessionMoveDialog) {
    return;
  }
  if (typeof strengthSessionMoveDialog.close === "function" && strengthSessionMoveDialog.open) {
    strengthSessionMoveDialog.close();
  } else {
    strengthSessionMoveDialog.removeAttribute("open");
  }
}

function saveStrengthSessionMove(event) {
  event.preventDefault();
  const session = plannedSessions.find((item) => item.id === strengthSessionMoveIdInput.value);
  if (!isMovableGeneratedStrengthSession(session)) {
    strengthSessionMoveStatusEl.textContent = "Only planned generated strength sessions can be moved.";
    return;
  }
  const newDate = normalizeDateInput(strengthSessionNewDateInput.value);
  if (!newDate) {
    strengthSessionMoveStatusEl.textContent = "Choose a valid new date.";
    return;
  }
  ensurePhaseOccurrenceMetadata(session);
  session.generatedDate = session.generatedDate || session.date;
  session.date = newDate;
  session.dateMovedManually = session.date !== session.generatedDate;
  savePlannerCollections();
  closeStrengthSessionMoveDialog();
  render();
}

function fillPlannedSessionForm(session) {
  plannedSessionIdInput.value = session.id;
  plannedSessionDateInput.value = session.date;
  plannedSessionTypeInput.value = session.type;
  plannedSessionTitleInput.value = session.title;
  plannedSessionNotesInput.value = session.notes || "";
  if (session.type === "run") {
    draftPlannedSprintBlocks = [];
    renderPlannedSprintBlocks();
    plannedRunDistanceInput.value = session.details?.distance ?? "";
    plannedRunPaceInput.value = isNumber(session.details?.paceGoal) ? formatGoalPace(session.details.paceGoal) : "";
  } else {
    draftPlannedSprintBlocks = normalizePlannedSprintBlocks(session.details?.blocks || []);
    renderPlannedSprintBlocks();
  }
  updatePlannedTypeFields();
  setCurrentView("calendar");
}

function loadPhaseImportFile(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    phaseImportTextInput.value = String(reader.result || "");
  };
  reader.readAsText(file);
}

function serializeStrengthPhaseDefinition(template) {
  const rows = [`PHASE,${template.name},${template.durationWeeks}`];
  template.weekdaySlots.forEach((slot) => {
    rows.push(`SLOT,${weekdayName(slot.weekday)},${slot.title},${slot.notes || ""}`);
    slot.blocks.forEach((block) => {
      rows.push(
        `BLOCK,${block.label || ""},${formatBlockDurationCsvValue(block)},${formatBlockRestCsvValue(block)},${block.sets || ""}`,
      );
      (block.exercises || []).forEach((exercise) => {
        rows.push(
          `EXERCISE,${exercise.code || ""},${exercise.name || ""},${exercise.reps || ""},${exercise.notes || ""},${exercise.weight ?? ""}`,
        );
      });
    });
  });
  return rows.join("\n");
}

function formatBlockDurationCsvValue(block) {
  const min = toNumberOrNull(block?.durationMin);
  const max = toNumberOrNull(block?.durationMax);
  if (isNumber(min) && isNumber(max)) {
    return `${formatNumber(min)}-${formatNumber(max)} mins`;
  }
  if (isNumber(min)) {
    return `${formatNumber(min)} mins`;
  }
  if (isNumber(max)) {
    return `${formatNumber(max)} mins`;
  }
  return "";
}

function formatBlockRestCsvValue(block) {
  const min = toNumberOrNull(block?.restSec);
  const max = toNumberOrNull(block?.restMaxSec);
  if (isNumber(min) && isNumber(max)) {
    return `${formatNumber(min)}-${formatNumber(max)}s`;
  }
  if (isNumber(min)) {
    return `${formatNumber(min)}s`;
  }
  if (isNumber(max)) {
    return `${formatNumber(max)}s`;
  }
  return "";
}

function resetPhaseImportForm() {
  if (phaseImportForm) {
    phaseImportForm.reset();
  }
  editingPhaseTemplateId = "";
  if (phaseEditIdInput) {
    phaseEditIdInput.value = "";
  }
  if (savePhaseButton) {
    savePhaseButton.textContent = "Import strength phase";
  }
  cancelPhaseEditButton?.classList.add("is-hidden");
  if (phaseImportStatusEl) {
    phaseImportStatusEl.textContent = "";
  }
}

function startPhaseTemplateEdit(templateId) {
  const template = phaseTemplates.find((item) => item.id === templateId);
  if (!template || !phaseImportTextInput) {
    return;
  }
  editingPhaseTemplateId = template.id;
  if (phaseEditIdInput) {
    phaseEditIdInput.value = template.id;
  }
  phaseNameOverrideInput.value = template.name;
  phaseImportTextInput.value = serializeStrengthPhaseDefinition(template);
  if (savePhaseButton) {
    savePhaseButton.textContent = "Save phase changes";
  }
  cancelPhaseEditButton?.classList.remove("is-hidden");
  phaseImportStatusEl.textContent = `Editing "${template.name}". Saving will refresh already planned generated sessions from this template.`;
  phaseImportForm?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function regenerateScheduledPhaseInstances(template) {
  let refreshedInstances = 0;
  phaseInstances = phaseInstances.map((instance) => {
    if (instance.templateId !== template.id) {
      return instance;
    }
    refreshedInstances += 1;
    return regeneratePhaseInstanceFromTemplate(instance, template);
  });
  return refreshedInstances;
}

function regeneratePhaseInstanceFromTemplate(instance, template) {
  const reviewedSessions = plannedSessions.filter(
    (session) => session.phaseInstanceId === instance.id && session.source === "phase-generated" && session.status !== "planned",
  );
  const movedPlannedSessions = plannedSessions.filter(
    (session) =>
      session.phaseInstanceId === instance.id &&
      session.source === "phase-generated" &&
      session.status === "planned" &&
      session.dateMovedManually,
  );
  const movedByOccurrence = new Map(
    movedPlannedSessions
      .map((session) => ensurePhaseOccurrenceMetadata(session))
      .filter((session) => session.phaseSlotId && isNumber(session.phaseWeekIndex))
      .map((session) => [`${session.phaseSlotId}:${session.phaseWeekIndex}`, session]),
  );
  const reviewedOccurrences = new Set(
    reviewedSessions
      .map((session) => ensurePhaseOccurrenceMetadata(session))
      .filter((session) => session.phaseSlotId && isNumber(session.phaseWeekIndex))
      .map((session) => `${session.phaseSlotId}:${session.phaseWeekIndex}`),
  );
  const reviewedDates = new Set(reviewedSessions.map((session) => session.date));
  plannedSessions = plannedSessions.filter(
    (session) => !(session.phaseInstanceId === instance.id && session.source === "phase-generated" && session.status === "planned"),
  );

  const regeneratedSessions = buildPhaseSessions(template, instance.startDate, instance.id, reviewedDates, reviewedOccurrences).map((session) => {
    const movedSession = movedByOccurrence.get(`${session.phaseSlotId}:${session.phaseWeekIndex}`);
    if (!movedSession) {
      return session;
    }
    return normalizePlannedSession({
      ...session,
      id: movedSession.id,
      date: movedSession.date,
      generatedDate: session.generatedDate || session.date,
      dateMovedManually: true,
      createdAt: movedSession.createdAt,
    });
  });
  plannedSessions.push(...regeneratedSessions);

  return normalizePhaseInstance({
    ...instance,
    templateId: template.id,
    templateName: template.name,
    durationWeeks: template.durationWeeks,
    generatedSessionIds: [...reviewedSessions.map((session) => session.id), ...regeneratedSessions.map((session) => session.id)],
  });
}

function buildPhaseSessions(template, startDate, instanceId, reviewedDates = new Set(), reviewedOccurrences = new Set()) {
  const generatedSessions = [];
  const normalizedStartDate = new Date(startDate);
  normalizedStartDate.setHours(0, 0, 0, 0);
  const startWeekday = getProgramWeekday(normalizedStartDate);
  for (let weekIndex = 0; weekIndex < template.durationWeeks; weekIndex += 1) {
    const anchoredWeekStart = addDays(normalizedStartDate, weekIndex * 7);
    template.weekdaySlots.forEach((slot, slotIndex) => {
      const slotOffset = ((slot.weekday - startWeekday) + 7) % 7;
      const sessionDate = formatDateInput(addDays(anchoredWeekStart, slotOffset));
      const phaseSlotId = slot.id || `${slot.weekday}-${slotIndex}`;
      const occurrenceKey = `${phaseSlotId}:${weekIndex}`;
      if (reviewedDates.has(sessionDate) || reviewedOccurrences.has(occurrenceKey)) {
        return;
      }
      generatedSessions.push(
        normalizePlannedSession({
          id: crypto.randomUUID(),
          date: sessionDate,
          type: "strength",
          title: slot.title,
          source: "phase-generated",
          phaseTemplateId: template.id,
          phaseInstanceId: instanceId,
          phaseSlotId,
          phaseWeekIndex: weekIndex,
          generatedDate: sessionDate,
          dateMovedManually: false,
          status: "planned",
          notes: slot.notes,
          details: { blocks: slot.blocks },
        }),
      );
    });
  }
  return generatedSessions;
}

function ensurePhaseOccurrenceMetadata(session) {
  if (!session || session.type !== "strength" || session.source !== "phase-generated") {
    return session;
  }
  if (session.phaseSlotId && isNumber(session.phaseWeekIndex) && session.generatedDate) {
    return session;
  }
  const instance = phaseInstances.find((item) => item.id === session.phaseInstanceId);
  const template = phaseTemplates.find((item) => item.id === session.phaseTemplateId || item.id === instance?.templateId);
  if (!instance || !template) {
    return session;
  }
  const normalizedStartDate = new Date(instance.startDate);
  normalizedStartDate.setHours(0, 0, 0, 0);
  const startWeekday = getProgramWeekday(normalizedStartDate);
  const matchDate = normalizeDateInput(session.generatedDate) || normalizeDateInput(session.date);
  for (let weekIndex = 0; weekIndex < template.durationWeeks; weekIndex += 1) {
    const anchoredWeekStart = addDays(normalizedStartDate, weekIndex * 7);
    for (let slotIndex = 0; slotIndex < template.weekdaySlots.length; slotIndex += 1) {
      const slot = template.weekdaySlots[slotIndex];
      const slotOffset = ((slot.weekday - startWeekday) + 7) % 7;
      const generatedDate = formatDateInput(addDays(anchoredWeekStart, slotOffset));
      if (generatedDate === matchDate && slot.title === session.title) {
        session.phaseSlotId = slot.id || `${slot.weekday}-${slotIndex}`;
        session.phaseWeekIndex = weekIndex;
        session.generatedDate = generatedDate;
        return session;
      }
    }
  }
  return session;
}

function getProgramWeekday(value) {
  const date = value instanceof Date ? value : new Date(value);
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function importStrengthPhase(event) {
  event.preventDefault();
  try {
    const imported = parseStrengthPhaseDefinition(phaseImportTextInput.value, phaseNameOverrideInput.value.trim());
    const normalized = normalizePhaseTemplate(
      editingPhaseTemplateId
        ? {
            ...imported,
            id: editingPhaseTemplateId,
            importedAt: phaseTemplates.find((template) => template.id === editingPhaseTemplateId)?.importedAt || Date.now(),
          }
        : imported,
    );

    if (editingPhaseTemplateId) {
      phaseTemplates = phaseTemplates.map((template) => (template.id === editingPhaseTemplateId ? normalized : template));
      const refreshedInstances = regenerateScheduledPhaseInstances(normalized);
      savePlannerCollections();
      resetPhaseImportForm();
      phaseImportStatusEl.textContent = refreshedInstances
        ? `Updated "${normalized.name}" and refreshed ${refreshedInstances} scheduled phase ${refreshedInstances === 1 ? "instance" : "instances"}.`
        : `Updated "${normalized.name}".`;
    } else {
      phaseTemplates.unshift(normalizePhaseTemplate(imported));
      savePlannerCollections();
      resetPhaseImportForm();
      phaseImportStatusEl.textContent = `Imported phase template "${imported.name}".`;
    }
    render();
  } catch (error) {
    phaseImportStatusEl.textContent = error instanceof Error ? error.message : "Could not import phase.";
  }
}

function parseStrengthPhaseDefinition(text, overrideName) {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) {
    throw new Error("Paste or import phase content first.");
  }

  const template = {
    id: crypto.randomUUID(),
    name: overrideName || "",
    durationWeeks: 0,
    weekdaySlots: [],
    importedAt: Date.now(),
  };

  let currentSlot = null;
  let currentBlock = null;

  lines.forEach((line, index) => {
    const columns = line.split(",").map((column) => column.trim());
    const rowType = columns[0]?.toUpperCase();
    if (rowType === "PHASE") {
      template.name = overrideName || columns[1] || template.name;
      template.durationWeeks = Number(columns[2]);
      if (!template.name || !Number.isFinite(template.durationWeeks)) {
        throw new Error(`Invalid PHASE row at line ${index + 1}.`);
      }
      return;
    }
    if (rowType === "SLOT") {
      const weekday = parseWeekday(columns[1]);
      currentSlot = {
        id: crypto.randomUUID(),
        weekday,
        title: columns[2] || `Strength session ${template.weekdaySlots.length + 1}`,
        notes: columns[3] || "",
        blocks: [],
      };
      template.weekdaySlots.push(currentSlot);
      currentBlock = null;
      return;
    }
    if (rowType === "BLOCK") {
      if (!currentSlot) {
        throw new Error(`BLOCK row before SLOT at line ${index + 1}.`);
      }
      const duration = parseBlockDurationRange(columns[2]);
      const rest = parseBlockRestRange(columns[3]);
      currentBlock = {
        label: columns[1] || `Block ${currentSlot.blocks.length + 1}`,
        durationMin: duration.durationMin,
        durationMax: duration.durationMax,
        restSec: rest.restSec,
        restMaxSec: rest.restMaxSec,
        sets: normalizeSetPrescription(columns[4]),
        exercises: [],
      };
      currentSlot.blocks.push(currentBlock);
      return;
    }
    if (rowType === "EXERCISE") {
      if (!currentBlock) {
        throw new Error(`EXERCISE row before BLOCK at line ${index + 1}.`);
      }
      currentBlock.exercises.push({
        code: columns[1] || `E${currentBlock.exercises.length + 1}`,
        name: columns[2] || "Exercise",
        reps: columns[3] || "",
        notes: columns[4] || "",
        weight: toNumberOrNull(columns[5]),
      });
      return;
    }
    throw new Error(`Unknown row type "${columns[0]}" at line ${index + 1}.`);
  });

  if (!template.name || !template.durationWeeks || !template.weekdaySlots.length) {
    throw new Error("A phase import needs PHASE metadata and at least one SLOT.");
  }
  return template;
}

function parseWeekday(value) {
  const weekdayMap = {
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    tues: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    thur: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6,
    sunday: 7,
    sun: 7,
  };
  const key = String(value || "").trim().toLowerCase();
  const parsed = weekdayMap[key];
  if (!parsed) {
    throw new Error(`Invalid weekday "${value}".`);
  }
  return parsed;
}

function renderPhaseTemplates() {
  if (!phaseTemplateListEl) {
    return;
  }
  if (!phaseTemplates.length) {
    phaseTemplateListEl.innerHTML = "<p class=\"planner-empty\">No saved phase templates yet.</p>";
    return;
  }
  phaseTemplateListEl.innerHTML = phaseTemplates
    .map((template) => {
      const slotSummary = template.weekdaySlots
        .map((slot) => `${weekdayName(slot.weekday)}: ${slot.title}${slot.notes ? ` (${slot.notes})` : ""}`)
        .join(" • ");
      return `
        <article class="phase-card">
          <header>
            <div>
              <h4>${escapeHtml(template.name)}</h4>
              <div class="phase-meta">${template.durationWeeks} weeks • ${escapeHtml(slotSummary)}</div>
            </div>
          </header>
          <details class="phase-template-details">
            <summary>Show training details</summary>
            ${renderPhaseTemplateWorkouts(template)}
          </details>
          <div class="phase-instance-grid">
            <label>
              Start date
              <input type="date" data-role="schedule-date" data-id="${template.id}" value="${formatDateInput(new Date())}" />
            </label>
            <div class="phase-actions">
              <button type="button" class="ghost-button" data-role="edit-phase-template" data-id="${template.id}">Edit</button>
              <button type="button" data-role="schedule-phase" data-id="${template.id}">Schedule phase</button>
              <button type="button" class="ghost-button danger-button" data-role="delete-phase-template" data-id="${template.id}">Delete</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPhaseTemplateWorkouts(template) {
  const slots = template.weekdaySlots || [];
  if (!slots.length) {
    return `<p class="planner-empty">No training slots in this phase.</p>`;
  }

  return `
    <div class="phase-template-workouts">
      ${slots
        .map((slot) => {
          return `
            <article class="phase-training-card">
              <h5>${escapeHtml(weekdayName(slot.weekday))} • ${escapeHtml(slot.title)}</h5>
              ${slot.notes ? `<div class="phase-meta">${escapeHtml(slot.notes)}</div>` : ""}
              ${renderStrengthStructure(slot.blocks || [], { mode: "planned" })}
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function handlePhaseTemplateAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const role = target.dataset.role;
  const id = target.dataset.id;
  if (!role || !id) {
    return;
  }

  if (role === "delete-phase-template") {
    phaseTemplates = phaseTemplates.filter((template) => template.id !== id);
    if (editingPhaseTemplateId === id) {
      resetPhaseImportForm();
    }
    savePlannerCollections();
    render();
    return;
  }

  if (role === "edit-phase-template") {
    startPhaseTemplateEdit(id);
    return;
  }

  if (role === "schedule-phase") {
    const template = phaseTemplates.find((item) => item.id === id);
    const dateInput = phaseTemplateListEl.querySelector(`[data-role="schedule-date"][data-id="${id}"]`);
    const startDate = normalizeDateInput(dateInput?.value || "");
    if (!template || !startDate) {
      return;
    }
    schedulePhaseTemplate(template, startDate);
  }
}

function schedulePhaseTemplate(template, startDate) {
  const instanceId = crypto.randomUUID();
  const generatedSessions = buildPhaseSessions(template, startDate, instanceId);
  plannedSessions.push(...generatedSessions);

  phaseInstances.unshift(
    normalizePhaseInstance({
      id: instanceId,
      templateId: template.id,
      templateName: template.name,
      startDate,
      durationWeeks: template.durationWeeks,
      generatedSessionIds: generatedSessions.map((session) => session.id),
      createdAt: Date.now(),
    }),
  );
  savePlannerCollections();
  render();
}

function renderPhaseInstances() {
  if (!phaseInstanceListEl) {
    return;
  }
  if (!phaseInstances.length) {
    phaseInstanceListEl.innerHTML = "<p class=\"planner-empty\">No scheduled phases yet.</p>";
    return;
  }
  phaseInstanceListEl.innerHTML = phaseInstances
    .map((instance) => {
      const endDate = formatDateInput(addDays(instance.startDate, (instance.durationWeeks * 7) - 1));
      return `
        <article class="phase-card">
          <header>
            <div>
              <h4>${escapeHtml(instance.templateName || "Phase")}</h4>
              <div class="phase-meta">${formatHumanDate(instance.startDate)} to ${formatHumanDate(endDate)} • ${instance.generatedSessionIds.length} sessions</div>
            </div>
          </header>
          <div class="phase-actions">
            <button type="button" class="ghost-button danger-button" data-role="delete-phase-instance" data-id="${instance.id}">Remove scheduled phase</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function handlePhaseInstanceAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (target.dataset.role !== "delete-phase-instance" || !target.dataset.id) {
    return;
  }
  const instance = phaseInstances.find((item) => item.id === target.dataset.id);
  if (!instance) {
    return;
  }
  plannedSessions = plannedSessions.filter((session) => !instance.generatedSessionIds.includes(session.id));
  phaseInstances = phaseInstances.filter((item) => item.id !== instance.id);
  savePlannerCollections();
  render();
}

function openCompletionDialog(session) {
  if (!completionDialog || !completionForm) {
    return;
  }
  completionForm.reset();
  completionStrengthDraft = [];
  completionSprintDraft = [];
  completionSessionIdInput.value = session.id;
  completionDateInput.value = session.date;
  completionSessionTitleEl.textContent = `${session.title} • ${capitalize(session.type)}`;
  completionStatusMessageEl.textContent = "";

  completionRunFields.style.display = session.type === "run" ? "block" : "none";
  completionSprintFields.style.display = session.type === "sprint" ? "block" : "none";
  completionStrengthFields.style.display = session.type === "strength" ? "block" : "none";

  if (session.type === "run") {
    completionRunDistanceInput.value = session.details?.distance ?? "";
    completionRunTimeInput.value = "";
    completionRunPaceInput.value = "";
  }
  if (session.type === "sprint") {
    completionSprintDraft = buildCompletionSprintDraft(session);
    if (completionSprintFeelingInput) {
      completionSprintFeelingInput.value = "";
    }
    renderCompletionSprintBlocks();
  }
  if (session.type === "strength") {
    completionStrengthDraft = buildCompletionStrengthDraft(session);
    renderCompletionStrengthBlocks();
  }

  if (typeof completionDialog.showModal === "function") {
    completionDialog.showModal();
  } else {
    completionDialog.setAttribute("open", "true");
  }
}

function closeCompletionDialog() {
  if (!completionDialog) {
    return;
  }
  completionStrengthDraft = [];
  completionSprintDraft = [];
  if (typeof completionDialog.close === "function") {
    completionDialog.close();
  } else {
    completionDialog.removeAttribute("open");
  }
}

function buildCompletionSprintDraft(session) {
  return normalizePlannedSprintBlocks(session.details?.blocks || []).map((block, blockIndex) => ({
    label: `Block ${blockIndex + 1}`,
    reps: Number(block.reps),
    distance: Number(block.distance),
    targetTime: isNumber(block.targetTime) ? Number(block.targetTime) : null,
    restSec: isNumber(block.restSec) ? Number(block.restSec) : null,
    bestPreviousTime: findBestSprintTimeForDistance(block.distance),
    rows: Array.from({ length: Number(block.reps) }, (_, repIndex) => ({
      order: repIndex + 1,
      distance: Number(block.distance),
      targetTime: isNumber(block.targetTime) ? Number(block.targetTime) : null,
      actualTime: null,
    })),
  }));
}

function renderCompletionSprintBlocks() {
  if (!completionSprintBlocksEl) {
    return;
  }
  if (!completionSprintDraft.length) {
    completionSprintBlocksEl.innerHTML = "<p class=\"planner-empty\">No planned sprint blocks.</p>";
    return;
  }
  completionSprintBlocksEl.innerHTML = completionSprintDraft
    .map(
      (block, blockIndex) => `
        <div class="completion-block completion-sprint-block">
          <h4>${escapeHtml(block.label)}</h4>
          <div class="phase-meta">${escapeHtml(formatPlannedSprintBlock(block))}</div>
          <div class="completion-sprint-grid">
            <div class="completion-sprint-grid-header">Rep</div>
            <div class="completion-sprint-grid-header">Meters</div>
            <div class="completion-sprint-grid-header">Reference</div>
            <div class="completion-sprint-grid-header">Actual time (sec)</div>
            ${(block.rows || [])
              .map(
                (row, rowIndex) => `
                  <div class="completion-sprint-cell">${row.order}</div>
                  <div class="completion-sprint-cell">${escapeHtml(formatNumber(row.distance))}m</div>
                  <div class="completion-sprint-cell">${formatSprintReferenceCell(row, block)}</div>
                  <label class="completion-sprint-input">
                    <input type="number" min="0" step="0.01" data-role="completion-sprint-time" data-block-index="${blockIndex}" data-row-index="${rowIndex}" value="${row.actualTime ?? ""}" />
                  </label>`,
              )
              .join("")}
          </div>
        </div>`,
    )
    .join("");
}

function formatSprintReferenceCell(row, block) {
  if (isNumber(row?.targetTime)) {
    return `${escapeHtml(formatNumber(row.targetTime))}s target`;
  }
  if (isNumber(block?.bestPreviousTime)) {
    return `${escapeHtml(formatNumber(block.bestPreviousTime))}s best`;
  }
  return "-";
}

function handleCompletionSprintInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  if (target.dataset.role !== "completion-sprint-time") {
    return;
  }
  const blockIndex = Number(target.dataset.blockIndex);
  const rowIndex = Number(target.dataset.rowIndex);
  const row = completionSprintDraft?.[blockIndex]?.rows?.[rowIndex];
  if (!row) {
    return;
  }
  row.actualTime = toNumberOrNull(target.value);
}

function collectCompletedSprintSets() {
  return (completionSprintDraft || [])
    .flatMap((block) => block.rows || [])
    .map((row, index) => ({
      order: index + 1,
      time: toNumberOrNull(row.actualTime),
      distance: toNumberOrNull(row.distance),
      targetTime: toNumberOrNull(row.targetTime),
    }))
    .filter((set) => isNumber(set.time) && isNumber(set.distance));
}

function findBestSprintTimeForDistance(distance) {
  const value = toNumberOrNull(distance);
  if (!isNumber(value)) {
    return null;
  }
  const matchingTimes = workouts
    .filter((workout) => workout.activity === "sprint")
    .flatMap((workout) => normalizeSprintSets(workout.sprintSets))
    .filter((set) => Number(set.distance) === Number(value))
    .map((set) => Number(set.time))
    .filter((time) => isNumber(time));
  return matchingTimes.length ? Math.min(...matchingTimes) : null;
}

function buildCompletionStrengthDraft(session) {
  const blocks = session.details?.blocks || [];
  return blocks.map((block, blockIndex) => {
    const defaultSetCount = getDefaultActualSets(block.sets) || 1;
    return {
      label: block.label || String(blockIndex + 1),
      plannedMeta: {
        duration: formatBlockDuration(block),
        rest: formatBlockRest(block),
        sets: String(block.sets || ""),
      },
      actualSets: getDefaultActualSets(block.sets),
      note: "",
      exercises: (block.exercises || []).map((exercise) => ({
        code: exercise.code || "",
        name: exercise.name || "Exercise",
        plannedReps: exercise.reps || "",
        plannedNote: exercise.notes || "",
        plannedWeight: isNumber(exercise.weight) ? exercise.weight : null,
        completed: true,
        actualNote: "",
        actualSets: Array.from({ length: defaultSetCount }, (_, setIndex) => ({
          id: crypto.randomUUID(),
          order: setIndex + 1,
          reps: extractWorkoutRepCount(exercise.reps) || null,
          loadType: "kg",
          weight: isNumber(exercise.weight) ? exercise.weight : null,
          bandColor: "",
        })),
      })),
    };
  });
}

function renderCompletionStrengthBlocks() {
  const blocks = completionStrengthDraft || [];
  completionStrengthBlocksEl.innerHTML = blocks
    .map(
      (block, blockIndex) => `
        <div class="completion-block">
          <h4>Block ${escapeHtml(block.label || String(blockIndex + 1))}</h4>
          <div class="phase-meta">${[
            block.plannedMeta?.duration || "",
            block.plannedMeta?.rest ? `${block.plannedMeta.rest} rest` : "",
            block.plannedMeta?.sets ? `${escapeHtml(block.plannedMeta.sets)} sets planned` : "",
          ]
            .filter(Boolean)
            .join(" • ")}</div>
          <div class="grid">
            <label>
              Actual sets
              <input type="number" min="0" data-role="completion-block-sets" data-block-index="${blockIndex}" value="${block.actualSets ?? ""}" />
            </label>
            <label>
              Block note
              <input type="text" data-role="completion-block-note" data-block-index="${blockIndex}" placeholder="Optional note" value="${escapeHtml(block.note || "")}" />
            </label>
          </div>
          <div class="completion-exercise-list">
            ${(block.exercises || [])
              .map(
                (exercise, exerciseIndex) => `
                  <div class="completion-exercise-row">
                    <div class="completion-exercise-header">
                      <label class="checkbox-label">
                        <input type="checkbox" data-role="completion-exercise-done" data-block-index="${blockIndex}" data-exercise-index="${exerciseIndex}" ${exercise.completed ? "checked" : ""} />
                        ${escapeHtml(exercise.code || "")} ${escapeHtml(exercise.name)}
                      </label>
                      <div class="phase-meta">Planned: ${escapeHtml(exercise.plannedReps || "-")}${isNumber(exercise.plannedWeight) ? ` @ ${escapeHtml(formatNumber(exercise.plannedWeight))} kg` : ""}${exercise.plannedNote ? ` - ${escapeHtml(exercise.plannedNote)}` : ""}</div>
                    </div>
                    <div class="completion-actual-sets">
                      ${(exercise.actualSets || [])
                        .map(
                          (set, setIndex) => `
                            <div class="completion-actual-set-row">
                              <span class="completion-set-order">Set ${setIndex + 1}</span>
                              <input type="number" min="0" data-role="completion-set-reps" data-block-index="${blockIndex}" data-exercise-index="${exerciseIndex}" data-set-id="${set.id}" value="${set.reps ?? ""}" placeholder="Reps" />
                              <select data-role="completion-set-load-type" data-block-index="${blockIndex}" data-exercise-index="${exerciseIndex}" data-set-id="${set.id}">
                                <option value="kg" ${set.loadType === "kg" ? "selected" : ""}>kg</option>
                                <option value="bodyweight" ${set.loadType === "bodyweight" ? "selected" : ""}>body weight</option>
                                <option value="band" ${set.loadType === "band" ? "selected" : ""}>band</option>
                              </select>
                              <input type="number" min="0" step="0.1" data-role="completion-set-weight" data-block-index="${blockIndex}" data-exercise-index="${exerciseIndex}" data-set-id="${set.id}" value="${set.weight ?? ""}" placeholder="Weight" ${set.loadType === "kg" ? "" : "disabled"} />
                              <div class="band-color-field completion-band-field${set.loadType === "band" ? "" : " is-disabled"}">
                                <input type="hidden" value="${escapeHtml(set.bandColor || "")}" />
                                <div class="band-color-picker${set.loadType === "band" ? "" : " is-disabled"}">${renderBandColorDots(set.bandColor || "", {
                                  role: "completion-set-band-color",
                                  exerciseIndex,
                                  setIndex,
                                  disabled: set.loadType !== "band",
                                }).replaceAll(`data-set-index="${setIndex}"`, `data-set-id="${set.id}"`)}</div>
                              </div>
                              <button type="button" class="ghost-button danger-button" data-role="remove-completion-set" data-block-index="${blockIndex}" data-exercise-index="${exerciseIndex}" data-set-id="${set.id}">Remove</button>
                            </div>
                          `,
                        )
                        .join("")}
                      <button type="button" class="ghost-button" data-role="add-completion-set" data-block-index="${blockIndex}" data-exercise-index="${exerciseIndex}">Add set</button>
                    </div>
                    <label>
                      Actual note
                      <input type="text" data-role="completion-exercise-note" data-block-index="${blockIndex}" data-exercise-index="${exerciseIndex}" placeholder="Optional change note" value="${escapeHtml(exercise.actualNote || "")}" />
                    </label>
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>
      `,
    )
    .join("");
}

function syncCompletionRunPace() {
  const distance = toNumberOrNull(completionRunDistanceInput.value);
  const totalSeconds = parseFlexibleRunDurationToSeconds(completionRunTimeInput.value);
  const pace = calculateRunPace(distance, totalSeconds);
  completionRunPaceInput.value = isNumber(pace) ? formatRunPace(pace) : "";
}

function normalizeCompletionRunTimeField() {
  const normalized = normalizeFlexibleRunDurationInput(completionRunTimeInput.value);
  completionRunTimeInput.value = normalized || completionRunTimeInput.value;
  syncCompletionRunPace();
}

function handleCompletionStrengthAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const role = target.dataset.role;
  const blockIndex = Number(target.dataset.blockIndex);
  const exerciseIndex = Number(target.dataset.exerciseIndex);
  const setId = target.dataset.setId || "";

  if (role === "add-completion-set" && Number.isInteger(blockIndex) && Number.isInteger(exerciseIndex)) {
    const exercise = completionStrengthDraft[blockIndex]?.exercises?.[exerciseIndex];
    if (!exercise) {
      return;
    }
    exercise.actualSets.push({
      id: crypto.randomUUID(),
      order: exercise.actualSets.length + 1,
      reps: null,
      loadType: "kg",
      weight: null,
      bandColor: "",
    });
    renderCompletionStrengthBlocks();
    return;
  }

  if (role === "remove-completion-set" && Number.isInteger(blockIndex) && Number.isInteger(exerciseIndex) && setId) {
    const exercise = completionStrengthDraft[blockIndex]?.exercises?.[exerciseIndex];
    if (!exercise) {
      return;
    }
    exercise.actualSets = exercise.actualSets.filter((set) => set.id !== setId);
    renderCompletionStrengthBlocks();
    return;
  }

  if (role === "completion-set-band-color" && Number.isInteger(blockIndex) && Number.isInteger(exerciseIndex) && setId) {
    const set = findCompletionSet(blockIndex, exerciseIndex, setId);
    if (!set || target.dataset.bandColor === undefined) {
      return;
    }
    set.bandColor = target.dataset.bandColor;
    renderCompletionStrengthBlocks();
  }
}

function handleCompletionStrengthInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const role = target.dataset.role;
  const blockIndex = Number(target.dataset.blockIndex);
  const exerciseIndex = Number(target.dataset.exerciseIndex);
  const setId = target.dataset.setId || "";

  const block = completionStrengthDraft[blockIndex];
  const exercise = block?.exercises?.[exerciseIndex];
  if (!role || (!block && role !== "completion-block-sets" && role !== "completion-block-note")) {
    return;
  }

  if (role === "completion-block-sets" && block && target instanceof HTMLInputElement) {
    block.actualSets = toNumberOrNull(target.value);
    return;
  }
  if (role === "completion-block-note" && block && target instanceof HTMLInputElement) {
    block.note = target.value.trim();
    return;
  }
  if (!exercise) {
    return;
  }
  if (role === "completion-exercise-done" && target instanceof HTMLInputElement) {
    exercise.completed = Boolean(target.checked);
    return;
  }
  if (role === "completion-exercise-note" && target instanceof HTMLInputElement) {
    exercise.actualNote = target.value.trim();
    return;
  }

  const set = findCompletionSet(blockIndex, exerciseIndex, setId);
  if (!set) {
    return;
  }
  if (role === "completion-set-reps" && target instanceof HTMLInputElement) {
    set.reps = toNumberOrNull(target.value);
    return;
  }
  if (role === "completion-set-weight" && target instanceof HTMLInputElement) {
    set.weight = toNumberOrNull(target.value);
    return;
  }
  if (role === "completion-set-load-type" && target instanceof HTMLSelectElement) {
    set.loadType = target.value === "band" || target.value === "bodyweight" ? target.value : "kg";
    if (set.loadType !== "kg") {
      set.weight = null;
    }
    if (set.loadType !== "band") {
      set.bandColor = "";
    }
    renderCompletionStrengthBlocks();
  }
}

function findCompletionSet(blockIndex, exerciseIndex, setId) {
  return completionStrengthDraft[blockIndex]?.exercises?.[exerciseIndex]?.actualSets?.find((set) => set.id === setId) || null;
}

function detectCompletedSessionStatus(session, actual) {
  if (session.type !== "strength") {
    return "completed";
  }
  return detectStrengthCompletionStatus(session, actual);
}

function refreshDetectedSessionStatuses(options = {}) {
  const { persist = true } = options;
  let changed = false;
  plannedSessions.forEach((session) => {
    if (session.type !== "strength" || !["completed", "modified"].includes(session.status) || !session.actual) {
      return;
    }
    const refreshedStatus = detectStrengthCompletionStatus(session, session.actual);
    if (session.status !== refreshedStatus) {
      session.status = refreshedStatus;
      changed = true;
    }
  });
  if (changed && persist) {
    savePlannerCollections();
  }
  return changed;
}

function detectStrengthCompletionStatus(session, actual) {
  const plannedBlocks = session.details?.blocks || [];
  const actualBlocks = actual?.blocks || [];
  if (plannedBlocks.length !== actualBlocks.length) {
    return "modified";
  }

  for (let blockIndex = 0; blockIndex < plannedBlocks.length; blockIndex += 1) {
    const plannedBlock = plannedBlocks[blockIndex];
    const actualBlock = actualBlocks[blockIndex];
    if (!actualBlock || (actualBlock.label || "") !== (plannedBlock.label || "")) {
      return "modified";
    }

    const plannedSetMinimum = getDefaultActualSets(plannedBlock.sets);
    if (isNumber(plannedSetMinimum) && actualBlock.actualSets < plannedSetMinimum) {
      return "modified";
    }

    const plannedExercises = plannedBlock.exercises || [];
    const actualExercises = actualBlock.exercises || [];
    if (plannedExercises.length !== actualExercises.length) {
      return "modified";
    }

    for (let exerciseIndex = 0; exerciseIndex < plannedExercises.length; exerciseIndex += 1) {
      const plannedExercise = plannedExercises[exerciseIndex];
      const actualExercise = actualExercises[exerciseIndex];
      if (
        !actualExercise ||
        !actualExercise.completed ||
        (actualExercise.code || "") !== (plannedExercise.code || "") ||
        (actualExercise.name || "") !== (plannedExercise.name || "")
      ) {
        return "modified";
      }

      const actualSets = actualExercise.actualSets || [];
      const plannedExerciseSetMinimum = plannedSetMinimum || 0;
      if (isNumber(plannedExerciseSetMinimum) && actualSets.length < plannedExerciseSetMinimum) {
        return "modified";
      }

      const plannedRepMinimum = extractWorkoutRepCount(plannedExercise.reps);
      const plannedWeightMinimum = isNumber(plannedExercise.weight) ? Number(plannedExercise.weight) : null;
      for (let setIndex = 0; setIndex < actualSets.length; setIndex += 1) {
        const actualSet = actualSets[setIndex];
        if (!actualSet || !isNumber(actualSet.reps)) {
          return "modified";
        }
        if (plannedRepMinimum && actualSet.reps < plannedRepMinimum) {
          return "modified";
        }
        if (!doesActualLoadMeetPlan(actualSet, plannedWeightMinimum)) {
          return "modified";
        }
      }
    }
  }

  return "completed";
}

function doesActualLoadMeetPlan(actualSet, plannedWeightMinimum) {
  const loadType = actualSet?.loadType || "kg";
  if (!isNumber(plannedWeightMinimum)) {
    return ["kg", "bodyweight", "band"].includes(loadType);
  }
  return loadType === "kg" && isNumber(actualSet.weight) && Number(actualSet.weight) >= plannedWeightMinimum;
}

function saveCompletedSession(event) {
  event.preventDefault();
  const session = plannedSessions.find((item) => item.id === completionSessionIdInput.value);
  if (!session) {
    return;
  }
  const modificationNote = completionNoteInput.value.trim();
  let actual = null;
  try {
    if (session.type === "run") {
      const distance = toNumberOrNull(completionRunDistanceInput.value);
      const time = normalizeFlexibleRunDurationInput(completionRunTimeInput.value);
      const pace = calculateRunPace(distance, parseFlexibleRunDurationToSeconds(completionRunTimeInput.value));
      if (!isNumber(distance) || !time || !isNumber(pace)) {
        completionStatusMessageEl.textContent = "Run completion needs distance and time in hh:mm:ss or mm:ss.";
        return;
      }
      completionRunTimeInput.value = time;
      completionRunPaceInput.value = formatRunPace(pace);
      actual = { distance, time, pace };
    }
    if (session.type === "sprint") {
      const sprintSets = collectCompletedSprintSets();
      const expectedSprintSets = (completionSprintDraft || []).reduce((sum, block) => sum + ((block.rows || []).length), 0);
      if (!sprintSets.length || sprintSets.length !== expectedSprintSets) {
        completionStatusMessageEl.textContent = "Sprint completion needs a time for every planned rep.";
        return;
      }
      actual = {
        sprintSets,
        feeling: completionSprintFeelingInput?.value || "",
      };
    }
    if (session.type === "strength") {
      actual = { blocks: collectCompletedStrengthBlocks(session) };
      const actualStrengthSets = actual.blocks.flatMap((block) =>
        (block.exercises || []).flatMap((exercise) => (exercise.completed ? exercise.actualSets || [] : [])),
      );
      if (!actualStrengthSets.length) {
        completionStatusMessageEl.textContent = "Strength completion needs at least one logged set.";
        return;
      }
    }

    const status = detectCompletedSessionStatus(session, actual);

    const workout = createWorkoutFromPlannedSession(session, actual, modificationNote);
    workouts.unshift(normalizeImportedWorkout(workout));
    syncExerciseLibraryFromWorkouts();
    renderExerciseLibrary();
    save(STORAGE_KEY_WORKOUTS, workouts);
    session.status = status;
    session.actual = actual;
    session.linkedWorkoutId = workout.id;
    session.modificationNote = modificationNote;
    savePlannerCollections();
    closeCompletionDialog();
    render();
  } catch {
    completionStatusMessageEl.textContent = "Could not save completion. Check the values and try again.";
  }
}

function collectCompletedStrengthBlocks(session) {
  return (completionStrengthDraft || []).map((block) => ({
    label: block.label,
    plannedSets: block.plannedMeta?.sets || "",
    actualSets: toNumberOrNull(block.actualSets),
    note: block.note || "",
    exercises: (block.exercises || []).map((exercise) => ({
      code: exercise.code,
      name: exercise.name,
      reps: exercise.plannedReps,
      completed: Boolean(exercise.completed),
      actualNote: exercise.actualNote || "",
      actualSets: (exercise.actualSets || [])
        .map((set, index) => ({
          order: index + 1,
          reps: toNumberOrNull(set.reps),
          loadType: set.loadType === "band" || set.loadType === "bodyweight" ? set.loadType : "kg",
          weight: set.loadType === "kg" ? toNumberOrNull(set.weight) : null,
          bandColor: set.loadType === "band" ? set.bandColor || "" : "",
        }))
        .filter((set) => isNumber(set.reps)),
    })),
  }));
}

function createWorkoutFromPlannedSession(session, actual, modificationNote) {
  if (session.type === "run") {
    return {
      id: crypto.randomUUID(),
      date: session.date,
      activity: "run",
      distance: actual.distance,
      time: actual.time,
      pace: actual.pace,
      notes: modificationNote || `Completed planned run: ${session.title}`,
      sprintSets: [],
      strengthExercises: [],
      createdAt: Date.now(),
    };
  }
  if (session.type === "sprint") {
    return {
      id: crypto.randomUUID(),
      date: session.date,
      activity: "sprint",
      sprintSets: actual.sprintSets,
      sprintFeeling: actual.feeling || "",
      distance: null,
      time: null,
      pace: null,
      strengthExercises: [],
      notes: modificationNote || `Completed planned sprint: ${session.title}`,
      createdAt: Date.now(),
    };
  }
  return {
    id: crypto.randomUUID(),
    date: session.date,
    activity: "strength",
    strengthExercises: convertStrengthActualToWorkoutExercises(actual.blocks),
    distance: null,
    time: null,
    pace: null,
    sprintSets: [],
    notes: modificationNote || `Completed planned strength: ${session.title}`,
    createdAt: Date.now(),
  };
}

function convertStrengthActualToWorkoutExercises(blocks) {
  return blocks
    .flatMap((block) => block.exercises.filter((exercise) => exercise.completed))
    .map((exercise) => ({
      name: exercise.name,
      sets: (exercise.actualSets || [])
        .map((set, index) => ({
          order: index + 1,
          reps: toNumberOrNull(set.reps),
          loadType: set.loadType === "band" || set.loadType === "bodyweight" ? set.loadType : "kg",
          weight: set.loadType === "kg" ? toNumberOrNull(set.weight) : null,
          bandColor: set.loadType === "band" ? set.bandColor || "" : "",
        }))
        .filter((set) => isNumber(set.reps)),
    }))
    .filter((exercise) => exercise.sets.length > 0);
}

function extractWorkoutRepCount(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return 0;
  }

  const afterMultiplier = raw.includes("x") ? raw.split("x").pop() : raw;
  const firstNumber = afterMultiplier.match(/\d+(?:\.\d+)?/);
  return firstNumber ? Number(firstNumber[0]) : 0;
}

function renderReview() {
  if (!reviewSessionListEl || !reviewSummaryEl) {
    return;
  }
  const reviewedSessions = plannedSessions
    .filter((session) => session.status !== "planned")
    .slice()
    .sort((a, b) => compareWorkoutsByRecentDate(a, b));
  const modified = reviewedSessions.filter((session) => session.status === "modified").length;
  const missed = reviewedSessions.filter((session) => session.status === "missed").length;
  reviewSummaryEl.innerHTML = `
    <article class="badge">
      <span class="label">Reviewed sessions</span>
      <span class="value">${reviewedSessions.length}</span>
    </article>
    <article class="badge">
      <span class="label">Modified</span>
      <span class="value">${modified}</span>
    </article>
    <article class="badge">
      <span class="label">Missed</span>
      <span class="value">${missed}</span>
    </article>
  `;
  if (!reviewedSessions.length) {
    reviewSessionListEl.innerHTML = "<p class=\"planner-empty\">No completed or missed planned sessions yet.</p>";
    return;
  }
  reviewSessionListEl.innerHTML = reviewedSessions
    .map(
      (session) => `
        <article class="review-card">
          <header>
            <div>
              <h4>${escapeHtml(session.title)}</h4>
              <div class="review-meta">${formatHumanDate(session.date)} • ${capitalize(session.type)}</div>
            </div>
            <span class="session-status status-${session.status}">${escapeHtml(session.status)}</span>
          </header>
          <div class="review-diff-grid">
            <div class="diff-panel">
              <h5>Planned</h5>
              ${renderPlannedDiff(session)}
            </div>
            <div class="diff-panel">
              <h5>Actual</h5>
              ${renderActualDiff(session)}
            </div>
          </div>
          ${session.modificationNote ? `<div class="review-meta">Note: ${escapeHtml(session.modificationNote)}</div>` : ""}
        </article>
      `,
    )
    .join("");
}

function renderPlannedDiff(session) {
  if (session.type === "run") {
    return `<pre>${escapeHtml(formatPlannedSessionSummary(session))}</pre>`;
  }
  if (session.type === "sprint") {
    return `<ul>${(session.details?.blocks || []).map((block) => `<li>${escapeHtml(formatPlannedSprintBlock(block))}</li>`).join("")}</ul>`;
  }
  return renderStrengthStructure(session.details?.blocks || [], { mode: "planned", notes: session.notes });
}

function renderActualDiff(session) {
  if (session.status === "missed") {
    return "<pre>Missed session.</pre>";
  }
  if (session.type === "run") {
    return `<pre>${escapeHtml(`${formatNumber(session.actual?.distance || 0)} km • ${session.actual?.time || ""} • ${formatRunPace(session.actual?.pace || 0)} min/km`)}</pre>`;
  }
  if (session.type === "sprint") {
    return `
      <ul>${(session.actual?.sprintSets || []).map((set) => `<li>${formatNumber(set.distance)}m in ${formatNumber(set.time)}s</li>`).join("")}</ul>
      ${formatSprintFeeling(session.actual?.feeling) ? `<div class="review-meta">Feeling: ${escapeHtml(formatSprintFeeling(session.actual?.feeling))}</div>` : ""}
    `;
  }
  return renderStrengthStructure(session.actual?.blocks || [], { mode: "actual" });
}

function renderAdherenceStats() {
  if (!adherenceSummaryEl || !adherenceBreakdownEl) {
    return;
  }
  const weekStats = computeWeeklyAdherence(uiSettings.currentWeekStart);
  const allSessions = plannedSessions.length;
  const completedSessions = plannedSessions.filter((session) => ["completed", "modified"].includes(session.status)).length;
  const completionRate = allSessions ? Math.round((completedSessions / allSessions) * 100) : 0;
  adherenceSummaryEl.innerHTML = `
    <article class="badge">
      <span class="label">Weekly adherence</span>
      <span class="value">${weekStats.completed}/${weekStats.total || 0}</span>
    </article>
    <article class="badge">
      <span class="label">Overall completion</span>
      <span class="value">${completionRate}%</span>
    </article>
    <article class="badge">
      <span class="label">Planned sessions</span>
      <span class="value">${allSessions}</span>
    </article>
  `;

  const countsByType = ["strength", "run", "sprint"].map((type) => {
    const planned = plannedSessions.filter((session) => session.type === type).length;
    const completed = plannedSessions.filter((session) => session.type === type && ["completed", "modified"].includes(session.status)).length;
    return { type, planned, completed };
  });
  adherenceBreakdownEl.innerHTML = countsByType
    .map(
      ({ type, planned, completed }) => `
        <div class="goal-item">
          <strong>${capitalize(type)} adherence:</strong> ${completed}/${planned || 0}
          <div class="progress-bar"><span style="width:${planned ? Math.round((completed / planned) * 100) : 0}%"></span></div>
        </div>
      `,
    )
    .join("");
}

function renderProgramProgress() {
  if (!programProgressSelect || !programProgressSummaryEl || !programProgressStatusEl || !programExerciseProgressEl) {
    return;
  }
  if (programExerciseSortInput) {
    programExerciseSortInput.value = programExerciseSortMode;
  }

  if (!phaseInstances.length) {
    selectedProgramProgressInstanceId = "";
    programProgressSelect.innerHTML = "<option value=\"\">No scheduled strength programs</option>";
    programProgressSummaryEl.innerHTML = "";
    programProgressStatusEl.textContent = "Schedule a strength phase to see program-duration progress.";
    programExerciseProgressEl.innerHTML = "";
    programAdherenceChart = createOrUpdateStackedBarChart(programAdherenceChart, programAdherenceChartCanvas, [], "");
    toggleChartCardVisibility(programAdherenceChartCard, false);
    return;
  }

  if (!phaseInstances.some((instance) => instance.id === selectedProgramProgressInstanceId)) {
    selectedProgramProgressInstanceId = phaseInstances[0].id;
  }

  programProgressSelect.innerHTML = phaseInstances
    .map((instance) => {
      const endDate = formatDateInput(addDays(instance.startDate, (instance.durationWeeks * 7) - 1));
      return `<option value="${escapeHtml(instance.id)}"${instance.id === selectedProgramProgressInstanceId ? " selected" : ""}>${escapeHtml(instance.templateName || "Strength program")} • ${formatHumanDate(instance.startDate)}-${formatHumanDate(endDate)}</option>`;
    })
    .join("");

  const model = buildProgramProgressModel(selectedProgramProgressInstanceId);
  if (!model) {
    programProgressSummaryEl.innerHTML = "";
    programProgressStatusEl.textContent = "Select a scheduled strength program.";
    programExerciseProgressEl.innerHTML = "";
    programAdherenceChart = createOrUpdateStackedBarChart(programAdherenceChart, programAdherenceChartCanvas, [], "");
    toggleChartCardVisibility(programAdherenceChartCard, false);
    return;
  }

  programProgressSummaryEl.innerHTML = `
    <article class="badge">
      <span class="label">Program length</span>
      <span class="value">${model.durationWeeks} weeks</span>
    </article>
    <article class="badge">
      <span class="label">Adherence</span>
      <span class="value">${model.completed}/${model.total || 0}</span>
    </article>
    <article class="badge">
      <span class="label">Missed</span>
      <span class="value">${model.missed}</span>
    </article>
  `;
  programProgressStatusEl.textContent = `${model.name} runs from ${formatHumanDate(model.startDate)} to ${formatHumanDate(model.endDate)}. Run and sprint are intentionally excluded from this program view.`;

  programAdherenceChart = createOrUpdateStackedBarChart(programAdherenceChart, programAdherenceChartCanvas, model.weekRows, "Sessions");
  toggleChartCardVisibility(programAdherenceChartCard, model.weekRows.length > 0 && model.total > 0);
  programExerciseProgressEl.innerHTML = renderProgramExerciseProgressTable(model);
}

function buildProgramProgressModel(instanceId) {
  const instance = phaseInstances.find((item) => item.id === instanceId);
  if (!instance) {
    return null;
  }

  const durationWeeks = Math.max(1, toNumberOrNull(instance.durationWeeks) || 1);
  const startDate = normalizeDateInput(instance.startDate);
  const endDate = formatDateInput(addDays(startDate, (durationWeeks * 7) - 1));
  const sessions = plannedSessions
    .filter((session) => session.type === "strength" && session.phaseInstanceId === instance.id)
    .map((session) => ensurePhaseOccurrenceMetadata(session))
    .filter(Boolean);
  const weekRows = Array.from({ length: durationWeeks }, (_, index) => {
    const weekSessions = sessions.filter((session) => session.phaseWeekIndex === index);
    const completed = weekSessions.filter((session) => session.status === "completed").length;
    const modified = weekSessions.filter((session) => session.status === "modified").length;
    const missed = weekSessions.filter((session) => session.status === "missed").length;
    const planned = weekSessions.filter((session) => session.status === "planned").length;
    return {
      label: `Week ${index + 1}`,
      weekIndex: index,
      completed,
      modified,
      missed,
      planned,
      total: weekSessions.length,
    };
  });
  const total = weekRows.reduce((sum, row) => sum + row.total, 0);
  const completed = weekRows.reduce((sum, row) => sum + row.completed + row.modified, 0);
  const missed = weekRows.reduce((sum, row) => sum + row.missed, 0);

  return {
    id: instance.id,
    name: instance.templateName || "Strength program",
    durationWeeks,
    startDate,
    endDate,
    sessions,
    weekRows,
    total,
    completed,
    missed,
    exerciseRows: buildProgramExerciseRows(sessions, durationWeeks),
  };
}

function buildProgramExerciseRows(sessions, durationWeeks) {
  const entriesByName = new Map();
  sessions
    .filter((session) => ["completed", "modified"].includes(session.status) && session.actual?.blocks?.length)
    .sort((a, b) => (a.phaseWeekIndex - b.phaseWeekIndex) || a.date.localeCompare(b.date))
    .forEach((session) => {
      const plannedBlocks = session.details?.blocks || [];
      const actualBlocks = session.actual?.blocks || [];
      actualBlocks.forEach((actualBlock, blockIndex) => {
        const plannedBlock = plannedBlocks[blockIndex] || { exercises: [] };
        (actualBlock.exercises || []).forEach((actualExercise, exerciseIndex) => {
          if (!actualExercise.completed) {
            return;
          }
          const plannedExercise = plannedBlock.exercises?.[exerciseIndex] || {};
          const key = normalizeExerciseKey(actualExercise.name || plannedExercise.name || "");
          if (!key) {
            return;
          }
          const snapshot = buildActualExerciseSnapshot(actualExercise);
          const weekIndex = Number(session.phaseWeekIndex);
          const existing = entriesByName.get(key) || {
            name: actualExercise.name || plannedExercise.name || "Exercise",
            code: actualExercise.code || plannedExercise.code || "",
            firstSessionDate: session.date || "",
            firstSessionTitle: session.title || "",
            firstWeekIndex: isNumber(session.phaseWeekIndex) ? Number(session.phaseWeekIndex) : durationWeeks,
            firstBlockIndex: blockIndex,
            firstExerciseIndex: exerciseIndex,
            weeks: Array.from({ length: durationWeeks }, () => []),
          };
          const currentOrder = buildProgramOrderTuple(session, blockIndex, exerciseIndex);
          const existingOrder = buildProgramOrderTuple(
            {
              date: existing.firstSessionDate,
              title: existing.firstSessionTitle,
              phaseWeekIndex: existing.firstWeekIndex,
            },
            existing.firstBlockIndex,
            existing.firstExerciseIndex,
          );
          if (compareProgramOrderTuples(currentOrder, existingOrder) < 0) {
            existing.firstSessionDate = session.date || "";
            existing.firstSessionTitle = session.title || "";
            existing.firstWeekIndex = isNumber(session.phaseWeekIndex) ? Number(session.phaseWeekIndex) : durationWeeks;
            existing.firstBlockIndex = blockIndex;
            existing.firstExerciseIndex = exerciseIndex;
          }
          if (weekIndex >= 0 && weekIndex < durationWeeks) {
            existing.weeks[weekIndex].push(snapshot);
          }
          entriesByName.set(key, existing);
        });
      });
    });

  const rows = [...entriesByName.values()]
    .map((row) => {
      let previous = null;
      const weeks = row.weeks.map((snapshots) => {
        const combined = combineActualExerciseSnapshots(snapshots);
        const status = combined ? evaluateImprovementStatus(previous, combined).label : "";
        if (combined) {
          previous = combined;
        }
        return { snapshot: combined, status };
      });
      return {
        ...row,
        weeks,
        sortMeta: buildProgramExerciseSortMeta(row, weeks, durationWeeks),
      };
    });

  return sortProgramExerciseRows(rows, programExerciseSortMode);
}

function buildProgramOrderTuple(session, blockIndex, exerciseIndex) {
  return [
    isNumber(session.phaseWeekIndex) ? Number(session.phaseWeekIndex) : Number.MAX_SAFE_INTEGER,
    session.date || "",
    session.title || "",
    blockIndex,
    exerciseIndex,
  ];
}

function compareProgramOrderTuples(a, b) {
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] < b[index]) {
      return -1;
    }
    if (a[index] > b[index]) {
      return 1;
    }
  }
  return 0;
}

function buildProgramExerciseSortMeta(row, weeks, durationWeeks) {
  const loggedWeeks = weeks
    .map((week, index) => ({ ...week, index }))
    .filter((week) => week.snapshot);
  const latest = loggedWeeks[loggedWeeks.length - 1] || null;
  const previous = loggedWeeks.length > 1 ? loggedWeeks[loggedWeeks.length - 2] : null;
  const latestSnapshot = latest?.snapshot || null;
  const previousSnapshot = previous?.snapshot || null;
  const weightDelta =
    latestSnapshot && previousSnapshot && isNumber(latestSnapshot.maxWeight) && isNumber(previousSnapshot.maxWeight)
      ? latestSnapshot.maxWeight - previousSnapshot.maxWeight
      : 0;
  const repsDelta = latestSnapshot && previousSnapshot ? (latestSnapshot.maxReps || 0) - (previousSnapshot.maxReps || 0) : 0;
  const setsDelta = latestSnapshot && previousSnapshot ? (latestSnapshot.totalSets || 0) - (previousSnapshot.totalSets || 0) : 0;
  const latestStatus = latest?.status || "";
  const missingWeekCount = weeks.filter((week) => !week.snapshot).length;
  const latestProgramWeekMissing = durationWeeks > 0 && !weeks[durationWeeks - 1]?.snapshot;

  return {
    orderTuple: [row.firstWeekIndex, row.firstSessionDate, row.firstSessionTitle, row.firstBlockIndex, row.firstExerciseIndex, row.name],
    latestStatus,
    missingWeekCount,
    latestProgramWeekMissing,
    improvementScore: (weightDelta * 1000) + (repsDelta * 10) + setsDelta,
    attentionScore:
      (latestStatus === "Below previous" ? 10000 : 0) +
      (latestProgramWeekMissing ? 5000 : 0) +
      (missingWeekCount * 100) +
      (latestStatus === "Matched" || latestStatus === "Partial / mixed" ? 25 : 0) +
      (!latestStatus || latestStatus === "First logged week" ? 10 : 0),
  };
}

function sortProgramExerciseRows(rows, mode) {
  const sorted = rows.slice();
  if (mode === "highest-improvement") {
    return sorted.sort((a, b) => {
      const statusDifference = improvementStatusRank(b.sortMeta.latestStatus) - improvementStatusRank(a.sortMeta.latestStatus);
      if (statusDifference !== 0) {
        return statusDifference;
      }
      const scoreDifference = b.sortMeta.improvementScore - a.sortMeta.improvementScore;
      if (scoreDifference !== 0) {
        return scoreDifference;
      }
      return compareProgramOrderTuples(a.sortMeta.orderTuple, b.sortMeta.orderTuple);
    });
  }
  if (mode === "needs-attention") {
    return sorted.sort((a, b) => {
      const attentionDifference = b.sortMeta.attentionScore - a.sortMeta.attentionScore;
      if (attentionDifference !== 0) {
        return attentionDifference;
      }
      return compareProgramOrderTuples(a.sortMeta.orderTuple, b.sortMeta.orderTuple);
    });
  }
  return sorted.sort((a, b) => compareProgramOrderTuples(a.sortMeta.orderTuple, b.sortMeta.orderTuple));
}

function improvementStatusRank(status) {
  if (status === "Improved") {
    return 4;
  }
  if (status === "Partial / mixed") {
    return 3;
  }
  if (status === "Matched") {
    return 2;
  }
  if (status === "First logged week") {
    return 1;
  }
  if (status === "Below previous") {
    return -1;
  }
  return 0;
}

function combineActualExerciseSnapshots(snapshots) {
  if (!snapshots.length) {
    return null;
  }
  const maxWeightValues = snapshots.map((snapshot) => snapshot.maxWeight).filter(isNumber);
  return {
    totalSets: snapshots.reduce((sum, snapshot) => sum + snapshot.totalSets, 0),
    maxWeight: maxWeightValues.length ? Math.max(...maxWeightValues) : null,
    maxReps: Math.max(...snapshots.map((snapshot) => snapshot.maxReps || 0)),
    summary: snapshots.map((snapshot) => snapshot.summary).filter(Boolean).join(" | "),
  };
}

function renderProgramExerciseProgressTable(model) {
  if (!model.exerciseRows.length) {
    return "<p class=\"planner-empty\">Complete generated strength sessions in this program to see exercise-by-week progress.</p>";
  }

  const weekHeadings = Array.from({ length: model.durationWeeks }, (_, index) => `<th>Week ${index + 1}</th>`).join("");
  const rows = model.exerciseRows
    .map((row) => `
      <tr>
        <th>${escapeHtml(row.name)}${row.code ? `<div class="phase-meta">${escapeHtml(row.code)}</div>` : ""}</th>
        ${row.weeks.map((week) => renderProgramExerciseWeekCell(week)).join("")}
      </tr>
    `)
    .join("");

  return `
    <table class="program-progress-table">
      <thead>
        <tr>
          <th>Exercise</th>
          ${weekHeadings}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderProgramExerciseWeekCell(week) {
  if (!week.snapshot) {
    return "<td class=\"is-empty\">Not logged</td>";
  }
  const statusClass = programProgressStatusClass(week.status);
  return `
    <td class="${statusClass}">
      <strong>${escapeHtml(week.status)}</strong><br />
      ${escapeHtml(formatActualProgressSnapshot(week.snapshot))}
    </td>
  `;
}

function programProgressStatusClass(status) {
  if (status === "Improved") {
    return "is-improved";
  }
  if (status === "Below previous") {
    return "is-lower";
  }
  return "is-stable";
}

function createOrUpdateStackedBarChart(existingChart, canvas, weekRows, unit) {
  if (!canvas || typeof Chart === "undefined") {
    return existingChart;
  }

  if (existingChart) {
    existingChart.destroy();
    existingChart = null;
  }

  if (!weekRows.length) {
    return null;
  }

  return new Chart(canvas, {
    type: "bar",
    data: {
      labels: weekRows.map((row) => row.label),
      datasets: [
        { label: "Done", data: weekRows.map((row) => row.completed + row.modified), backgroundColor: "#6DFF5C" },
        { label: "Missed", data: weekRows.map((row) => row.missed), backgroundColor: "#FF9CAF" },
        { label: "Planned", data: weekRows.map((row) => row.planned), backgroundColor: "#7DD3FC" },
      ],
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true, title: { display: true, text: unit } },
      },
    },
  });
}

function normalizeExerciseKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function buildPlannedExerciseSnapshot(exercise, block) {
  return {
    repsText: exercise?.reps || "-",
    repsBase: extractWorkoutRepCount(exercise?.reps),
    weight: isNumber(exercise?.weight) ? Number(exercise.weight) : null,
    setsText: String(block?.sets || ""),
    setsBase: getDefaultActualSets(block?.sets) || 0,
  };
}

function buildActualExerciseSnapshot(exercise) {
  const sets = exercise?.actualSets || [];
  const kgSets = sets.filter((set) => set.loadType === "kg" && isNumber(set.weight));
  const maxWeight = kgSets.length ? Math.max(...kgSets.map((set) => Number(set.weight))) : null;
  const maxReps = sets.length ? Math.max(...sets.map((set) => Number(set.reps))) : 0;
  return {
    totalSets: sets.length,
    maxWeight,
    maxReps,
    loadTypes: [...new Set(sets.map((set) => set.loadType || "kg"))],
    summary: sets.map((set) => `${formatNumber(set.reps)} reps @ ${formatStrengthLoad(set)}`).join(", "),
  };
}

function formatPlannedProgressSnapshot(snapshot) {
  return [snapshot.setsText ? `${snapshot.setsText} sets` : "", snapshot.repsText, isNumber(snapshot.weight) ? `@ ${formatNumber(snapshot.weight)} kg` : ""]
    .filter(Boolean)
    .join(" • ");
}

function formatActualProgressSnapshot(snapshot) {
  if (!snapshot) {
    return "No previous logged week";
  }
  return [snapshot.totalSets ? `${snapshot.totalSets} sets` : "", snapshot.summary || "", snapshot.maxWeight ? `top ${formatNumber(snapshot.maxWeight)} kg` : ""]
    .filter(Boolean)
    .join(" • ");
}

function evaluatePlanStatus(planned, actual) {
  const setsMeetPlan = !planned.setsBase || actual.totalSets >= planned.setsBase;
  const repsMeetPlan = !planned.repsBase || actual.maxReps >= planned.repsBase;
  const weightMeetPlan = !isNumber(planned.weight) || (isNumber(actual.maxWeight) && actual.maxWeight >= planned.weight);
  const weightExceededPlan = isNumber(planned.weight) && isNumber(actual.maxWeight) && actual.maxWeight > planned.weight;

  if (
    setsMeetPlan &&
    repsMeetPlan &&
    weightMeetPlan &&
    actual.totalSets === planned.setsBase &&
    actual.maxReps === planned.repsBase &&
    (!isNumber(planned.weight) || actual.maxWeight === planned.weight)
  ) {
    return { label: "Matched plan", explanation: "Actual sets, reps, and top weight matched the plan." };
  }
  if (setsMeetPlan && repsMeetPlan && weightMeetPlan && (actual.totalSets > planned.setsBase || actual.maxReps > planned.repsBase || weightExceededPlan)) {
    return { label: "Exceeded plan", explanation: "Actual execution met or exceeded the planned prescription." };
  }
  if (!setsMeetPlan || !repsMeetPlan || !weightMeetPlan) {
    return { label: "Below plan", explanation: "Actual execution landed below the planned prescription." };
  }
  return { label: "Matched plan", explanation: "Actual execution met the minimum planned prescription." };
}

function evaluateImprovementStatus(previous, current) {
  if (!previous) {
    return { label: "First logged week", explanation: "This is the first completed week for this exercise." };
  }
  if (
    isNumber(current.maxWeight) &&
    isNumber(previous.maxWeight) &&
    current.maxWeight > previous.maxWeight &&
    current.maxReps >= previous.maxReps - 2
  ) {
    return { label: "Improved", explanation: "You handled a heavier top weight without a major rep drop." };
  }
  if (current.maxWeight === previous.maxWeight && current.maxReps > previous.maxReps) {
    return { label: "Improved", explanation: "You hit more reps at the same top weight." };
  }
  if (current.maxWeight === previous.maxWeight && current.maxReps === previous.maxReps && current.totalSets > previous.totalSets) {
    return { label: "Improved", explanation: "You matched the top set and added more completed work." };
  }
  if (current.maxWeight === previous.maxWeight && current.maxReps === previous.maxReps && current.totalSets === previous.totalSets) {
    return { label: "Matched", explanation: "You repeated the previous week with the same output." };
  }
  if (
    (isNumber(current.maxWeight) && isNumber(previous.maxWeight) && current.maxWeight > previous.maxWeight) ||
    current.maxReps > previous.maxReps ||
    current.totalSets > previous.totalSets
  ) {
    return { label: "Partial / mixed", explanation: "One metric improved, but another dropped enough to make it mixed." };
  }
  return { label: "Below previous", explanation: "This week landed below the previous completed week." };
}

function weekdayName(weekday) {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][weekday - 1] || "Unknown";
}

function formatHumanDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function parseBlockDurationRange(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return { durationMin: null, durationMax: null };
  }

  const normalized = raw.toLowerCase().replace(/\s*mins?\.?\s*/g, "").trim();
  const rangeMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    return {
      durationMin: Number(rangeMatch[1]),
      durationMax: Number(rangeMatch[2]),
    };
  }

  return {
    durationMin: toNumberOrNull(normalized),
    durationMax: null,
  };
}

function formatBlockDuration(block) {
  const min = toNumberOrNull(block?.durationMin);
  const max = toNumberOrNull(block?.durationMax);
  if (isNumber(min) && isNumber(max)) {
    return `${formatNumber(min)}-${formatNumber(max)} mins`;
  }
  if (isNumber(min)) {
    return `${formatNumber(min)} mins`;
  }
  if (isNumber(max)) {
    return `${formatNumber(max)} mins`;
  }
  return "";
}

function parseBlockRestRange(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return { restSec: null, restMaxSec: null };
  }

  const normalized = raw.toLowerCase().replace(/\s*secs?\.?\s*/g, "s").replace(/\s+/g, "");
  const rangeMatch = normalized.match(/^(\d+(?:\.\d+)?)s?-(\d+(?:\.\d+)?)s?$/);
  if (rangeMatch) {
    return {
      restSec: Number(rangeMatch[1]),
      restMaxSec: Number(rangeMatch[2]),
    };
  }

  const singleMatch = normalized.match(/^(\d+(?:\.\d+)?)s?$/);
  return {
    restSec: singleMatch ? Number(singleMatch[1]) : null,
    restMaxSec: null,
  };
}

function formatBlockRest(block) {
  const min = toNumberOrNull(block?.restSec);
  const max = toNumberOrNull(block?.restMaxSec);
  if (isNumber(min) && isNumber(max)) {
    return `${formatNumber(min)}-${formatNumber(max)}s`;
  }
  if (isNumber(min)) {
    return `${formatNumber(min)}s`;
  }
  if (isNumber(max)) {
    return `${formatNumber(max)}s`;
  }
  return "";
}

function normalizeSetPrescription(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  const normalized = raw.replace(/\s+/g, "");
  if (/^\d+(?:-\d+)?$/.test(normalized)) {
    return normalized;
  }
  return raw;
}

function getDefaultActualSets(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }
  const firstNumber = raw.match(/\d+(?:\.\d+)?/);
  return firstNumber ? Number(firstNumber[0]) : null;
}

function normalizePlannedSession(session) {
  return {
    id: session.id || crypto.randomUUID(),
    date: normalizeDateInput(session.date) || formatDateInput(new Date()),
    type: ["run", "sprint", "strength"].includes(session.type) ? session.type : "run",
    title: typeof session.title === "string" && session.title.trim() ? session.title.trim() : "Planned session",
    source: session.source === "phase-generated" ? "phase-generated" : "manual",
    phaseTemplateId: typeof session.phaseTemplateId === "string" ? session.phaseTemplateId : "",
    phaseInstanceId: typeof session.phaseInstanceId === "string" ? session.phaseInstanceId : "",
    phaseSlotId: typeof session.phaseSlotId === "string" ? session.phaseSlotId : "",
    phaseWeekIndex: isNumber(session.phaseWeekIndex) ? Number(session.phaseWeekIndex) : null,
    generatedDate: normalizeDateInput(session.generatedDate) || "",
    dateMovedManually: Boolean(session.dateMovedManually),
    status: ["planned", "completed", "modified", "missed"].includes(session.status) ? session.status : "planned",
    notes: typeof session.notes === "string" ? session.notes : "",
    linkedWorkoutId: typeof session.linkedWorkoutId === "string" ? session.linkedWorkoutId : "",
    modificationNote: typeof session.modificationNote === "string" ? session.modificationNote : "",
    actual: session.actual || null,
    details: normalizePlannedDetails(session.type, session.details),
    createdAt: isNumber(session.createdAt) ? session.createdAt : Date.now(),
  };
}

function normalizePlannedDetails(type, details) {
  if (type === "run") {
    return {
      distance: toNumberOrNull(details?.distance),
      paceGoal: isNumber(details?.paceGoal) ? Number(details.paceGoal) : null,
    };
  }
  if (type === "sprint") {
    return {
      blocks: Array.isArray(details?.blocks)
        ? normalizePlannedSprintBlocks(details.blocks)
        : [],
    };
  }
  return {
    blocks: Array.isArray(details?.blocks)
      ? details.blocks.map((block) => ({
          label: block.label || "",
          durationMin: toNumberOrNull(block.durationMin),
          durationMax: toNumberOrNull(block.durationMax),
          restSec: toNumberOrNull(block.restSec),
          restMaxSec: toNumberOrNull(block.restMaxSec),
          sets: normalizeSetPrescription(block.sets),
          exercises: Array.isArray(block.exercises)
            ? block.exercises.map((exercise) => ({
                code: exercise.code || "",
                name: exercise.name || "Exercise",
                reps: exercise.reps || "",
                notes: exercise.notes || "",
                weight: toNumberOrNull(exercise.weight),
              }))
            : [],
        }))
      : [],
  };
}

function normalizePhaseTemplate(template) {
  return {
    id: template.id || crypto.randomUUID(),
    name: template.name || "Strength phase",
    durationWeeks: toNumberOrNull(template.durationWeeks) || 1,
    weekdaySlots: Array.isArray(template.weekdaySlots)
      ? template.weekdaySlots.map((slot) => ({
          id: slot.id || crypto.randomUUID(),
          weekday: toNumberOrNull(slot.weekday) || 1,
          title: slot.title || "Strength session",
          notes: typeof slot.notes === "string" ? slot.notes : "",
          blocks: normalizePlannedDetails("strength", { blocks: slot.blocks }).blocks,
        }))
      : [],
    importedAt: isNumber(template.importedAt) ? template.importedAt : Date.now(),
  };
}

function normalizePhaseInstance(instance) {
  return {
    id: instance.id || crypto.randomUUID(),
    templateId: instance.templateId || "",
    templateName: instance.templateName || "",
    startDate: normalizeDateInput(instance.startDate) || formatDateInput(new Date()),
    durationWeeks: toNumberOrNull(instance.durationWeeks) || 1,
    generatedSessionIds: Array.isArray(instance.generatedSessionIds) ? instance.generatedSessionIds : [],
    createdAt: isNumber(instance.createdAt) ? instance.createdAt : Date.now(),
  };
}

initializeV2();
