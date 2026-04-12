const STORAGE_KEY_WORKOUTS = "twm_workouts_v1";
const STORAGE_KEY_GOALS = "twm_goals_v1";

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
const strengthSetWeightInput = document.getElementById("strength-set-weight");
const strengthBodyweightInput = document.getElementById("strength-set-bodyweight");
const filterActivityInput = document.getElementById("filter-activity");
const filterFromDateInput = document.getElementById("filter-from-date");
const filterToDateInput = document.getElementById("filter-to-date");
const clearFiltersButton = document.getElementById("clear-filters");
const chartsStatusEl = document.getElementById("charts-status");
const strengthChartCanvas = document.getElementById("strength-chart");
const runChartCanvas = document.getElementById("run-chart");
const sprintChartCanvas = document.getElementById("sprint-chart");

const dateInput = document.getElementById("date");

dateInput.valueAsDate = new Date();

let workouts = load(STORAGE_KEY_WORKOUTS, []);
let goals = load(STORAGE_KEY_GOALS, {
  strength: null,
  run: null,
  sprint: null,
});
let editingWorkoutId = null;
let draftSprintSets = [];
let draftStrengthExercises = [];
let draftCurrentStrengthSets = [];
let progressFilters = {
  activity: "all",
  fromDate: "",
  toDate: "",
};
let strengthChart = null;
let runChart = null;
let sprintChart = null;

hydrateGoalInputs();
updateVisibleFields();
renderSprintSets();
renderCurrentStrengthSets();
renderStrengthExercises();
render();

workoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

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
  render();
});

activityInput.addEventListener("change", updateVisibleFields);
filterActivityInput.addEventListener("change", onFilterChange);
filterFromDateInput.addEventListener("change", onFilterChange);
filterToDateInput.addEventListener("change", onFilterChange);
clearFiltersButton.addEventListener("click", clearFilters);
strengthBodyweightInput.addEventListener("change", () => {
  strengthSetWeightInput.disabled = strengthBodyweightInput.checked;
  if (strengthBodyweightInput.checked) {
    strengthSetWeightInput.value = "";
  }
});

addSprintSetButton.addEventListener("click", () => {
  const sprintTime = toNumberOrNull(valueOf("sprint-time-sec"));
  const sprintDistance = toNumberOrNull(valueOf("sprint-distance-m"));

  if (!isNumber(sprintTime) || !isNumber(sprintDistance)) {
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
});

addStrengthSetButton.addEventListener("click", () => {
  const reps = toNumberOrNull(valueOf("strength-set-reps"));
  const weight = toNumberOrNull(valueOf("strength-set-weight"));
  const isBodyWeight = document.getElementById("strength-set-bodyweight").checked;

  if (!isNumber(reps)) {
    return;
  }

  if (!isBodyWeight && !isNumber(weight)) {
    return;
  }

  draftCurrentStrengthSets.push({
    reps,
    weight: isBodyWeight ? null : weight,
    isBodyWeight,
  });

  document.getElementById("strength-set-reps").value = "";
  document.getElementById("strength-set-weight").value = "";
  document.getElementById("strength-set-bodyweight").checked = false;
  renderCurrentStrengthSets();
});

addStrengthExerciseButton.addEventListener("click", () => {
  const exerciseName = valueOf("exercise-name").trim();
  if (!exerciseName || !draftCurrentStrengthSets.length) {
    return;
  }

  draftStrengthExercises.push({
    name: exerciseName,
    sets: draftCurrentStrengthSets.map((set, index) => ({
      order: index + 1,
      reps: set.reps,
      weight: set.weight,
      isBodyWeight: Boolean(set.isBodyWeight),
    })),
  });

  draftCurrentStrengthSets = [];
  document.getElementById("exercise-name").value = "";
  renderCurrentStrengthSets();
  renderStrengthExercises();
});

goalsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  goals = {
    strength: toNumberOrNull(valueOf("goal-strength")),
    run: toNumberOrNull(valueOf("goal-run")),
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
    deleteWorkout(id);
    return;
  }

  if (action === "edit") {
    startEditingWorkout(id);
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

  const currentSprint = workouts
    .filter((w) => w.activity === "sprint")
    .map((w) => sprintBestTime(w))
    .filter((timeValue) => isNumber(timeValue))
    .reduce((min, timeValue) => Math.min(min, timeValue), Infinity);

  goalProgressEl.innerHTML = `
    ${goalRow("Strength", currentStrength, goals.strength, "kg", true)}
    ${goalRow("Run distance", currentRun, goals.run, "km", true)}
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
      <strong>${label}:</strong> ${formatNumber(safeCurrent)} / ${formatNumber(goal)} ${unit}
      <div class="progress-bar"><span style="width:${percent.toFixed(0)}%"></span></div>
    </div>
  `;
}

function hydrateGoalInputs() {
  document.getElementById("goal-strength").value = goals.strength ?? "";
  document.getElementById("goal-run").value = goals.run ?? "";
  document.getElementById("goal-sprint").value = goals.sprint ?? "";
}

function formatMainMetric(w) {
  if (w.activity === "strength") {
    const exercises = normalizeStrengthExercises(w.strengthExercises);
    if (exercises.length) {
      return exercises
        .map((exercise) => {
          const setSummary = exercise.sets
            .map((set) => `${set.reps} reps @ ${set.isBodyWeight ? "body weight" : `${set.weight}kg`}`)
            .join(", ");
          return `${escapeHtml(exercise.name)} (${setSummary})`;
        })
        .join(" • ");
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

function startEditingWorkout(workoutId) {
  const workout = workouts.find((item) => item.id === workoutId);
  if (!workout) {
    return;
  }

  editingWorkoutId = workoutId;
  document.getElementById("date").value = workout.date ?? "";
  document.getElementById("activity").value = workout.activity ?? "strength";
  draftStrengthExercises = normalizeStrengthExercises(workout.strengthExercises);
  draftCurrentStrengthSets = [];
  document.getElementById("exercise-name").value = "";
  document.getElementById("strength-set-reps").value = "";
  document.getElementById("strength-set-weight").value = "";
  document.getElementById("strength-set-bodyweight").checked = false;
  strengthSetWeightInput.disabled = false;
  document.getElementById("distance").value = workout.distance ?? "";
  document.getElementById("time").value = workout.time ?? "";
  document.getElementById("pace").value = workout.pace ?? "";
  draftSprintSets = normalizeSprintSets(workout.sprintSets);
  document.getElementById("notes").value = workout.notes ?? "";
  renderCurrentStrengthSets();
  renderStrengthExercises();
  renderSprintSets();
  updateVisibleFields();
  workoutSubmitButton.textContent = "Update Workout";
  workoutForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteWorkout(workoutId) {
  workouts = workouts.filter((workout) => workout.id !== workoutId);

  if (editingWorkoutId === workoutId) {
    resetWorkoutForm();
  }

  save(STORAGE_KEY_WORKOUTS, workouts);
  render();
}

function resetWorkoutForm() {
  editingWorkoutId = null;
  draftSprintSets = [];
  draftStrengthExercises = [];
  draftCurrentStrengthSets = [];
  workoutForm.reset();
  strengthSetWeightInput.disabled = false;
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
  };
  render();
}

function clearFilters() {
  filterActivityInput.value = "all";
  filterFromDateInput.value = "";
  filterToDateInput.value = "";
  onFilterChange();
}

function getFilteredWorkouts() {
  return workouts.filter((workout) => {
    const activityMatch = progressFilters.activity === "all" || workout.activity === progressFilters.activity;
    const dateValue = workout.date || "";
    const fromMatch = !progressFilters.fromDate || (dateValue && dateValue >= progressFilters.fromDate);
    const toMatch = !progressFilters.toDate || (dateValue && dateValue <= progressFilters.toDate);
    return activityMatch && fromMatch && toMatch;
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
    .filter((workout) => workout.activity === "run" && isNumber(workout.distance))
    .map((workout) => ({ x: workout.date, y: workout.distance }))
    .filter((point) => point.x);
  const sprintData = filteredWorkouts
    .filter((workout) => workout.activity === "sprint")
    .map((workout) => ({ x: workout.date, y: sprintBestTime(workout) }))
    .filter((point) => point.x && isNumber(point.y));

  strengthChart = createOrUpdateChart(strengthChart, strengthChartCanvas, strengthData, "kg", "#2f6fed");
  runChart = createOrUpdateChart(runChart, runChartCanvas, runData, "km", "#16a34a");
  sprintChart = createOrUpdateChart(sprintChart, sprintChartCanvas, sprintData, "sec", "#b42318");
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
        y: { title: { display: true, text: unit }, beginAtZero: true },
      },
    },
  });
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
        .filter((set) => isNumber(set?.reps) && (Boolean(set?.isBodyWeight) || isNumber(set?.weight)))
        .map((set, index) => ({
          order: index + 1,
          reps: Number(set.reps),
          weight: Boolean(set.isBodyWeight) ? null : Number(set.weight),
          isBodyWeight: Boolean(set.isBodyWeight),
        })),
    }))
    .filter((exercise) => exercise.sets.length > 0);
}

function renderCurrentStrengthSets() {
  if (!draftCurrentStrengthSets.length) {
    currentStrengthSetsList.innerHTML = "<li>No sets added yet.</li>";
    return;
  }

  currentStrengthSetsList.innerHTML = draftCurrentStrengthSets
    .map(
      (set, index) =>
        `<li>Set #${index + 1}: ${set.reps} reps @ ${set.isBodyWeight ? "body weight" : `${formatNumber(set.weight)} kg`}</li>`,
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
        .map((set) => `#${set.order}: ${set.reps} reps @ ${set.isBodyWeight ? "body weight" : `${formatNumber(set.weight)} kg`}`)
        .join(", ");
      return `<li>${exerciseIndex + 1}. ${escapeHtml(exercise.name)} — ${setSummary}</li>`;
    })
    .join("");
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
