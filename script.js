const STORAGE_KEY_WORKOUTS = "twm_workouts_v1";
const STORAGE_KEY_GOALS = "twm_goals_v1";
const STORAGE_KEY_EXERCISES = "twm_exercise_library_v1";

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

const dateInput = document.getElementById("date");

dateInput.valueAsDate = new Date();

let workouts = load(STORAGE_KEY_WORKOUTS, []);
let goals = load(STORAGE_KEY_GOALS, {
  strength: null,
  run: null,
  runPace: null,
  sprint: null,
});
let exerciseLibrary = load(STORAGE_KEY_EXERCISES, []);
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
let chartGrouping = "day";
let strengthChart = null;
let runChart = null;
let sprintChart = null;
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

  const workout = {
    id: editingWorkoutId ?? crypto.randomUUID(),
    date: valueOf("date"),
    activity: valueOf("activity"),
    strengthExercises: valueOf("activity") === "strength" ? normalizeStrengthExercises(draftStrengthExercises) : [],
    distance: toNumberOrNull(valueOf("distance")),
    time: toNumberOrNull(valueOf("time")),
    pace: toNumberOrNull(valueOf("pace")),
    sprintSets: valueOf("activity") === "sprint" ? normalizeSprintSets(draftSprintSets) : [],
    notes: valueOf("notes")?.trim() || "",
    createdAt: Date.now(),
  };

  if (workout.activity === "strength" && workout.strengthExercises.length === 0) {
    setWorkoutFormStatus("Please add at least one strength exercise before saving.");
    return;
  }

  if (workout.activity === "run" && !isNumber(workout.distance) && !isNumber(workout.time) && !isNumber(workout.pace)) {
    setWorkoutFormStatus("Please enter at least one run metric (distance, time, or pace).");
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
filterActivityInput.addEventListener("change", onFilterChange);
filterFromDateInput.addEventListener("change", onFilterChange);
filterToDateInput.addEventListener("change", onFilterChange);
filterStrengthLoadInput.addEventListener("change", onFilterChange);
clearFiltersButton.addEventListener("click", clearFilters);
chartGroupingInput.addEventListener("change", () => {
  chartGrouping = chartGroupingInput.value || "day";
  renderCharts();
});
exportDataButton.addEventListener("click", exportBackupData);
importDataFileInput.addEventListener("change", importBackupData);
confirmDeleteWorkoutButton.addEventListener("click", confirmDeleteWorkout);
cancelDeleteWorkoutButton.addEventListener("click", cancelDeleteWorkout);
addSafeEventListener(saveEditWorkoutButton, "click", saveEditedWorkout);
addSafeEventListener(cancelEditWorkoutButton, "click", closeEditWorkoutDialog);
addSafeEventListener(editAddStrengthSetButton, "click", addEditStrengthSet);
addSafeEventListener(editAddStrengthExerciseButton, "click", addEditStrengthExercise);
addSafeEventListener(editStrengthExercisesList, "input", handleInlineStrengthEdit);
addSafeEventListener(editStrengthExercisesList, "change", handleInlineStrengthEdit);
addSafeEventListener(editStrengthExercisesList, "click", handleInlineStrengthDelete);
addSafeEventListener(exerciseLibraryListEl, "click", handleExerciseLibraryClick);
addSafeEventListener(editStrengthLoadTypeInput, "change", () => {
  const loadType = editStrengthLoadTypeInput.value;
  editStrengthWeightInput.disabled = loadType !== "kg";
  editStrengthBandColorInput.disabled = loadType !== "band";
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
    editStrengthBandColorInput.value = "";
  }
});
installAppButton.addEventListener("click", installPwaApp);
strengthSetLoadTypeInput.addEventListener("change", () => {
  const loadType = strengthSetLoadTypeInput.value;
  strengthSetWeightInput.disabled = loadType !== "kg";
  strengthSetBandColorInput.disabled = loadType !== "band";
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
    strengthSetBandColorInput.value = "";
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
  document.getElementById("strength-set-band-color").value = "";
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
  const filteredWorkouts = getFilteredWorkouts();

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
      isNumber(w.time) ? `${w.time} min` : null,
      isNumber(w.pace) ? `${w.pace} min/km` : null,
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
  editTimeInput.value = workout.time ?? "";
  editPaceInput.value = workout.pace ?? "";
  editSprintSetsInput.value = formatSprintSetsForEditor(workout.sprintSets);
  editDraftStrengthExercises = normalizeStrengthExercises(workout.strengthExercises);
  editDraftCurrentStrengthSets = [];
  if (editExerciseNameInput) {
    editExerciseNameInput.value = "";
  }
  if (editStrengthRepsInput) {
    editStrengthRepsInput.value = "";
  }
  renderEditStrengthSets();
  renderEditStrengthExercises();
  toggleEditDialogFields(workout.activity);
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
  strengthSetBandColorInput.disabled = true;
  dateInput.valueAsDate = new Date();
  renderCurrentStrengthSets();
  renderStrengthExercises();
  renderSprintSets();
  updateVisibleFields();
  workoutSubmitButton.textContent = "Save Workout";
}

function updateVisibleFields() {
  const selectedActivity = valueOf("activity");

  activityFieldGroups.forEach((group) => {
    group.classList.toggle("is-hidden", group.dataset.activity !== selectedActivity);
  });
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

function renderCharts() {
  if (typeof Chart === "undefined") {
    chartsStatusEl.textContent = "Charts unavailable (Chart.js failed to load).";
    return;
  }

  chartsStatusEl.textContent = "";
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
}

function createOrUpdateChart(existingChart, canvas, points, unit, color) {
  if (!canvas) {
    return existingChart;
  }

  if (existingChart) {
    existingChart.destroy();
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

function groupChartPoints(points, mode) {
  if (mode === "day") {
    return points;
  }

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

  if (mode === "month") {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  if (mode === "week") {
    const firstDayOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - firstDayOfYear) / 86400000) + 1;
    const week = Math.ceil(dayOfYear / 7);
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  return dateText;
}

function exportBackupData() {
  const backupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    workouts,
    goals,
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

      save(STORAGE_KEY_WORKOUTS, workouts);
      save(STORAGE_KEY_GOALS, goals);
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
  editStrengthBandColorInput.value = "";
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
              <input type="text" data-role="set-band-color" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}" value="${
                set.bandColor || ""
              }" placeholder="band color" ${set.loadType !== "band" ? "disabled" : ""} />
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

  if (role === "set-band-color") {
    set.bandColor = target.value.trim();
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
  return {
    id: workout.id || crypto.randomUUID(),
    date: workout.date || "",
    activity: workout.activity || "run",
    strengthExercises: normalizeStrengthExercises(workout.strengthExercises),
    distance: toNumberOrNull(workout.distance),
    time: toNumberOrNull(workout.time),
    pace: toNumberOrNull(workout.pace),
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
