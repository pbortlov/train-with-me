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

hydrateGoalInputs();
updateVisibleFields();
renderSprintSets();
render();

workoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const workout = {
    id: editingWorkoutId ?? crypto.randomUUID(),
    date: valueOf("date"),
    activity: valueOf("activity"),
    exercise: valueOf("exercise")?.trim() || "",
    sets: toNumberOrNull(valueOf("sets")),
    reps: toNumberOrNull(valueOf("reps")),
    weight: toNumberOrNull(valueOf("weight")),
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
  renderHistory();
  renderGoals();
}

function renderSummary() {
  const bestStrength = workouts
    .filter((w) => w.activity === "strength" && isNumber(w.weight))
    .reduce((max, w) => Math.max(max, w.weight), 0);

  const bestRunDistance = workouts
    .filter((w) => w.activity === "run" && isNumber(w.distance))
    .reduce((max, w) => Math.max(max, w.distance), 0);

  const bestSprintTime = workouts
    .filter((w) => w.activity === "sprint")
    .map((w) => sprintBestTime(w))
    .filter((timeValue) => isNumber(timeValue))
    .reduce((min, timeValue) => Math.min(min, timeValue), Infinity);

  summaryEl.innerHTML = `
    <article class="badge">
      <span class="label">Workouts logged</span>
      <span class="value">${workouts.length}</span>
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
  if (!workouts.length) {
    historyBody.innerHTML = `<tr><td colspan="5">No workouts yet. Add your first one above.</td></tr>`;
    return;
  }

  historyBody.innerHTML = workouts
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
    .filter((w) => w.activity === "strength" && isNumber(w.weight))
    .reduce((max, w) => Math.max(max, w.weight), 0);

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
    const parts = [
      w.exercise ? `${escapeHtml(w.exercise)}` : null,
      isNumber(w.sets) ? `${w.sets} sets` : null,
      isNumber(w.reps) ? `${w.reps} reps` : null,
      isNumber(w.weight) ? `${w.weight} kg` : null,
    ].filter(Boolean);
    return parts.join(" • ") || "-";
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
  document.getElementById("exercise").value = workout.exercise ?? "";
  document.getElementById("sets").value = workout.sets ?? "";
  document.getElementById("reps").value = workout.reps ?? "";
  document.getElementById("weight").value = workout.weight ?? "";
  document.getElementById("distance").value = workout.distance ?? "";
  document.getElementById("time").value = workout.time ?? "";
  document.getElementById("pace").value = workout.pace ?? "";
  draftSprintSets = normalizeSprintSets(workout.sprintSets);
  document.getElementById("notes").value = workout.notes ?? "";
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
  workoutForm.reset();
  dateInput.valueAsDate = new Date();
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
