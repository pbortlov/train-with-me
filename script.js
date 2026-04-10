const STORAGE_KEY_WORKOUTS = "twm_workouts_v1";
const STORAGE_KEY_GOALS = "twm_goals_v1";

const workoutForm = document.getElementById("workout-form");
const goalsForm = document.getElementById("goals-form");
const historyBody = document.getElementById("history-body");
const summaryEl = document.getElementById("summary");
const goalProgressEl = document.getElementById("goal-progress");

const dateInput = document.getElementById("date");

dateInput.valueAsDate = new Date();

let workouts = load(STORAGE_KEY_WORKOUTS, []);
let goals = load(STORAGE_KEY_GOALS, {
  strength: null,
  run: null,
  sprint: null,
});

hydrateGoalInputs();
render();

workoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const workout = {
    id: crypto.randomUUID(),
    date: valueOf("date"),
    activity: valueOf("activity"),
    sets: toNumberOrNull(valueOf("sets")),
    reps: toNumberOrNull(valueOf("reps")),
    weight: toNumberOrNull(valueOf("weight")),
    distance: toNumberOrNull(valueOf("distance")),
    time: toNumberOrNull(valueOf("time")),
    pace: toNumberOrNull(valueOf("pace")),
    notes: valueOf("notes")?.trim() || "",
    createdAt: Date.now(),
  };

  workouts.unshift(workout);
  save(STORAGE_KEY_WORKOUTS, workouts);
  workoutForm.reset();
  dateInput.valueAsDate = new Date();
  render();
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
    .filter((w) => w.activity === "sprint" && isNumber(w.time))
    .reduce((min, w) => Math.min(min, w.time), Infinity);

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
      <span class="value">${Number.isFinite(bestSprintTime) ? `${bestSprintTime} min` : "-"}</span>
    </article>
  `;
}

function renderHistory() {
  if (!workouts.length) {
    historyBody.innerHTML = `<tr><td colspan="4">No workouts yet. Add your first one above.</td></tr>`;
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
    .filter((w) => w.activity === "sprint" && isNumber(w.time))
    .reduce((min, w) => Math.min(min, w.time), Infinity);

  goalProgressEl.innerHTML = `
    ${goalRow("Strength", currentStrength, goals.strength, "kg", true)}
    ${goalRow("Run distance", currentRun, goals.run, "km", true)}
    ${goalRow("Sprint time", Number.isFinite(currentSprint) ? currentSprint : null, goals.sprint, "min", false)}
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

  const parts = [
    isNumber(w.time) ? `${w.time} min` : null,
    isNumber(w.distance) ? `${w.distance} km` : null,
    isNumber(w.pace) ? `${w.pace} min/km` : null,
  ].filter(Boolean);
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
