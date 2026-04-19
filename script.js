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
const plannedSprintBlocksInput = document.getElementById("planned-sprint-blocks");
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
const completionDialog = document.getElementById("completion-dialog");
const completionForm = document.getElementById("completion-form");
const completionSessionIdInput = document.getElementById("completion-session-id");
const completionStatusInput = document.getElementById("completion-status");
const completionDateInput = document.getElementById("completion-date");
const completionSessionTitleEl = document.getElementById("completion-session-title");
const completionRunFields = document.getElementById("completion-run-fields");
const completionRunDistanceInput = document.getElementById("completion-run-distance");
const completionRunTimeInput = document.getElementById("completion-run-time");
const completionRunPaceInput = document.getElementById("completion-run-pace");
const completionSprintFields = document.getElementById("completion-sprint-fields");
const completionSprintSetsInput = document.getElementById("completion-sprint-sets");
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
let editingPhaseTemplateId = "";
let pendingDeleteWorkoutId = null;
let deferredInstallPrompt = null;
let editingPopupWorkoutId = null;
let editDraftCurrentStrengthSets = [];
let editDraftStrengthExercises = [];

hydrateGoalInputs();
syncExerciseLibraryFromWorkouts();
renderExerciseLibrary();
updateVisibleFields();
renderSprintSets();
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
  renderPhaseTemplates();
  renderPhaseInstances();
  renderReview();
  renderAdherenceStats();
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
    return sprintSets.map((set) => `#${set.order} ${set.distance}m/${set.time}s`).join(" • ");
  }

  const parts = [isNumber(w.time) ? `${w.time} sec` : null, isNumber(w.distance) ? `${w.distance} m` : null].filter(Boolean);
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
  addSafeEventListener(calendarGridEl, "click", handleCalendarAction);
  addSafeEventListener(phaseImportFileInput, "change", loadPhaseImportFile);
  addSafeEventListener(phaseImportForm, "submit", importStrengthPhase);
  addSafeEventListener(cancelPhaseEditButton, "click", resetPhaseImportForm);
  addSafeEventListener(phaseTemplateListEl, "click", handlePhaseTemplateAction);
  addSafeEventListener(phaseInstanceListEl, "click", handlePhaseInstanceAction);
  addSafeEventListener(completionRunTimeInput, "input", syncCompletionRunPace);
  addSafeEventListener(completionRunTimeInput, "change", syncCompletionRunPace);
  addSafeEventListener(completionRunDistanceInput, "input", syncCompletionRunPace);
  addSafeEventListener(completionForm, "submit", saveCompletedSession);
  addSafeEventListener(cancelCompletionButton, "click", closeCompletionDialog);
}

function savePlannerCollections() {
  save(STORAGE_KEY_PLANNED_SESSIONS, plannedSessions);
  save(STORAGE_KEY_PHASE_TEMPLATES, phaseTemplates);
  save(STORAGE_KEY_PHASE_INSTANCES, phaseInstances);
  save(STORAGE_KEY_UI_SETTINGS, uiSettings);
}

function setCurrentView(view) {
  uiSettings.currentView = ["calendar", "phases", "review", "stats"].includes(view) ? view : "calendar";
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
  return `
    <article class="planned-session-card">
      <header>
        <div>
          <h5>${escapeHtml(session.title)}</h5>
          <div class="session-meta">${capitalize(session.type)} • ${escapeHtml(formatPlannedSessionSummary(session))}</div>
        </div>
        <span class="session-status status-${session.status}">${escapeHtml(session.status)}</span>
      </header>
      ${session.source === "phase-generated" ? `<div class="session-meta">From phase template</div>` : ""}
      ${session.notes ? `<div class="session-meta">${escapeHtml(session.notes)}</div>` : ""}
      <div class="session-actions">
        <button type="button" class="ghost-button" data-role="edit-planned-session" data-id="${session.id}">Edit</button>
        ${session.status === "planned"
          ? `<button type="button" data-role="complete-planned-session" data-id="${session.id}">Complete</button>
             <button type="button" class="ghost-button danger-button" data-role="miss-planned-session" data-id="${session.id}">Miss</button>`
          : `<button type="button" class="ghost-button" data-role="reset-planned-session" data-id="${session.id}">Reset</button>`}
        <button type="button" class="ghost-button danger-button" data-role="delete-planned-session" data-id="${session.id}">Delete</button>
      </div>
    </article>
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
    return blocks.map((block) => `${block.reps} x ${block.distance}m`).join(", ") || "planned sprint session";
  }

  const blocks = session.details?.blocks || [];
  const exerciseCount = blocks.flatMap((block) => block.exercises || []).length;
  const durationSummary = blocks.map((block) => formatBlockDuration(block)).filter(Boolean).join(", ");
  return [durationSummary, `${blocks.length} blocks • ${exerciseCount} exercises`].filter(Boolean).join(" • ");
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
  plannedSessionIdInput.value = "";
  plannedSessionDateInput.value = formatDateInput(new Date());
  plannedSessionTypeInput.value = "run";
  updatePlannedTypeFields();
  plannedSessionStatusEl.textContent = "";
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
          blocks: parseSprintPlanBlocks(plannedSprintBlocksInput.value),
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

function parseSprintPlanBlocks(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s*x\s*(\d+)\s*m$/i);
      if (!match) {
        return null;
      }
      return {
        reps: Number(match[1]),
        distance: Number(match[2]),
      };
    })
    .filter(Boolean);
}

function handleCalendarAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const role = target.dataset.role;
  const sessionId = target.dataset.id;
  if (!role || !sessionId) {
    return;
  }

  const session = plannedSessions.find((item) => item.id === sessionId);
  if (!session) {
    return;
  }

  if (role === "edit-planned-session") {
    fillPlannedSessionForm(session);
  }
  if (role === "delete-planned-session") {
    plannedSessions = plannedSessions.filter((item) => item.id !== sessionId);
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
    openCompletionDialog(session);
  }
}

function fillPlannedSessionForm(session) {
  plannedSessionIdInput.value = session.id;
  plannedSessionDateInput.value = session.date;
  plannedSessionTypeInput.value = session.type;
  plannedSessionTitleInput.value = session.title;
  plannedSessionNotesInput.value = session.notes || "";
  if (session.type === "run") {
    plannedRunDistanceInput.value = session.details?.distance ?? "";
    plannedRunPaceInput.value = isNumber(session.details?.paceGoal) ? formatGoalPace(session.details.paceGoal) : "";
  } else {
    plannedSprintBlocksInput.value = (session.details?.blocks || []).map((block) => `${block.reps} x ${block.distance}m`).join("\n");
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
        `BLOCK,${block.label || ""},${formatBlockDurationCsvValue(block)},${formatBlockRestCsvValue(block)},${block.sets ?? ""}`,
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
  const reviewedDates = new Set(reviewedSessions.map((session) => session.date));
  plannedSessions = plannedSessions.filter(
    (session) => !(session.phaseInstanceId === instance.id && session.source === "phase-generated" && session.status === "planned"),
  );

  const regeneratedSessions = buildPhaseSessions(template, instance.startDate, instance.id, reviewedDates);
  plannedSessions.push(...regeneratedSessions);

  return normalizePhaseInstance({
    ...instance,
    templateId: template.id,
    templateName: template.name,
    durationWeeks: template.durationWeeks,
    generatedSessionIds: [...reviewedSessions.map((session) => session.id), ...regeneratedSessions.map((session) => session.id)],
  });
}

function buildPhaseSessions(template, startDate, instanceId, reviewedDates = new Set()) {
  const generatedSessions = [];
  for (let weekIndex = 0; weekIndex < template.durationWeeks; weekIndex += 1) {
    template.weekdaySlots.forEach((slot) => {
      const monday = startOfWeek(startDate);
      monday.setDate(monday.getDate() + (weekIndex * 7) + (slot.weekday - 1));
      const sessionDate = formatDateInput(monday);
      if (reviewedDates.has(sessionDate)) {
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
          status: "planned",
          notes: slot.notes,
          details: { blocks: slot.blocks },
        }),
      );
    });
  }
  return generatedSessions;
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
        sets: toNumberOrNull(columns[4]),
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
          const blocks = slot.blocks || [];
          const blockMarkup = blocks.length
            ? `
              <ul class="phase-block-list">
                ${blocks
                  .map((block) => {
                    const exerciseSummary = (block.exercises || [])
                      .map((exercise) => {
                        const load = isNumber(exercise.weight) ? ` @ ${formatNumber(exercise.weight)} kg` : "";
                        const note = exercise.notes ? ` - ${escapeHtml(exercise.notes)}` : "";
                        return `${escapeHtml(exercise.code || "")} ${escapeHtml(exercise.name)} (${escapeHtml(exercise.reps || "-")}${load})${note}`.trim();
                      })
                      .join(", ");
                    const blockMeta = [formatBlockDuration(block), formatBlockRest(block) ? `${formatBlockRest(block)} rest` : "", isNumber(block.sets) ? `${formatNumber(block.sets)} sets` : ""]
                      .filter(Boolean)
                      .join(" • ");
                    return `
                      <li>
                        <strong>${escapeHtml(block.label || "Block")}</strong>
                        ${blockMeta ? `<div class="phase-meta">${blockMeta}</div>` : ""}
                        ${exerciseSummary ? `<div class="phase-training-line">${exerciseSummary}</div>` : ""}
                      </li>
                    `;
                  })
                  .join("")}
              </ul>
            `
            : `<p class="planner-empty">No blocks in this slot.</p>`;

          return `
            <article class="phase-training-card">
              <h5>${escapeHtml(weekdayName(slot.weekday))} • ${escapeHtml(slot.title)}</h5>
              ${slot.notes ? `<div class="phase-meta">${escapeHtml(slot.notes)}</div>` : ""}
              ${blockMarkup}
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
  completionSessionIdInput.value = session.id;
  completionDateInput.value = session.date;
  completionSessionTitleEl.textContent = `${session.title} • ${capitalize(session.type)}`;
  completionStatusInput.value = "completed";
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
    completionSprintSetsInput.value = "";
  }
  if (session.type === "strength") {
    renderCompletionStrengthBlocks(session);
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
  if (typeof completionDialog.close === "function") {
    completionDialog.close();
  } else {
    completionDialog.removeAttribute("open");
  }
}

function renderCompletionStrengthBlocks(session) {
  const blocks = session.details?.blocks || [];
  completionStrengthBlocksEl.innerHTML = blocks
    .map(
      (block, blockIndex) => `
        <div class="completion-block">
          <h4>Block ${escapeHtml(block.label || String(blockIndex + 1))}</h4>
          <div class="grid">
            <label>
              Actual sets
              <input type="number" min="0" data-role="completion-block-sets" data-block-index="${blockIndex}" value="${block.sets ?? ""}" />
            </label>
            <label>
              Block note
              <input type="text" data-role="completion-block-note" data-block-index="${blockIndex}" placeholder="Optional note" />
            </label>
          </div>
          <div class="completion-exercise-list">
            ${(block.exercises || [])
              .map(
                (exercise, exerciseIndex) => `
                  <div class="completion-exercise-row">
                    <label class="checkbox-label">
                      <input type="checkbox" data-role="completion-exercise-done" data-block-index="${blockIndex}" data-exercise-index="${exerciseIndex}" checked />
                      ${escapeHtml(exercise.code || "")} ${escapeHtml(exercise.name)}
                    </label>
                    <label>
                      Actual note
                      <input type="text" data-role="completion-exercise-note" data-block-index="${blockIndex}" data-exercise-index="${exerciseIndex}" placeholder="Optional change note" />
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
  const time = normalizeRunDurationInput(completionRunTimeInput.value);
  completionRunTimeInput.value = time;
  const pace = calculateRunPace(distance, parseRunDurationToSeconds(time));
  completionRunPaceInput.value = isNumber(pace) ? formatRunPace(pace) : "";
}

function saveCompletedSession(event) {
  event.preventDefault();
  const session = plannedSessions.find((item) => item.id === completionSessionIdInput.value);
  if (!session) {
    return;
  }
  const status = completionStatusInput.value === "modified" ? "modified" : "completed";
  const modificationNote = completionNoteInput.value.trim();
  let actual = null;
  try {
    if (session.type === "run") {
      const distance = toNumberOrNull(completionRunDistanceInput.value);
      const time = normalizeRunDurationInput(completionRunTimeInput.value);
      const pace = calculateRunPace(distance, parseRunDurationToSeconds(time));
      if (!isNumber(distance) || !time || !isNumber(pace)) {
        completionStatusMessageEl.textContent = "Run completion needs distance and time.";
        return;
      }
      actual = { distance, time, pace };
    }
    if (session.type === "sprint") {
      const sprintSets = parseSprintSetsFromEditor(completionSprintSetsInput.value);
      if (!sprintSets.length) {
        completionStatusMessageEl.textContent = "Sprint completion needs at least one actual set.";
        return;
      }
      actual = { sprintSets };
    }
    if (session.type === "strength") {
      actual = { blocks: collectCompletedStrengthBlocks(session) };
    }

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
  const blocks = session.details?.blocks || [];
  return blocks.map((block, blockIndex) => {
    const actualSetsInput = completionStrengthBlocksEl.querySelector(`[data-role="completion-block-sets"][data-block-index="${blockIndex}"]`);
    const blockNoteInput = completionStrengthBlocksEl.querySelector(`[data-role="completion-block-note"][data-block-index="${blockIndex}"]`);
    return {
      label: block.label,
      actualSets: toNumberOrNull(actualSetsInput?.value) ?? block.sets ?? null,
      note: blockNoteInput?.value?.trim() || "",
      exercises: (block.exercises || []).map((exercise, exerciseIndex) => {
        const doneInput = completionStrengthBlocksEl.querySelector(
          `[data-role="completion-exercise-done"][data-block-index="${blockIndex}"][data-exercise-index="${exerciseIndex}"]`,
        );
        const noteInput = completionStrengthBlocksEl.querySelector(
          `[data-role="completion-exercise-note"][data-block-index="${blockIndex}"][data-exercise-index="${exerciseIndex}"]`,
        );
        return {
          code: exercise.code,
          name: exercise.name,
          reps: exercise.reps,
          completed: Boolean(doneInput?.checked),
          actualNote: noteInput?.value?.trim() || "",
        };
      }),
    };
  });
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
      sets: [
        {
          reps: extractWorkoutRepCount(exercise.reps),
          loadType: "bodyweight",
          weight: null,
          bandColor: "",
        },
      ],
    }))
    .filter((exercise) => exercise.sets[0].reps > 0);
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
    return `<ul>${(session.details?.blocks || []).map((block) => `<li>${block.reps} x ${block.distance}m</li>`).join("")}</ul>`;
  }
  const notesMarkup = session.notes ? `<div class="review-meta">Slot notes: ${escapeHtml(session.notes)}</div>` : "";
  return `${notesMarkup}<ul>${(session.details?.blocks || [])
    .map(
      (block) =>
        `<li>${escapeHtml(block.label)}: ${[
          formatBlockDuration(block),
          formatBlockRest(block) ? `${formatBlockRest(block)} rest` : "",
          block.sets ? `${escapeHtml(String(block.sets))} sets` : "",
          (block.exercises || [])
            .map(
              (exercise) =>
                `${escapeHtml(exercise.code)} ${escapeHtml(exercise.name)} (${escapeHtml(exercise.reps || "-")}${
                  isNumber(exercise.weight) ? ` @ ${escapeHtml(formatNumber(exercise.weight))} kg` : ""
                })${exercise.notes ? ` - ${escapeHtml(exercise.notes)}` : ""}`,
            )
            .join(", "),
        ]
          .filter(Boolean)
          .join(" • ")}</li>`,
    )
    .join("")}</ul>`;
}

function renderActualDiff(session) {
  if (session.status === "missed") {
    return "<pre>Missed session.</pre>";
  }
  if (session.type === "run") {
    return `<pre>${escapeHtml(`${formatNumber(session.actual?.distance || 0)} km • ${session.actual?.time || ""} • ${formatRunPace(session.actual?.pace || 0)} min/km`)}</pre>`;
  }
  if (session.type === "sprint") {
    return `<ul>${(session.actual?.sprintSets || []).map((set) => `<li>${formatNumber(set.distance)}m in ${formatNumber(set.time)}s</li>`).join("")}</ul>`;
  }
  return `<ul>${(session.actual?.blocks || [])
    .map(
      (block) =>
        `<li>${escapeHtml(block.label)}: ${block.actualSets || "-"} sets • ${(block.exercises || [])
          .map((exercise) => `${escapeHtml(exercise.code)} ${exercise.completed ? "done" : "skipped"}${exercise.actualNote ? ` (${escapeHtml(exercise.actualNote)})` : ""}`)
          .join(", ")}</li>`,
    )
    .join("")}</ul>`;
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

function normalizePlannedSession(session) {
  return {
    id: session.id || crypto.randomUUID(),
    date: normalizeDateInput(session.date) || formatDateInput(new Date()),
    type: ["run", "sprint", "strength"].includes(session.type) ? session.type : "run",
    title: typeof session.title === "string" && session.title.trim() ? session.title.trim() : "Planned session",
    source: session.source === "phase-generated" ? "phase-generated" : "manual",
    phaseTemplateId: typeof session.phaseTemplateId === "string" ? session.phaseTemplateId : "",
    phaseInstanceId: typeof session.phaseInstanceId === "string" ? session.phaseInstanceId : "",
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
        ? details.blocks
            .map((block) => ({ reps: toNumberOrNull(block.reps), distance: toNumberOrNull(block.distance) }))
            .filter((block) => isNumber(block.reps) && isNumber(block.distance))
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
          sets: toNumberOrNull(block.sets),
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
