import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type AuthMode = "login" | "register";
type CloudView = "calendar" | "programs" | "review" | "stats" | "data";
type AddTrainingMode = "log" | "plan";
type Activity = "strength" | "run" | "sprint";
type PlannedType = "run" | "sprint";
type CalendarSelection = { type: "workout" | "planned"; id: string } | null;

type User = {
  id: string;
  email: string;
  display_name: string;
};

type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

type TrainingSpace = {
  id: string;
  name: string;
  owner_user_id: string;
  my_role: string;
};

type WorkoutSet = {
  order: number;
  reps: number;
  weight: number | null;
  load_type: string;
  band_color: string;
};

type StrengthExercise = {
  order: number;
  name: string;
  sets: WorkoutSet[];
};

type SprintSet = {
  order: number;
  distance_m: number;
  time_sec: number;
};

type Workout = {
  id: string;
  activity: string;
  date: string;
  distance: number | null;
  time: string | null;
  pace: number | null;
  sprint_feeling: string | null;
  sprint_sets: SprintSet[];
  strength_exercises: StrengthExercise[];
  notes: string;
  source: string;
  coach_editable: boolean;
  original_v1_id: string | null;
};

type PlannedSession = {
  id: string;
  type: string;
  title: string;
  date: string;
  phase_template_id: string;
  phase_instance_id: string;
  phase_slot_id: string;
  phase_week_index: number | null;
  generated_date: string | null;
  date_moved_manually: boolean;
  modification_note: string;
  actual_json: Record<string, unknown> | null;
  details_json: Record<string, unknown>;
  linked_workout_id: string | null;
  status: string;
  source: string;
  coach_editable: boolean;
  original_v1_id: string | null;
};

type CoachInvite = {
  token: string;
  training_space_id: string;
  training_space_name: string;
  expires_at: string;
  accepted_at: string | null;
};

type CoachInviteAcceptResponse = {
  training_space_id: string;
  training_space_name: string;
  role: string;
};

type CoachSuggestion = {
  id: string;
  training_space_id: string;
  target_entity_type: string;
  target_entity_id: string;
  suggested_change_json: Record<string, unknown>;
  status: string;
  created_by_user_id: string;
  resolved_by_user_id: string | null;
  resolved_at: string | null;
  created_at: string;
};

type TrainingGoal = {
  id: string;
  training_space_id: string;
  activity: string;
  target_json: Record<string, unknown>;
  notes: string;
  created_at: string;
  updated_at: string;
};

type ProgramTemplate = {
  id: string;
  training_space_id: string;
  name: string;
  duration_weeks: number;
  template_json: Record<string, unknown>;
  notes: string;
  created_at: string;
  updated_at: string;
};

type ProgramInstance = {
  id: string;
  training_space_id: string;
  template_id: string;
  template_name: string;
  start_date: string;
  duration_weeks: number;
  generated_session_ids: string[];
  created_at: string;
};

type StrengthCompletionSetDraft = {
  id: string;
  reps: string;
  load_type: string;
  weight: string;
  band_color: string;
};

type StrengthCompletionExerciseDraft = {
  code: string;
  name: string;
  planned_reps: string;
  planned_weight: number | null;
  completed: boolean;
  actual_sets: StrengthCompletionSetDraft[];
};

type StrengthCompletionBlockDraft = {
  label: string;
  planned_sets: string;
  exercises: StrengthCompletionExerciseDraft[];
};

type ProgramExerciseDraft = {
  code: string;
  name: string;
  reps: string;
  notes: string;
  weight: number | null;
};

type ProgramBlockDraft = {
  id: string;
  label: string;
  sets: string;
  exercises: ProgramExerciseDraft[];
};

type ProgramSlotDraft = {
  id: string;
  weekday: number;
  title: string;
  notes: string;
  blocks: ProgramBlockDraft[];
};

type V1BackupSummary = {
  version: number | null;
  exportedAt: string | null;
  workoutCount: number;
  plannedSessionCount: number;
  goalCount: number;
  phaseTemplateCount: number;
  phaseInstanceCount: number;
};

type V1ImportPreview = {
  valid: boolean;
  summary: V1BackupSummary | null;
  warnings: string[];
  unsupportedFields: string[];
};

type V1ImportCommit = {
  importedWorkoutCount: number;
  existingWorkoutCount: number;
  importedPlannedSessionCount: number;
  existingPlannedSessionCount: number;
  importedGoalCount: number;
  importedPhaseTemplateCount: number;
  importedPhaseInstanceCount: number;
  warnings: string[];
};

type V1Backfill = {
  linkedPlannedSessionCount: number;
};

type ImportedV1Metadata = {
  id: string;
  entityType: string;
  originalV1Id: string;
  payload: Record<string, unknown>;
};

type ProgramProgressModel = {
  id: string;
  name: string;
  startDate: string;
  total: number;
  completed: number;
  modified: number;
  missed: number;
  planned: number;
  weeks: {
    label: string;
    total: number;
    completed: number;
    modified: number;
    missed: number;
    planned: number;
    sessions: PlannedSession[];
  }[];
};

type ChartPoint = {
  label: string;
  value: number;
  meta?: string;
};

type V1Goal = {
  id?: string;
  activity?: string;
  type?: string;
  setAt?: string;
  achievedAt?: string;
  target?: Record<string, unknown>;
};

type ApiErrorPayload = {
  detail?: {
    error?: {
      message?: string;
    };
  };
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const tokenStorageKey = "twm_cloud_access_token";
const cloudViews: { id: CloudView; label: string }[] = [
  { id: "calendar", label: "Calendar" },
  { id: "programs", label: "Programs" },
  { id: "review", label: "Review" },
  { id: "stats", label: "Stats" },
  { id: "data", label: "Data" },
];

function formatDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

function dateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(value: Date): Date {
  const next = new Date(value);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function parseDurationSeconds(value: string): number | null {
  const parts = value.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) {
    return null;
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return null;
}

function runPace(distance: number, time: string): number | null {
  const seconds = parseDurationSeconds(time);
  if (!seconds || distance <= 0) {
    return null;
  }
  return seconds / 60 / distance;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function activityLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function activityClassName(value: string): string {
  return ["run", "sprint", "strength"].includes(value) ? `activity-${value}` : "activity-other";
}

function statusClassName(value: string): string {
  return ["planned", "completed", "modified", "missed"].includes(value) ? `status-${value}` : "status-other";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value != null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function asGoal(value: unknown): V1Goal | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }
  const target = asRecord(record.target) ?? {};
  return {
    id: typeof record.id === "string" ? record.id : undefined,
    activity: typeof record.activity === "string" ? record.activity : undefined,
    type: typeof record.type === "string" ? record.type : undefined,
    setAt: typeof record.setAt === "string" ? record.setAt : undefined,
    achievedAt: typeof record.achievedAt === "string" ? record.achievedAt : undefined,
    target,
  };
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatGoalTarget(goal: V1Goal): string {
  const distance = numberValue(goal.target?.distance);
  const time = numberValue(goal.target?.time);
  const pace = numberValue(goal.target?.pace);

  if (goal.activity === "run" && goal.type === "combined" && distance != null && typeof goal.target?.time === "string") {
    return `${formatNumber(distance)} km under ${goal.target.time}`;
  }
  if (goal.activity === "run" && goal.type === "distance" && distance != null) {
    return `${formatNumber(distance)} km`;
  }
  if (goal.activity === "run" && goal.type === "pace" && pace != null) {
    return `Below ${formatNumber(pace)} min/km`;
  }
  if (goal.activity === "sprint" && time != null) {
    return distance != null
      ? `${formatNumber(distance)} m under ${formatNumber(time)} sec`
      : `Under ${formatNumber(time)} sec`;
  }
  return "Goal target";
}

function formatGoalProgress(goal: V1Goal, workouts: Workout[]): string {
  const since = goal.setAt ?? "0000-01-01";
  if (goal.activity === "run" && goal.type === "distance") {
    const longestRun = workouts
      .filter((workout) => workout.activity === "run" && workout.date >= since && workout.distance != null)
      .reduce((best, workout) => Math.max(best, workout.distance ?? 0), 0);
    return longestRun ? `Best so far: ${formatNumber(longestRun)} km` : "No matching run yet";
  }
  if (goal.activity === "run" && goal.type === "pace") {
    const bestPace = workouts
      .filter((workout) => workout.activity === "run" && workout.date >= since && workout.pace != null)
      .reduce((best, workout) => Math.min(best, workout.pace ?? best), Number.POSITIVE_INFINITY);
    return Number.isFinite(bestPace) ? `Best so far: ${formatNumber(bestPace)} min/km` : "No matching run yet";
  }
  if (goal.activity === "run" && goal.type === "combined") {
    const targetDistance = numberValue(goal.target?.distance);
    const matchingRuns = workouts.filter((workout) => (
      workout.activity === "run"
      && workout.date >= since
      && workout.distance != null
      && (targetDistance == null || workout.distance >= targetDistance)
    ));
    return matchingRuns.length ? `${matchingRuns.length} matching run(s)` : "No matching run yet";
  }
  if (goal.activity === "sprint") {
    const targetDistance = numberValue(goal.target?.distance);
    const bestSprint = workouts
      .filter((workout) => workout.activity === "sprint" && workout.date >= since)
      .flatMap((workout) => workout.sprint_sets)
      .filter((set) => targetDistance == null || set.distance_m === targetDistance)
      .reduce((best, set) => Math.min(best, set.time_sec), Number.POSITIVE_INFINITY);
    return Number.isFinite(bestSprint) ? `Best so far: ${formatNumber(bestSprint)} sec` : "No matching sprint yet";
  }
  return "Progress unavailable";
}

function formatCloudGoal(goal: TrainingGoal): string {
  const distance = numberValue(goal.target_json.distance);
  const time = typeof goal.target_json.time === "string" ? goal.target_json.time : "";
  const weight = numberValue(goal.target_json.weight);
  const sprintTime = numberValue(goal.target_json.timeSec);
  const sprintDistance = numberValue(goal.target_json.distanceM);

  if (goal.activity === "strength" && weight != null) {
    return `${formatNumber(weight)} kg`;
  }
  if (goal.activity === "run" && distance != null) {
    return time ? `${formatNumber(distance)} km under ${time}` : `${formatNumber(distance)} km`;
  }
  if (goal.activity === "sprint" && sprintTime != null) {
    return sprintDistance != null
      ? `${formatNumber(sprintDistance)} m under ${formatNumber(sprintTime)} sec`
      : `Under ${formatNumber(sprintTime)} sec`;
  }
  return "Goal target";
}

function summarizeWorkout(workout: Workout): string {
  if (workout.activity === "run") {
    return [
      workout.distance != null ? `${formatNumber(workout.distance)} km` : null,
      workout.time,
      workout.pace != null ? `${formatNumber(workout.pace)} min/km` : null,
    ].filter(Boolean).join(" • ");
  }
  if (workout.activity === "sprint") {
    return workout.sprint_sets.length
      ? workout.sprint_sets.map((set) => `${formatNumber(set.distance_m)}m/${formatNumber(set.time_sec)}s`).join(" • ")
      : workout.sprint_feeling ?? "";
  }
  if (workout.activity === "strength") {
    return workout.strength_exercises.map((exercise) => `${exercise.name} ${exercise.sets.length} set(s)`).join(" • ");
  }
  return workout.notes;
}

function formatStrengthSet(set: WorkoutSet): string {
  if (set.load_type === "kg" && set.weight != null) {
    return `${set.reps} reps @ ${formatNumber(set.weight)} kg`;
  }
  if (set.load_type === "bodyweight") {
    return `${set.reps} reps @ body weight`;
  }
  if (set.load_type === "band") {
    return `${set.reps} reps @ ${set.band_color || "band"}`;
  }
  return `${set.reps} reps`;
}

function maxStrengthLoad(workout: Workout): number {
  return workout.strength_exercises
    .flatMap((exercise) => exercise.sets)
    .filter((set) => set.load_type === "kg" && set.weight != null)
    .reduce((best, set) => Math.max(best, set.weight ?? 0), 0);
}

function weekBucketLabel(dateValue: string): string {
  const parsed = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? dateValue
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function weekdayLabel(value: number): string {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][value - 1] ?? "Day";
}

function MiniBarChart({ points, unit }: { points: ChartPoint[]; unit: string }) {
  const maxValue = points.reduce((max, point) => Math.max(max, point.value), 0);

  if (!points.length || maxValue <= 0) {
    return <p className="empty-state">No chart data yet.</p>;
  }

  return (
    <div className="mini-chart" role="img" aria-label={`${unit} chart`}>
      {points.map((point) => (
        <div className="mini-chart-row" key={`${point.label}-${point.meta ?? ""}`}>
          <div className="mini-chart-label">
            <strong>{point.label}</strong>
            {point.meta && <span>{point.meta}</span>}
          </div>
          <div className="mini-chart-track">
            <span style={{ width: `${Math.max(4, (point.value / maxValue) * 100)}%` }} />
          </div>
          <span className="mini-chart-value">{formatNumber(point.value)} {unit}</span>
        </div>
      ))}
    </div>
  );
}

function summarizePlanDetails(session: PlannedSession): string {
  if (session.type === "run") {
    const distance = session.details_json.distance;
    const paceGoal = session.details_json.paceGoal;
    return [
      typeof distance === "number" ? `${formatNumber(distance)} km` : null,
      typeof paceGoal === "number" ? `${formatNumber(paceGoal)} min/km` : null,
    ].filter(Boolean).join(" • ");
  }
  const blocks = session.details_json.blocks;
  if (Array.isArray(blocks)) {
    return `${blocks.length} block(s)`;
  }
  return "No details";
}

function firstSprintBlock(session: PlannedSession): Record<string, unknown> {
  const blocks = session.details_json.blocks;
  return Array.isArray(blocks) ? asRecord(blocks[0]) ?? {} : {};
}

function strengthPlanPreview(session: PlannedSession): string {
  const exercises = plannedStrengthBlocks(session).flatMap((block) => plannedExerciseRows(block));
  return exercises
    .slice(0, 3)
    .map((exercise) => {
      const name = typeof exercise.name === "string" ? exercise.name : "Exercise";
      const reps = exercise.reps ? ` ${String(exercise.reps)}` : "";
      return `${name}${reps}`;
    })
    .join(" • ");
}

function plannedStrengthBlocks(session: PlannedSession): Record<string, unknown>[] {
  const blocks = session.details_json.blocks;
  return Array.isArray(blocks)
    ? blocks.map(asRecord).filter((block): block is Record<string, unknown> => Boolean(block))
    : [];
}

function defaultSetCount(value: unknown): number {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function plannedExerciseRows(block: Record<string, unknown>): Record<string, unknown>[] {
  const exercises = block.exercises;
  return Array.isArray(exercises)
    ? exercises.map(asRecord).filter((exercise): exercise is Record<string, unknown> => Boolean(exercise))
    : [];
}

function buildStrengthCompletionDraft(session: PlannedSession): StrengthCompletionBlockDraft[] {
  return plannedStrengthBlocks(session).map((block, blockIndex) => {
    const plannedSets = String(block.sets ?? "");
    const setCount = defaultSetCount(plannedSets);
    return {
      label: typeof block.label === "string" && block.label ? block.label : `Block ${blockIndex + 1}`,
      planned_sets: plannedSets,
      exercises: plannedExerciseRows(block).map((exercise) => {
        const reps = String(exercise.reps ?? "");
        const weight = typeof exercise.weight === "number" ? exercise.weight : null;
        return {
          code: typeof exercise.code === "string" ? exercise.code : "",
          name: typeof exercise.name === "string" && exercise.name ? exercise.name : "Exercise",
          planned_reps: reps,
          planned_weight: weight,
          completed: true,
          actual_sets: Array.from({ length: setCount }, () => ({
            id: crypto.randomUUID(),
            reps: reps.match(/\d+/)?.[0] ?? "",
            load_type: "kg",
            weight: weight != null ? String(weight) : "",
            band_color: "",
          })),
        };
      }),
    };
  });
}

function normalizeProgramSlotDrafts(value: unknown): ProgramSlotDraft[] {
  return Array.isArray(value)
    ? value.map(asRecord).filter((slot): slot is Record<string, unknown> => Boolean(slot)).map((slot, slotIndex) => ({
      id: typeof slot.id === "string" ? slot.id : crypto.randomUUID(),
      weekday: typeof slot.weekday === "number" ? slot.weekday : 1,
      title: typeof slot.title === "string" ? slot.title : `Strength ${slotIndex + 1}`,
      notes: typeof slot.notes === "string" ? slot.notes : "",
      blocks: Array.isArray(slot.blocks)
        ? slot.blocks.map(asRecord).filter((block): block is Record<string, unknown> => Boolean(block)).map((block, blockIndex) => ({
          id: typeof block.id === "string" ? block.id : crypto.randomUUID(),
          label: typeof block.label === "string" ? block.label : `Block ${blockIndex + 1}`,
          sets: typeof block.sets === "string" ? block.sets : String(block.sets ?? ""),
          exercises: Array.isArray(block.exercises)
            ? block.exercises.map(asRecord).filter((exercise): exercise is Record<string, unknown> => Boolean(exercise)).map((exercise, exerciseIndex) => ({
              code: typeof exercise.code === "string" ? exercise.code : `E${exerciseIndex + 1}`,
              name: typeof exercise.name === "string" ? exercise.name : "Exercise",
              reps: typeof exercise.reps === "string" ? exercise.reps : String(exercise.reps ?? ""),
              notes: typeof exercise.notes === "string" ? exercise.notes : "",
              weight: typeof exercise.weight === "number" ? exercise.weight : null,
            }))
            : [],
        }))
        : [],
    }))
    : [];
}

function strengthCompletionPayload(blocks: StrengthCompletionBlockDraft[]): {
  actualJson: Record<string, unknown>;
  strengthExercises: { name: string; sets: { reps: number; weight: number | null; load_type: string; band_color: string }[] }[];
  isModified: boolean;
} {
  let isModified = false;
  const actualBlocks = blocks.map((block) => ({
    label: block.label,
    plannedSets: block.planned_sets,
    actualSets: block.exercises.reduce((max, exercise) => Math.max(max, exercise.actual_sets.length), 0),
    exercises: block.exercises.map((exercise) => {
      const validSets = exercise.actual_sets
        .map((set, index) => ({
          order: index + 1,
          reps: Number(set.reps),
          loadType: set.load_type,
          weight: set.load_type === "kg" && set.weight ? Number(set.weight) : null,
          bandColor: set.load_type === "band" ? set.band_color : "",
        }))
        .filter((set) => Number.isFinite(set.reps) && set.reps >= 0);
      const plannedReps = Number(exercise.planned_reps.match(/\d+/)?.[0] ?? 0);
      const belowPlannedLoad = validSets.some((set) => (
        (plannedReps > 0 && set.reps < plannedReps)
        || (exercise.planned_weight != null && (set.loadType !== "kg" || set.weight == null || set.weight < exercise.planned_weight))
      ));
      if (!exercise.completed || validSets.length < defaultSetCount(block.planned_sets) || belowPlannedLoad) {
        isModified = true;
      }
      return {
        code: exercise.code,
        name: exercise.name,
        reps: exercise.planned_reps,
        completed: exercise.completed,
        actualSets: validSets,
      };
    }),
  }));
  const strengthExercises = actualBlocks
    .flatMap((block) => block.exercises)
    .filter((exercise) => exercise.completed)
    .map((exercise) => ({
      name: exercise.name,
      sets: exercise.actualSets.map((set) => ({
        reps: set.reps,
        weight: set.weight,
        load_type: set.loadType,
        band_color: set.bandColor,
      })),
    }))
    .filter((exercise) => exercise.sets.length > 0);

  return { actualJson: { blocks: actualBlocks }, strengthExercises, isModified };
}

function suggestionNotes(suggestion: CoachSuggestion): string {
  const notes = suggestion.suggested_change_json.notes;
  return typeof notes === "string" ? notes : "";
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.detail?.error?.message ?? `Request failed with HTTP ${response.status}.`;
  } catch {
    return `Request failed with HTTP ${response.status}.`;
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return await response.json() as T;
}

export function App() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey) ?? "");
  const [user, setUser] = useState<User | null>(null);
  const [spaces, setSpaces] = useState<TrainingSpace[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const [spaceStatus, setSpaceStatus] = useState("");
  const [activeView, setActiveView] = useState<CloudView>("calendar");
  const [addTrainingMode, setAddTrainingMode] = useState<AddTrainingMode>("log");
  const [actualActivity, setActualActivity] = useState<Activity>("strength");
  const [plannedType, setPlannedType] = useState<PlannedType>("run");
  const [strengthDraftExercises, setStrengthDraftExercises] = useState<StrengthExercise[]>([]);
  const [strengthExerciseName, setStrengthExerciseName] = useState("");
  const [strengthReps, setStrengthReps] = useState("");
  const [strengthLoadType, setStrengthLoadType] = useState("kg");
  const [strengthWeight, setStrengthWeight] = useState("");
  const [strengthBandColor, setStrengthBandColor] = useState("");
  const [programSlotDrafts, setProgramSlotDrafts] = useState<ProgramSlotDraft[]>([]);
  const [strengthCompletionDraft, setStrengthCompletionDraft] = useState<StrengthCompletionBlockDraft[]>([]);
  const [workoutEditStrengthDraft, setWorkoutEditStrengthDraft] = useState<StrengthExercise[]>([]);
  const [workoutEditSprintDraft, setWorkoutEditSprintDraft] = useState<SprintSet[]>([]);
  const [calendarSelection, setCalendarSelection] = useState<CalendarSelection>(null);
  const [calendarWeekStart, setCalendarWeekStart] = useState(() => dateKey(startOfWeek(new Date())));
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[]>([]);
  const [trainingGoals, setTrainingGoals] = useState<TrainingGoal[]>([]);
  const [programTemplates, setProgramTemplates] = useState<ProgramTemplate[]>([]);
  const [programInstances, setProgramInstances] = useState<ProgramInstance[]>([]);
  const [editingProgramTemplate, setEditingProgramTemplate] = useState<ProgramTemplate | null>(null);
  const [v1Metadata, setV1Metadata] = useState<ImportedV1Metadata[]>([]);
  const [coachSuggestions, setCoachSuggestions] = useState<CoachSuggestion[]>([]);
  const [lastInvite, setLastInvite] = useState<CoachInvite | null>(null);
  const [inviteToken, setInviteToken] = useState(() => new URLSearchParams(window.location.search).get("coachInvite") ?? "");
  const [historyStatus, setHistoryStatus] = useState("");
  const [programStatus, setProgramStatus] = useState("");
  const [trainingFormStatus, setTrainingFormStatus] = useState("");
  const [completionStatus, setCompletionStatus] = useState("");
  const [workoutEditStatus, setWorkoutEditStatus] = useState("");
  const [plannedEditStatus, setPlannedEditStatus] = useState("");
  const [goalStatus, setGoalStatus] = useState("");
  const [programTemplateStatus, setProgramTemplateStatus] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [importPreview, setImportPreview] = useState<V1ImportPreview | null>(null);
  const [importBackup, setImportBackup] = useState<Record<string, unknown> | null>(null);
  const [importCommit, setImportCommit] = useState<V1ImportCommit | null>(null);
  const [backfillResult, setBackfillResult] = useState<V1Backfill | null>(null);
  const [inviteStatus, setInviteStatus] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState("");
  const [isLoadingSession, setIsLoadingSession] = useState(Boolean(token));
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSavingTraining, setIsSavingTraining] = useState(false);
  const [isCompletingSessionId, setIsCompletingSessionId] = useState("");
  const [isDeletingCalendarItem, setIsDeletingCalendarItem] = useState(false);
  const [isSavingWorkoutNotes, setIsSavingWorkoutNotes] = useState(false);
  const [isSavingPlannedSession, setIsSavingPlannedSession] = useState(false);
  const [isMarkingMissedSessionId, setIsMarkingMissedSessionId] = useState("");
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isSavingProgramTemplate, setIsSavingProgramTemplate] = useState(false);
  const [isSchedulingProgramId, setIsSchedulingProgramId] = useState("");
  const [isDeletingProgramTemplateId, setIsDeletingProgramTemplateId] = useState("");
  const [isRemovingProgramInstanceId, setIsRemovingProgramInstanceId] = useState("");
  const [isPreviewingImport, setIsPreviewingImport] = useState(false);
  const [isCommittingImport, setIsCommittingImport] = useState(false);
  const [isBackfillingImport, setIsBackfillingImport] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [isAcceptingInvite, setIsAcceptingInvite] = useState(false);
  const [isCreatingSuggestion, setIsCreatingSuggestion] = useState(false);
  const [resolvingSuggestionId, setResolvingSuggestionId] = useState("");

  const selectedSpace = useMemo(
    () => spaces.find((space) => space.id === selectedSpaceId) ?? spaces[0] ?? null,
    [selectedSpaceId, spaces],
  );
  const workoutsById = useMemo(
    () => new Map(workouts.map((workout) => [workout.id, workout])),
    [workouts],
  );
  const plannedSessionByWorkoutId = useMemo(
    () => new Map(plannedSessions.filter((session) => session.linked_workout_id).map((session) => [session.linked_workout_id, session])),
    [plannedSessions],
  );
  const pendingSuggestions = useMemo(
    () => coachSuggestions.filter((suggestion) => suggestion.status === "pending"),
    [coachSuggestions],
  );
  const calendarDays = useMemo(() => {
    const weekStartDate = new Date(`${calendarWeekStart}T00:00:00`);
    return Array.from({ length: 7 }, (_, index) => {
      const day = addDays(weekStartDate, index);
      const key = dateKey(day);
      return {
        key,
        label: day.toLocaleDateString(undefined, { weekday: "short" }),
        dateLabel: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        isToday: key === dateKey(new Date()),
        workouts: workouts.filter((workout) => workout.date === key && !plannedSessionByWorkoutId.has(workout.id)),
        plannedSessions: plannedSessions.filter((session) => session.date === key),
      };
    });
  }, [calendarWeekStart, plannedSessionByWorkoutId, plannedSessions, workouts]);
  const weekWorkoutCount = calendarDays.reduce((total, day) => total + day.workouts.length, 0);
  const weekPlanCount = calendarDays.reduce((total, day) => total + day.plannedSessions.length, 0);
  const weekLabel = `${formatDate(calendarDays[0]?.key ?? calendarWeekStart)} - ${formatDate(calendarDays[6]?.key ?? calendarWeekStart)}`;
  const selectedCalendarWorkout = calendarSelection?.type === "workout" ? workoutsById.get(calendarSelection.id) ?? null : null;
  const selectedCalendarSession = calendarSelection?.type === "planned"
    ? plannedSessions.find((session) => session.id === calendarSelection.id) ?? null
    : null;
  const selectedCalendarSessionWorkout = selectedCalendarSession?.linked_workout_id
    ? workoutsById.get(selectedCalendarSession.linked_workout_id) ?? null
    : null;
  const selectedCalendarSprintBlock = selectedCalendarSession ? firstSprintBlock(selectedCalendarSession) : {};
  useEffect(() => {
    if (
      selectedCalendarSession
      && selectedCalendarSession.type === "strength"
      && selectedCalendarSession.status === "planned"
      && !selectedCalendarSessionWorkout
    ) {
      setStrengthCompletionDraft(buildStrengthCompletionDraft(selectedCalendarSession));
      return;
    }
    setStrengthCompletionDraft([]);
  }, [selectedCalendarSession, selectedCalendarSessionWorkout]);
  useEffect(() => {
    if (selectedCalendarWorkout?.activity === "strength") {
      setWorkoutEditStrengthDraft(selectedCalendarWorkout.strength_exercises);
      setWorkoutEditSprintDraft([]);
      return;
    }
    if (selectedCalendarWorkout?.activity === "sprint") {
      setWorkoutEditSprintDraft(selectedCalendarWorkout.sprint_sets);
      setWorkoutEditStrengthDraft([]);
      return;
    }
    setWorkoutEditStrengthDraft([]);
    setWorkoutEditSprintDraft([]);
  }, [selectedCalendarWorkout]);
  const goalsByActivity = useMemo(
    () => new Map(trainingGoals.map((goal) => [goal.activity, goal])),
    [trainingGoals],
  );
  const programProgress = useMemo<ProgramProgressModel[]>(() => {
    return programInstances.map((instance) => {
      const generatedSessionIds = new Set(instance.generated_session_ids);
      const sessions = plannedSessions.filter((session) => (
        session.phase_instance_id === instance.id
        || generatedSessionIds.has(session.id)
      ));
      const statusCount = (statusValue: string) => sessions.filter((session) => session.status === statusValue).length;
      const weeksByIndex = new Map<number, PlannedSession[]>();
      sessions.forEach((session) => {
        const weekIndex = session.phase_week_index ?? 0;
        weeksByIndex.set(weekIndex, [...weeksByIndex.get(weekIndex) ?? [], session]);
      });
      const weeks = Array.from(weeksByIndex.entries())
        .sort(([left], [right]) => left - right)
        .map(([weekIndex, weekSessions]) => ({
          label: `Week ${weekIndex + 1}`,
          total: weekSessions.length,
          completed: weekSessions.filter((session) => session.status === "completed").length,
          modified: weekSessions.filter((session) => session.status === "modified").length,
          missed: weekSessions.filter((session) => session.status === "missed").length,
          planned: weekSessions.filter((session) => session.status === "planned").length,
          sessions: [...weekSessions].sort((left, right) => left.date.localeCompare(right.date) || left.title.localeCompare(right.title)),
        }));
      return {
        id: instance.id,
        name: instance.template_name,
        startDate: instance.start_date,
        total: sessions.length,
        completed: statusCount("completed"),
        modified: statusCount("modified"),
        missed: statusCount("missed"),
        planned: statusCount("planned"),
        weeks,
      };
    });
  }, [plannedSessions, programInstances]);
  const reviewCounts = {
    planned: plannedSessions.filter((session) => session.status === "planned").length,
    completed: plannedSessions.filter((session) => session.status === "completed").length,
    modified: plannedSessions.filter((session) => session.status === "modified").length,
    missed: plannedSessions.filter((session) => session.status === "missed").length,
  };
  const reviewedSessionCount = reviewCounts.completed + reviewCounts.modified + reviewCounts.missed;
  const adherencePercent = reviewedSessionCount
    ? Math.round(((reviewCounts.completed + reviewCounts.modified) / reviewedSessionCount) * 100)
    : 0;
  const activityCounts = {
    strength: workouts.filter((workout) => workout.activity === "strength").length,
    run: workouts.filter((workout) => workout.activity === "run").length,
    sprint: workouts.filter((workout) => workout.activity === "sprint").length,
  };
  const strengthExerciseSuggestions = useMemo(() => (
    Array.from(new Set(
      workouts
        .flatMap((workout) => workout.strength_exercises)
        .map((exercise) => exercise.name.trim())
        .filter(Boolean),
    )).sort((a, b) => a.localeCompare(b))
  ), [workouts]);
  const weeklyWorkoutChart = useMemo<ChartPoint[]>(() => {
    const buckets = new Map<string, number>();
    workouts.forEach((workout) => {
      const weekStart = dateKey(startOfWeek(new Date(`${workout.date}T00:00:00`)));
      buckets.set(weekStart, (buckets.get(weekStart) ?? 0) + 1);
    });
    return Array.from(buckets.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-8)
      .map(([weekStart, count]) => ({ label: weekBucketLabel(weekStart), value: count }));
  }, [workouts]);
  const runDistanceChart = useMemo<ChartPoint[]>(() => (
    workouts
      .filter((workout) => workout.activity === "run" && workout.distance != null)
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(-8)
      .map((workout) => ({
        label: weekBucketLabel(workout.date),
        value: workout.distance ?? 0,
        meta: workout.time ?? undefined,
      }))
  ), [workouts]);
  const strengthLoadChart = useMemo<ChartPoint[]>(() => (
    workouts
      .filter((workout) => workout.activity === "strength")
      .map((workout) => ({ workout, maxLoad: maxStrengthLoad(workout) }))
      .filter((row) => row.maxLoad > 0)
      .sort((left, right) => left.workout.date.localeCompare(right.workout.date))
      .slice(-8)
      .map((row) => ({
        label: weekBucketLabel(row.workout.date),
        value: row.maxLoad,
        meta: summarizeWorkout(row.workout) || undefined,
      }))
  ), [workouts]);
  const bestRunDistance = workouts
    .filter((workout) => workout.activity === "run" && workout.distance != null)
    .reduce((best, workout) => Math.max(best, workout.distance ?? 0), 0);
  const bestSprintTime = workouts
    .flatMap((workout) => workout.sprint_sets)
    .reduce((best, sprintSet) => Math.min(best, sprintSet.time_sec), Number.POSITIVE_INFINITY);
  const maxStrengthWeight = workouts
    .flatMap((workout) => workout.strength_exercises)
    .flatMap((exercise) => exercise.sets)
    .filter((set) => set.load_type === "kg" && set.weight != null)
    .reduce((best, set) => Math.max(best, set.weight ?? 0), 0);
  const importedGoals = v1Metadata.find((row) => row.entityType === "goals")?.payload ?? null;
  const activeGoals = importedGoals && typeof importedGoals.active === "object" && importedGoals.active != null
    ? Object.values(importedGoals.active as Record<string, unknown>).filter(Boolean).length
    : 0;
  const cloudGoalCount = trainingGoals.length;
  const activeGoalRows = useMemo(() => {
    const active = asRecord(importedGoals?.active);
    if (!active) {
      return [];
    }
    return ["run", "sprint"]
      .map((activity) => asGoal(active[activity]))
      .filter((goal): goal is V1Goal => Boolean(goal));
  }, [importedGoals]);
  const goalHistoryRows = useMemo(() => {
    const history = importedGoals?.history;
    return Array.isArray(history)
      ? history.map(asGoal).filter((goal): goal is V1Goal => Boolean(goal))
      : [];
  }, [importedGoals]);

  const loadSpaces = useCallback(async (activeToken: string) => {
    const nextSpaces = await apiRequest<TrainingSpace[]>("/api/training-spaces", {}, activeToken);
    setSpaces(nextSpaces);
    setSelectedSpaceId((currentId) => {
      if (nextSpaces.some((space) => space.id === currentId)) {
        return currentId;
      }
      return nextSpaces[0]?.id ?? "";
    });
  }, []);

  const applySession = useCallback(async (nextToken: string, nextUser?: User) => {
    localStorage.setItem(tokenStorageKey, nextToken);
    setToken(nextToken);
    setUser(nextUser ?? await apiRequest<User>("/api/auth/me", {}, nextToken));
    await loadSpaces(nextToken);
  }, [loadSpaces]);

  const loadTrainingHistory = useCallback(async (activeToken: string, trainingSpaceId: string) => {
    const [nextWorkouts, nextPlannedSessions] = await Promise.all([
      apiRequest<Workout[]>(`/api/training-spaces/${trainingSpaceId}/workouts`, {}, activeToken),
      apiRequest<PlannedSession[]>(`/api/training-spaces/${trainingSpaceId}/planned-sessions`, {}, activeToken),
    ]);
    setWorkouts(nextWorkouts);
    setPlannedSessions(nextPlannedSessions);
  }, []);

  const loadTrainingGoals = useCallback(async (activeToken: string, trainingSpaceId: string) => {
    const nextGoals = await apiRequest<TrainingGoal[]>(`/api/training-spaces/${trainingSpaceId}/goals`, {}, activeToken);
    setTrainingGoals(nextGoals);
  }, []);

  const loadProgramTemplates = useCallback(async (activeToken: string, trainingSpaceId: string) => {
    const nextTemplates = await apiRequest<ProgramTemplate[]>(
      `/api/training-spaces/${trainingSpaceId}/program-templates`,
      {},
      activeToken,
    );
    setProgramTemplates(nextTemplates);
  }, []);

  const loadProgramInstances = useCallback(async (activeToken: string, trainingSpaceId: string) => {
    const nextInstances = await apiRequest<ProgramInstance[]>(
      `/api/training-spaces/${trainingSpaceId}/program-templates/instances`,
      {},
      activeToken,
    );
    setProgramInstances(nextInstances);
  }, []);

  const loadV1Metadata = useCallback(async (activeToken: string, trainingSpaceId: string) => {
    const rows = await apiRequest<ImportedV1Metadata[]>(`/api/imports/v1/metadata/${trainingSpaceId}`, {}, activeToken);
    setV1Metadata(rows);
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoadingSession(false);
      return;
    }

    let isActive = true;
    setIsLoadingSession(true);
    apiRequest<User>("/api/auth/me", {}, token)
      .then(async (currentUser) => {
        if (!isActive) {
          return;
        }
        setUser(currentUser);
        await loadSpaces(token);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        localStorage.removeItem(tokenStorageKey);
        setToken("");
        setUser(null);
        setSpaces([]);
        setAuthStatus(error instanceof Error ? error.message : "Session expired.");
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingSession(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [loadSpaces, token]);

  useEffect(() => {
    if (!token || !selectedSpaceId) {
      setWorkouts([]);
      setPlannedSessions([]);
      setTrainingGoals([]);
      setV1Metadata([]);
      setHistoryStatus("");
      return;
    }

    let isActive = true;
    setIsLoadingHistory(true);
    setHistoryStatus("");
    loadTrainingHistory(token, selectedSpaceId)
      .then(() => {
        if (!isActive) {
          return;
        }
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        setWorkouts([]);
        setPlannedSessions([]);
        setTrainingGoals([]);
        setHistoryStatus(error instanceof Error ? error.message : "Could not load training history.");
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingHistory(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [loadTrainingHistory, selectedSpaceId, token]);

  useEffect(() => {
    if (!token || !selectedSpaceId) {
      setTrainingGoals([]);
      setGoalStatus("");
      return;
    }

    let isActive = true;
    setGoalStatus("");
    loadTrainingGoals(token, selectedSpaceId)
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        setTrainingGoals([]);
        setGoalStatus(error instanceof Error ? error.message : "Could not load goals.");
      });

    return () => {
      isActive = false;
    };
  }, [loadTrainingGoals, selectedSpaceId, token]);

  useEffect(() => {
    if (!token || !selectedSpaceId) {
      setV1Metadata([]);
      setProgramTemplates([]);
      setProgramInstances([]);
      setProgramStatus("");
      setProgramTemplateStatus("");
      return;
    }

    let isActive = true;
    setProgramStatus("");
    setProgramTemplateStatus("");
    Promise.all([
      loadV1Metadata(token, selectedSpaceId),
      loadProgramTemplates(token, selectedSpaceId),
      loadProgramInstances(token, selectedSpaceId),
    ])
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        setV1Metadata([]);
        setProgramTemplates([]);
        setProgramInstances([]);
        setProgramStatus(error instanceof Error ? error.message : "Could not load programs.");
      });

    return () => {
      isActive = false;
    };
  }, [loadProgramInstances, loadProgramTemplates, loadV1Metadata, selectedSpaceId, token]);

  const loadCoachSuggestions = useCallback(async (activeToken: string, trainingSpaceId: string, role: string) => {
    if (role !== "owner") {
      setCoachSuggestions([]);
      return;
    }
    const nextSuggestions = await apiRequest<CoachSuggestion[]>(
      `/api/training-spaces/${trainingSpaceId}/coach-suggestions`,
      {},
      activeToken,
    );
    setCoachSuggestions(nextSuggestions);
  }, []);

  useEffect(() => {
    if (!token || !selectedSpace) {
      setCoachSuggestions([]);
      setSuggestionStatus("");
      return;
    }

    let isActive = true;
    setSuggestionStatus("");
    loadCoachSuggestions(token, selectedSpace.id, selectedSpace.my_role)
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        setCoachSuggestions([]);
        setSuggestionStatus(error instanceof Error ? error.message : "Could not load coach suggestions.");
      });

    return () => {
      isActive = false;
    };
  }, [loadCoachSuggestions, selectedSpace, token]);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const displayName = String(form.get("displayName") ?? "");
    const path = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = authMode === "login"
      ? { email, password }
      : { email, password, display_name: displayName };

    setIsSubmittingAuth(true);
    setAuthStatus("");
    try {
      const response = await apiRequest<AuthResponse>(path, {
        method: "POST",
        body: JSON.stringify(body),
      });
      await applySession(response.access_token, response.user);
    } catch (error) {
      setAuthStatus(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  async function handleCreateSpace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("spaceName") ?? "");

    setIsCreatingSpace(true);
    setSpaceStatus("");
    try {
      const createdSpace = await apiRequest<TrainingSpace>("/api/training-spaces", {
        method: "POST",
        body: JSON.stringify({ name }),
      }, token);
      await loadSpaces(token);
      setSelectedSpaceId(createdSpace.id);
      formElement.reset();
    } catch (error) {
      setSpaceStatus(error instanceof Error ? error.message : "Could not create training space.");
    } finally {
      setIsCreatingSpace(false);
    }
  }

  function resetStrengthDraft() {
    setStrengthDraftExercises([]);
    setStrengthExerciseName("");
    setStrengthReps("");
    setStrengthLoadType("kg");
    setStrengthWeight("");
    setStrengthBandColor("");
  }

  function currentStrengthSetDraft(): { name: string; set: WorkoutSet } | null {
    const name = strengthExerciseName.trim();
    const reps = Number(strengthReps);
    const weight = strengthLoadType === "kg" ? Number(strengthWeight) : null;
    const bandColor = strengthLoadType === "band" ? strengthBandColor.trim() : "";

    if (!name) {
      setTrainingFormStatus("Enter an exercise name before adding a set.");
      return null;
    }
    if (!Number.isFinite(reps) || reps < 0) {
      setTrainingFormStatus("Enter reps before adding a set.");
      return null;
    }
    if (strengthLoadType === "kg" && (!Number.isFinite(weight) || weight == null || weight < 0)) {
      setTrainingFormStatus("Enter a valid kg load before adding a set.");
      return null;
    }
    return {
      name,
      set: {
        order: 1,
        reps,
        weight,
        load_type: strengthLoadType,
        band_color: bandColor,
      },
    };
  }

  function appendStrengthSet(current: StrengthExercise[], name: string, set: WorkoutSet): StrengthExercise[] {
    const existingIndex = current.findIndex((exercise) => exercise.name.toLowerCase() === name.toLowerCase());
    if (existingIndex === -1) {
      return [
        ...current,
        {
          order: current.length + 1,
          name,
          sets: [{ ...set, order: 1 }],
        },
      ];
    }

    return current.map((exercise, index) => {
      if (index !== existingIndex) {
        return exercise;
      }
      return {
        ...exercise,
        sets: [
          ...exercise.sets,
          { ...set, order: exercise.sets.length + 1 },
        ],
      };
    });
  }

  function handleAddStrengthSet() {
    setTrainingFormStatus("");
    const draft = currentStrengthSetDraft();
    if (!draft) {
      return;
    }

    setStrengthDraftExercises((current) => appendStrengthSet(current, draft.name, draft.set));
    setStrengthReps("");
    setStrengthWeight("");
    setStrengthBandColor("");
  }

  function handleRemoveStrengthSet(exerciseIndex: number, setIndex: number) {
    setStrengthDraftExercises((current) => current.flatMap((exercise, currentExerciseIndex) => {
      if (currentExerciseIndex !== exerciseIndex) {
        return [exercise];
      }
      const nextSets = exercise.sets
        .filter((_, currentSetIndex) => currentSetIndex !== setIndex)
        .map((set, nextSetIndex) => ({ ...set, order: nextSetIndex + 1 }));
      return nextSets.length ? [{ ...exercise, sets: nextSets }] : [];
    }).map((exercise, index) => ({ ...exercise, order: index + 1 })));
  }

  function handleAddProgramSlot(formElement: HTMLFormElement) {
    const form = new FormData(formElement);
    const weekday = Number(form.get("programSlotWeekday"));
    const title = String(form.get("programSlotTitle") ?? "").trim();
    const notes = String(form.get("programSlotNotes") ?? "").trim();

    setProgramTemplateStatus("");
    if (!weekday || !title) {
      setProgramTemplateStatus("Fill weekday and session title before adding a workout slot.");
      return;
    }

    setProgramSlotDrafts((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        weekday,
        title,
        notes,
        blocks: [],
      },
    ]);
  }

  function handleRemoveProgramSlot(slotId: string) {
    setProgramSlotDrafts((current) => current.filter((slot) => slot.id !== slotId));
  }

  function handleAddProgramBlock(formElement: HTMLFormElement) {
    const form = new FormData(formElement);
    const slotId = String(form.get("programBlockSlotId") ?? "");
    const label = String(form.get("programBlockLabel") ?? "").trim();
    const sets = String(form.get("programBlockSets") ?? "").trim();

    setProgramTemplateStatus("");
    if (!slotId || !label || !sets) {
      setProgramTemplateStatus("Choose a workout slot and fill block name and sets.");
      return;
    }

    setProgramSlotDrafts((current) => current.map((slot) => {
      if (slot.id !== slotId) {
        return slot;
      }
      return {
        ...slot,
        blocks: [
          ...slot.blocks,
          {
            id: crypto.randomUUID(),
            label,
            sets,
            exercises: [],
          },
        ],
      };
    }));
  }

  function handleRemoveProgramBlock(slotId: string, blockId: string) {
    setProgramSlotDrafts((current) => current.map((slot) => {
      if (slot.id !== slotId) {
        return slot;
      }
      return {
        ...slot,
        blocks: slot.blocks.filter((block) => block.id !== blockId),
      };
    }));
  }

  function handleAddProgramExercise(formElement: HTMLFormElement) {
    const form = new FormData(formElement);
    const blockRef = String(form.get("programExerciseBlockRef") ?? "");
    const [slotId, blockId] = blockRef.split("::");
    const name = String(form.get("programExerciseName") ?? "").trim();
    const reps = String(form.get("programExerciseReps") ?? "").trim();
    const weight = Number(form.get("programExerciseWeight"));
    const notes = String(form.get("programExerciseNotes") ?? "").trim();

    setProgramTemplateStatus("");
    if (!slotId || !blockId || !name || !reps) {
      setProgramTemplateStatus("Choose a block and fill exercise name and reps.");
      return;
    }

    setProgramSlotDrafts((current) => current.map((slot) => {
      if (slot.id !== slotId) {
        return slot;
      }
      return {
        ...slot,
        blocks: slot.blocks.map((block) => {
          if (block.id !== blockId) {
            return block;
          }
          return {
            ...block,
            exercises: [
              ...block.exercises,
              {
                code: `E${block.exercises.length + 1}`,
                name,
                reps,
                notes,
                weight: Number.isFinite(weight) && weight > 0 ? weight : null,
              },
            ],
          };
        }),
      };
    }));
  }

  function handleRemoveProgramExercise(slotId: string, blockId: string, exerciseIndex: number) {
    setProgramSlotDrafts((current) => current.map((slot) => {
      if (slot.id !== slotId) {
        return slot;
      }
      return {
        ...slot,
        blocks: slot.blocks.map((block) => {
          if (block.id !== blockId) {
            return block;
          }
          return {
            ...block,
            exercises: block.exercises.filter((_, index) => index !== exerciseIndex),
          };
        }),
      };
    }));
  }

  function handleEditProgramTemplate(template: ProgramTemplate) {
    setEditingProgramTemplate(template);
    setProgramSlotDrafts(normalizeProgramSlotDrafts(template.template_json.weekdaySlots));
    setProgramTemplateStatus(`Editing "${template.name}". Changes affect future schedules only.`);
  }

  function cancelProgramTemplateEdit(formElement?: HTMLFormElement | null) {
    setEditingProgramTemplate(null);
    setProgramSlotDrafts([]);
    setProgramTemplateStatus("");
    formElement?.reset();
  }

  async function handleCreateInvite() {
    if (!token || !selectedSpace) {
      return;
    }

    setIsCreatingInvite(true);
    setInviteStatus("");
    try {
      const invite = await apiRequest<CoachInvite>(
        `/api/training-spaces/${selectedSpace.id}/coach-invites`,
        { method: "POST" },
        token,
      );
      setLastInvite(invite);
      setInviteToken(invite.token);
      setInviteStatus("Invite created.");
    } catch (error) {
      setInviteStatus(error instanceof Error ? error.message : "Could not create invite.");
    } finally {
      setIsCreatingInvite(false);
    }
  }

  async function handleTrainingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedSpace) {
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const date = String(form.get("trainingDate") ?? "");
    const notes = String(form.get("trainingNotes") ?? "");

    setIsSavingTraining(true);
    setTrainingFormStatus("");
    try {
      if (addTrainingMode === "log") {
        const activity = String(form.get("actualActivity") ?? actualActivity) as Activity;
        const body: Record<string, unknown> = {
          activity,
          date,
          notes,
        };

        if (activity === "run") {
          const distance = Number(form.get("runDistance"));
          const time = String(form.get("runTime") ?? "");
          const pace = runPace(distance, time);
          if (!pace) {
            throw new Error("Run workouts need distance and time like 22:00.");
          }
          body.distance = distance;
          body.time = time;
          body.pace = pace;
        }

        if (activity === "sprint") {
          body.sprint_feeling = String(form.get("sprintFeeling") ?? "") || null;
          body.sprint_sets = [{
            distance_m: Number(form.get("sprintDistance")),
            time_sec: Number(form.get("sprintTime")),
          }];
        }

        if (activity === "strength") {
          let strengthExercises = strengthDraftExercises;
          const hasCurrentStrengthInput = strengthExerciseName.trim() || strengthReps || strengthWeight || strengthBandColor.trim();
          if (hasCurrentStrengthInput) {
            const draft = currentStrengthSetDraft();
            if (!draft) {
              throw new Error("Finish or clear the current strength set before saving.");
            }
            strengthExercises = appendStrengthSet(strengthExercises, draft.name, draft.set);
          }
          if (!strengthExercises.length) {
            throw new Error("Add at least one strength set before saving.");
          }
          body.strength_exercises = strengthExercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets.map((set) => ({
              reps: set.reps,
              weight: set.weight,
              load_type: set.load_type,
              band_color: set.band_color,
            })),
          }));
        }

        await apiRequest<Workout>(
          `/api/training-spaces/${selectedSpace.id}/workouts`,
          { method: "POST", body: JSON.stringify(body) },
          token,
        );
        setTrainingFormStatus("Workout saved.");
      } else {
        const type = String(form.get("plannedType") ?? plannedType) as PlannedType;
        const details = type === "run"
          ? {
              distance: Number(form.get("plannedRunDistance")) || null,
              paceGoal: Number(form.get("plannedRunPace")) || null,
            }
          : {
              blocks: [{
                reps: Number(form.get("plannedSprintReps")) || 1,
                distanceM: Number(form.get("plannedSprintDistance")) || 100,
                targetTimeSec: Number(form.get("plannedSprintTargetTime")) || null,
                restSec: Number(form.get("plannedSprintRest")) || null,
              }],
            };

        await apiRequest<PlannedSession>(
          `/api/training-spaces/${selectedSpace.id}/planned-sessions`,
          {
            method: "POST",
            body: JSON.stringify({
              type,
              title: String(form.get("plannedTitle") ?? ""),
              date,
              details_json: details,
            }),
          },
          token,
        );
        setTrainingFormStatus("Planned session saved.");
      }

      await loadTrainingHistory(token, selectedSpace.id);
      formElement.reset();
      setActualActivity("strength");
      setPlannedType("run");
      resetStrengthDraft();
    } catch (error) {
      setTrainingFormStatus(error instanceof Error ? error.message : "Could not save training.");
    } finally {
      setIsSavingTraining(false);
    }
  }

  async function handleImportFileChange(event: FormEvent<HTMLInputElement>) {
    if (!token) {
      return;
    }
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }

    setIsPreviewingImport(true);
    setImportStatus("");
    setImportPreview(null);
    setImportBackup(null);
    setImportCommit(null);
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Backup file must contain a JSON object.");
      }
      const backup = parsed as Record<string, unknown>;
      const preview = await apiRequest<V1ImportPreview>(
        "/api/imports/v1/preview",
        { method: "POST", body: JSON.stringify(backup) },
        token,
      );
      setImportPreview(preview);
      setImportBackup(preview.valid ? backup : null);
      setImportStatus(preview.valid ? "Backup preview is ready." : "Backup preview is invalid.");
    } catch (error) {
      setImportStatus(error instanceof Error ? error.message : "Could not preview backup.");
    } finally {
      setIsPreviewingImport(false);
    }
  }

  async function handleCommitImport() {
    if (!token || !selectedSpace || !importBackup) {
      return;
    }

    setIsCommittingImport(true);
    setImportStatus("");
    setImportCommit(null);
    try {
      const result = await apiRequest<V1ImportCommit>(
        "/api/imports/v1/commit",
        {
          method: "POST",
          body: JSON.stringify({
            trainingSpaceId: selectedSpace.id,
            backup: importBackup,
          }),
        },
        token,
      );
      setImportCommit(result);
      setImportStatus("Backup imported.");
      await Promise.all([
        loadTrainingHistory(token, selectedSpace.id),
        loadV1Metadata(token, selectedSpace.id),
      ]);
      setActiveView("calendar");
    } catch (error) {
      setImportStatus(error instanceof Error ? error.message : "Could not import backup.");
    } finally {
      setIsCommittingImport(false);
    }
  }

  async function handleBackfillImport() {
    if (!token || !selectedSpace) {
      return;
    }

    setIsBackfillingImport(true);
    setImportStatus("");
    setBackfillResult(null);
    try {
      const result = await apiRequest<V1Backfill>(
        `/api/imports/v1/backfill/${selectedSpace.id}`,
        { method: "POST" },
        token,
      );
      setBackfillResult(result);
      setImportStatus(result.linkedPlannedSessionCount
        ? `Backfill linked ${result.linkedPlannedSessionCount} planned session(s).`
        : "Backfill found no sessions to link.");
      await Promise.all([
        loadTrainingHistory(token, selectedSpace.id),
        loadProgramInstances(token, selectedSpace.id),
      ]);
      setActiveView("calendar");
    } catch (error) {
      setImportStatus(error instanceof Error ? error.message : "Could not backfill imported data.");
    } finally {
      setIsBackfillingImport(false);
    }
  }

  async function handleCompletePlannedSession(event: FormEvent<HTMLFormElement>, session: PlannedSession) {
    event.preventDefault();
    if (!token || !selectedSpace) {
      return;
    }
    if (session.type !== "run" && session.type !== "sprint") {
      setCompletionStatus("Calendar completion currently supports run and sprint sessions.");
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const notes = String(form.get("completionNotes") ?? "");
    const body: Record<string, unknown> = {
      activity: session.type,
      date: session.date,
      notes: notes || `Completed planned ${session.type}: ${session.title}`,
    };
    let actualJson: Record<string, unknown>;

    setIsCompletingSessionId(session.id);
    setCompletionStatus("");
    try {
      if (session.type === "run") {
        const distance = Number(form.get("completionRunDistance"));
        const time = String(form.get("completionRunTime") ?? "");
        const pace = runPace(distance, time);
        if (!pace) {
          throw new Error("Completed run needs distance and time like 22:00.");
        }
        body.distance = distance;
        body.time = time;
        body.pace = pace;
        actualJson = { distance, time, pace };
      } else {
        const distance = Number(form.get("completionSprintDistance"));
        const time = Number(form.get("completionSprintTime"));
        const feeling = String(form.get("completionSprintFeeling") ?? "");
        if (!distance || !time) {
          throw new Error("Completed sprint needs distance and time.");
        }
        body.sprint_feeling = feeling || null;
        body.sprint_sets = [{ distance_m: distance, time_sec: time }];
        actualJson = { sprintSets: [{ distance, time }], feeling };
      }

      const workout = await apiRequest<Workout>(
        `/api/training-spaces/${selectedSpace.id}/workouts`,
        { method: "POST", body: JSON.stringify(body) },
        token,
      );
      await apiRequest<PlannedSession>(
        `/api/training-spaces/${selectedSpace.id}/planned-sessions/${session.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            linked_workout_id: workout.id,
            status: "completed",
            actual_json: actualJson,
            modification_note: notes,
          }),
        },
        token,
      );

      await loadTrainingHistory(token, selectedSpace.id);
      setCalendarSelection({ type: "planned", id: session.id });
      setCompletionStatus("Planned session completed.");
      formElement.reset();
    } catch (error) {
      setCompletionStatus(error instanceof Error ? error.message : "Could not complete planned session.");
    } finally {
      setIsCompletingSessionId("");
    }
  }

  function updateStrengthCompletionSet(
    blockIndex: number,
    exerciseIndex: number,
    setId: string,
    changes: Partial<StrengthCompletionSetDraft>,
  ) {
    setStrengthCompletionDraft((current) => current.map((block, currentBlockIndex) => {
      if (currentBlockIndex !== blockIndex) {
        return block;
      }
      return {
        ...block,
        exercises: block.exercises.map((exercise, currentExerciseIndex) => {
          if (currentExerciseIndex !== exerciseIndex) {
            return exercise;
          }
          return {
            ...exercise,
            actual_sets: exercise.actual_sets.map((set) => (set.id === setId ? { ...set, ...changes } : set)),
          };
        }),
      };
    }));
  }

  function updateStrengthCompletionExercise(
    blockIndex: number,
    exerciseIndex: number,
    changes: Partial<StrengthCompletionExerciseDraft>,
  ) {
    setStrengthCompletionDraft((current) => current.map((block, currentBlockIndex) => {
      if (currentBlockIndex !== blockIndex) {
        return block;
      }
      return {
        ...block,
        exercises: block.exercises.map((exercise, currentExerciseIndex) => (
          currentExerciseIndex === exerciseIndex ? { ...exercise, ...changes } : exercise
        )),
      };
    }));
  }

  function addStrengthCompletionSet(blockIndex: number, exerciseIndex: number) {
    setStrengthCompletionDraft((current) => current.map((block, currentBlockIndex) => {
      if (currentBlockIndex !== blockIndex) {
        return block;
      }
      return {
        ...block,
        exercises: block.exercises.map((exercise, currentExerciseIndex) => {
          if (currentExerciseIndex !== exerciseIndex) {
            return exercise;
          }
          return {
            ...exercise,
            actual_sets: [
              ...exercise.actual_sets,
              { id: crypto.randomUUID(), reps: "", load_type: "kg", weight: "", band_color: "" },
            ],
          };
        }),
      };
    }));
  }

  function removeStrengthCompletionSet(blockIndex: number, exerciseIndex: number, setId: string) {
    setStrengthCompletionDraft((current) => current.map((block, currentBlockIndex) => {
      if (currentBlockIndex !== blockIndex) {
        return block;
      }
      return {
        ...block,
        exercises: block.exercises.map((exercise, currentExerciseIndex) => {
          if (currentExerciseIndex !== exerciseIndex) {
            return exercise;
          }
          return {
            ...exercise,
            actual_sets: exercise.actual_sets.filter((set) => set.id !== setId),
          };
        }),
      };
    }));
  }

  async function handleCompleteStrengthSession(event: FormEvent<HTMLFormElement>, session: PlannedSession) {
    event.preventDefault();
    if (!token || !selectedSpace) {
      return;
    }
    const form = new FormData(event.currentTarget);
    const notes = String(form.get("completionNotes") ?? "");
    const payload = strengthCompletionPayload(strengthCompletionDraft);
    if (!payload.strengthExercises.length) {
      setCompletionStatus("Strength completion needs at least one logged set.");
      return;
    }

    setIsCompletingSessionId(session.id);
    setCompletionStatus("");
    try {
      const workout = await apiRequest<Workout>(
        `/api/training-spaces/${selectedSpace.id}/workouts`,
        {
          method: "POST",
          body: JSON.stringify({
            activity: "strength",
            date: session.date,
            notes: notes || `Completed planned strength: ${session.title}`,
            strength_exercises: payload.strengthExercises,
          }),
        },
        token,
      );
      await apiRequest<PlannedSession>(
        `/api/training-spaces/${selectedSpace.id}/planned-sessions/${session.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            linked_workout_id: workout.id,
            status: payload.isModified ? "modified" : "completed",
            actual_json: payload.actualJson,
            modification_note: notes,
          }),
        },
        token,
      );
      await loadTrainingHistory(token, selectedSpace.id);
      setCalendarSelection({ type: "planned", id: session.id });
      setCompletionStatus("Planned strength session completed.");
    } catch (error) {
      setCompletionStatus(error instanceof Error ? error.message : "Could not complete strength session.");
    } finally {
      setIsCompletingSessionId("");
    }
  }

  async function handleDeleteWorkout(workout: Workout) {
    if (!token || !selectedSpace) {
      return;
    }
    const confirmed = window.confirm(`Delete ${activityLabel(workout.activity)} workout from ${formatDate(workout.date)}?`);
    if (!confirmed) {
      return;
    }

    setIsDeletingCalendarItem(true);
    setCompletionStatus("");
    try {
      await apiRequest<void>(
        `/api/training-spaces/${selectedSpace.id}/workouts/${workout.id}`,
        { method: "DELETE" },
        token,
      );
      await loadTrainingHistory(token, selectedSpace.id);
      setCalendarSelection(null);
      setHistoryStatus("Workout deleted.");
    } catch (error) {
      setCompletionStatus(error instanceof Error ? error.message : "Could not delete workout.");
    } finally {
      setIsDeletingCalendarItem(false);
    }
  }

  function updateWorkoutEditStrengthSet(exerciseIndex: number, setIndex: number, changes: Partial<WorkoutSet>) {
    setWorkoutEditStrengthDraft((current) => current.map((exercise, currentExerciseIndex) => {
      if (currentExerciseIndex !== exerciseIndex) {
        return exercise;
      }
      return {
        ...exercise,
        sets: exercise.sets.map((set, currentSetIndex) => (
          currentSetIndex === setIndex ? { ...set, ...changes } : set
        )),
      };
    }));
  }

  function updateWorkoutEditStrengthExercise(exerciseIndex: number, name: string) {
    setWorkoutEditStrengthDraft((current) => current.map((exercise, currentExerciseIndex) => (
      currentExerciseIndex === exerciseIndex ? { ...exercise, name } : exercise
    )));
  }

  function addWorkoutEditStrengthSet(exerciseIndex: number) {
    setWorkoutEditStrengthDraft((current) => current.map((exercise, currentExerciseIndex) => {
      if (currentExerciseIndex !== exerciseIndex) {
        return exercise;
      }
      return {
        ...exercise,
        sets: [
          ...exercise.sets,
          { order: exercise.sets.length + 1, reps: 0, weight: null, load_type: "kg", band_color: "" },
        ],
      };
    }));
  }

  function removeWorkoutEditStrengthSet(exerciseIndex: number, setIndex: number) {
    setWorkoutEditStrengthDraft((current) => current.flatMap((exercise, currentExerciseIndex) => {
      if (currentExerciseIndex !== exerciseIndex) {
        return [exercise];
      }
      const sets = exercise.sets
        .filter((_, currentSetIndex) => currentSetIndex !== setIndex)
        .map((set, index) => ({ ...set, order: index + 1 }));
      return sets.length ? [{ ...exercise, sets }] : [];
    }).map((exercise, index) => ({ ...exercise, order: index + 1 })));
  }

  function addWorkoutEditStrengthExercise() {
    setWorkoutEditStrengthDraft((current) => [
      ...current,
      {
        order: current.length + 1,
        name: "Exercise",
        sets: [{ order: 1, reps: 0, weight: null, load_type: "kg", band_color: "" }],
      },
    ]);
  }

  function updateWorkoutEditSprintSet(setIndex: number, changes: Partial<SprintSet>) {
    setWorkoutEditSprintDraft((current) => current.map((set, currentSetIndex) => (
      currentSetIndex === setIndex ? { ...set, ...changes } : set
    )));
  }

  function addWorkoutEditSprintSet() {
    setWorkoutEditSprintDraft((current) => [
      ...current,
      { order: current.length + 1, distance_m: 100, time_sec: 0 },
    ]);
  }

  function removeWorkoutEditSprintSet(setIndex: number) {
    setWorkoutEditSprintDraft((current) => current
      .filter((_, currentSetIndex) => currentSetIndex !== setIndex)
      .map((set, index) => ({ ...set, order: index + 1 })));
  }

  async function handleWorkoutEditSubmit(event: FormEvent<HTMLFormElement>, workout: Workout) {
    event.preventDefault();
    if (!token || !selectedSpace) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const date = String(form.get("workoutDate") ?? workout.date);
    const notes = String(form.get("workoutNotes") ?? "");
    const body: Record<string, unknown> = {
      activity: workout.activity,
      date,
      notes,
    };

    if (workout.activity === "run") {
      const distance = Number(form.get("workoutRunDistance"));
      const time = String(form.get("workoutRunTime") ?? "");
      const pace = runPace(distance, time);
      if (!pace) {
        setWorkoutEditStatus("Run workouts need distance and time like 22:00.");
        return;
      }
      body.distance = distance;
      body.time = time;
      body.pace = pace;
    }

    if (workout.activity === "sprint") {
      const sprintSets = workoutEditSprintDraft.filter((set) => set.distance_m > 0 && set.time_sec > 0);
      if (!sprintSets.length) {
        setWorkoutEditStatus("Sprint workouts need at least one sprint set.");
        return;
      }
      body.sprint_feeling = String(form.get("workoutSprintFeeling") ?? "") || null;
      body.sprint_sets = sprintSets.map((set) => ({
        distance_m: set.distance_m,
        time_sec: set.time_sec,
      }));
    }

    if (workout.activity === "strength") {
      const strengthExercises = workoutEditStrengthDraft
        .map((exercise) => ({
          name: exercise.name.trim(),
          sets: exercise.sets
            .filter((set) => Number.isFinite(set.reps) && set.reps >= 0)
            .map((set) => ({
              reps: set.reps,
              weight: set.load_type === "kg" ? set.weight : null,
              load_type: set.load_type,
              band_color: set.load_type === "band" ? set.band_color : "",
            })),
        }))
        .filter((exercise) => exercise.name && exercise.sets.length);
      if (!strengthExercises.length) {
        setWorkoutEditStatus("Strength workouts need at least one exercise set.");
        return;
      }
      body.strength_exercises = strengthExercises;
    }

    setIsSavingWorkoutNotes(true);
    setWorkoutEditStatus("");
    try {
      await apiRequest<Workout>(
        `/api/training-spaces/${selectedSpace.id}/workouts/${workout.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        },
        token,
      );
      await loadTrainingHistory(token, selectedSpace.id);
      setCalendarSelection({ type: "workout", id: workout.id });
      setWorkoutEditStatus("Workout saved.");
    } catch (error) {
      setWorkoutEditStatus(error instanceof Error ? error.message : "Could not save workout.");
    } finally {
      setIsSavingWorkoutNotes(false);
    }
  }

  async function handlePlannedSessionEditSubmit(event: FormEvent<HTMLFormElement>, session: PlannedSession) {
    event.preventDefault();
    if (!token || !selectedSpace) {
      return;
    }
    if (session.type !== "run" && session.type !== "sprint" && session.type !== "strength") {
      setPlannedEditStatus("Calendar editing supports run, sprint, and strength sessions.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const title = String(form.get("plannedEditTitle") ?? "");
    const date = String(form.get("plannedEditDate") ?? "");
    const details = session.type === "run"
      ? {
          distance: Number(form.get("plannedEditRunDistance")) || null,
          paceGoal: Number(form.get("plannedEditRunPace")) || null,
        }
      : session.type === "sprint"
        ? {
            blocks: [{
              reps: Number(form.get("plannedEditSprintReps")) || 1,
              distanceM: Number(form.get("plannedEditSprintDistance")) || 100,
              targetTimeSec: Number(form.get("plannedEditSprintTargetTime")) || null,
              restSec: Number(form.get("plannedEditSprintRest")) || null,
            }],
          }
        : session.details_json;

    setIsSavingPlannedSession(true);
    setPlannedEditStatus("");
    try {
      await apiRequest<PlannedSession>(
        `/api/training-spaces/${selectedSpace.id}/planned-sessions/${session.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title,
            date,
            details_json: details,
            date_moved_manually: session.source === "phase-generated" && date !== session.generated_date,
          }),
        },
        token,
      );
      await loadTrainingHistory(token, selectedSpace.id);
      setCalendarSelection({ type: "planned", id: session.id });
      setPlannedEditStatus("Planned session saved.");
    } catch (error) {
      setPlannedEditStatus(error instanceof Error ? error.message : "Could not save planned session.");
    } finally {
      setIsSavingPlannedSession(false);
    }
  }

  async function handleMarkPlannedSessionMissed(session: PlannedSession) {
    if (!token || !selectedSpace) {
      return;
    }
    const confirmed = window.confirm(`Mark "${session.title}" as missed?`);
    if (!confirmed) {
      return;
    }

    setIsMarkingMissedSessionId(session.id);
    setPlannedEditStatus("");
    setCompletionStatus("");
    try {
      await apiRequest<PlannedSession>(
        `/api/training-spaces/${selectedSpace.id}/planned-sessions/${session.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "missed",
            modification_note: "Marked missed from calendar.",
          }),
        },
        token,
      );
      await loadTrainingHistory(token, selectedSpace.id);
      setCalendarSelection({ type: "planned", id: session.id });
      setPlannedEditStatus("Planned session marked missed.");
    } catch (error) {
      setPlannedEditStatus(error instanceof Error ? error.message : "Could not mark session missed.");
    } finally {
      setIsMarkingMissedSessionId("");
    }
  }

  async function handleDeletePlannedSession(session: PlannedSession) {
    if (!token || !selectedSpace) {
      return;
    }
    const confirmed = window.confirm(`Delete planned session "${session.title}" from ${formatDate(session.date)}?`);
    if (!confirmed) {
      return;
    }

    setIsDeletingCalendarItem(true);
    setCompletionStatus("");
    try {
      await apiRequest<void>(
        `/api/training-spaces/${selectedSpace.id}/planned-sessions/${session.id}`,
        { method: "DELETE" },
        token,
      );
      await loadTrainingHistory(token, selectedSpace.id);
      setCalendarSelection(null);
      setHistoryStatus("Planned session deleted.");
    } catch (error) {
      setCompletionStatus(error instanceof Error ? error.message : "Could not delete planned session.");
    } finally {
      setIsDeletingCalendarItem(false);
    }
  }

  function openProgramSessionInCalendar(session: PlannedSession) {
    setCalendarWeekStart(dateKey(startOfWeek(new Date(`${session.date}T00:00:00`))));
    setCalendarSelection({ type: "planned", id: session.id });
    setActiveView("calendar");
  }

  async function handleGoalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedSpace) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const activity = String(form.get("goalActivity") ?? "run");
    const notes = String(form.get("goalNotes") ?? "");
    const target = activity === "strength"
      ? { weight: Number(form.get("goalStrengthWeight")) || null }
      : activity === "run"
        ? {
            distance: Number(form.get("goalRunDistance")) || null,
            time: String(form.get("goalRunTime") ?? ""),
          }
        : {
            distanceM: Number(form.get("goalSprintDistance")) || null,
            timeSec: Number(form.get("goalSprintTime")) || null,
          };

    setIsSavingGoal(true);
    setGoalStatus("");
    try {
      await apiRequest<TrainingGoal>(
        `/api/training-spaces/${selectedSpace.id}/goals/${activity}`,
        {
          method: "PUT",
          body: JSON.stringify({ target_json: target, notes }),
        },
        token,
      );
      await loadTrainingGoals(token, selectedSpace.id);
      setGoalStatus("Goal saved.");
    } catch (error) {
      setGoalStatus(error instanceof Error ? error.message : "Could not save goal.");
    } finally {
      setIsSavingGoal(false);
    }
  }

  async function handleProgramTemplateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedSpace) {
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("programTemplateName") ?? "");
    const durationWeeks = Number(form.get("programTemplateDuration"));
    const startDate = String(form.get("programTemplateStartDate") ?? "");
    const notes = String(form.get("programTemplateNotes") ?? "");

    setIsSavingProgramTemplate(true);
    setProgramTemplateStatus("");
    try {
      if (!programSlotDrafts.length) {
        throw new Error("Add at least one workout slot before saving the template.");
      }
      if (programSlotDrafts.some((slot) => !slot.blocks.length)) {
        throw new Error("Every workout slot needs at least one block.");
      }
      if (programSlotDrafts.some((slot) => slot.blocks.some((block) => !block.exercises.length))) {
        throw new Error("Every block needs at least one exercise.");
      }
      const templatePath = editingProgramTemplate
        ? `/api/training-spaces/${selectedSpace.id}/program-templates/${editingProgramTemplate.id}`
        : `/api/training-spaces/${selectedSpace.id}/program-templates`;
      await apiRequest<ProgramTemplate>(
        templatePath,
        {
          method: editingProgramTemplate ? "PATCH" : "POST",
          body: JSON.stringify({
            name,
            duration_weeks: durationWeeks,
            notes,
            template_json: {
              startDate,
              weekdaySlots: programSlotDrafts,
            },
          }),
        },
        token,
      );
      await loadProgramTemplates(token, selectedSpace.id);
      formElement.reset();
      setProgramSlotDrafts([]);
      setEditingProgramTemplate(null);
      setProgramTemplateStatus(editingProgramTemplate ? "Program template updated." : "Program template saved.");
    } catch (error) {
      setProgramTemplateStatus(error instanceof Error ? error.message : "Could not save program template.");
    } finally {
      setIsSavingProgramTemplate(false);
    }
  }

  async function handleScheduleProgramTemplate(template: ProgramTemplate) {
    if (!token || !selectedSpace) {
      return;
    }
    const startDate = typeof template.template_json.startDate === "string" ? template.template_json.startDate : "";
    if (!startDate) {
      setProgramTemplateStatus("Template needs a start date before scheduling.");
      return;
    }

    setIsSchedulingProgramId(template.id);
    setProgramTemplateStatus("");
    try {
      await apiRequest<ProgramInstance>(
        `/api/training-spaces/${selectedSpace.id}/program-templates/${template.id}/schedule`,
        { method: "POST", body: JSON.stringify({ start_date: startDate }) },
        token,
      );
      await Promise.all([
        loadTrainingHistory(token, selectedSpace.id),
        loadProgramInstances(token, selectedSpace.id),
      ]);
      setProgramTemplateStatus("Program scheduled.");
      setActiveView("calendar");
    } catch (error) {
      setProgramTemplateStatus(error instanceof Error ? error.message : "Could not schedule program.");
    } finally {
      setIsSchedulingProgramId("");
    }
  }

  async function handleRemoveProgramInstance(instance: ProgramInstance) {
    if (!token || !selectedSpace) {
      return;
    }
    const confirmed = window.confirm(`Remove scheduled program "${instance.template_name}"? Planned generated sessions will be removed.`);
    if (!confirmed) {
      return;
    }

    setIsRemovingProgramInstanceId(instance.id);
    setProgramStatus("");
    try {
      await apiRequest<void>(
        `/api/training-spaces/${selectedSpace.id}/program-templates/instances/${instance.id}`,
        { method: "DELETE" },
        token,
      );
      await Promise.all([
        loadTrainingHistory(token, selectedSpace.id),
        loadProgramInstances(token, selectedSpace.id),
      ]);
      setProgramStatus("Scheduled program removed.");
    } catch (error) {
      setProgramStatus(error instanceof Error ? error.message : "Could not remove scheduled program.");
    } finally {
      setIsRemovingProgramInstanceId("");
    }
  }

  async function handleDeleteProgramTemplate(template: ProgramTemplate) {
    if (!token || !selectedSpace) {
      return;
    }
    const confirmed = window.confirm(`Delete program template "${template.name}"?`);
    if (!confirmed) {
      return;
    }

    setIsDeletingProgramTemplateId(template.id);
    setProgramTemplateStatus("");
    try {
      await apiRequest<void>(
        `/api/training-spaces/${selectedSpace.id}/program-templates/${template.id}`,
        { method: "DELETE" },
        token,
      );
      if (editingProgramTemplate?.id === template.id) {
        setEditingProgramTemplate(null);
        setProgramSlotDrafts([]);
      }
      await loadProgramTemplates(token, selectedSpace.id);
      setProgramTemplateStatus("Program template deleted.");
    } catch (error) {
      setProgramTemplateStatus(error instanceof Error ? error.message : "Could not delete program template.");
    } finally {
      setIsDeletingProgramTemplateId("");
    }
  }

  async function handleExportData() {
    if (!token || !selectedSpace) {
      return;
    }

    setIsExportingData(true);
    setExportStatus("");
    try {
      const backup = await apiRequest<Record<string, unknown>>(
        `/api/imports/v2/export/${selectedSpace.id}`,
        {},
        token,
      );
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `train-with-me-cloud-v2-native-${selectedSpace.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${dateKey(new Date())}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setExportStatus("V2 cloud export downloaded.");
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : "Could not export backup.");
    } finally {
      setIsExportingData(false);
    }
  }

  async function handleAcceptInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !inviteToken.trim()) {
      return;
    }

    setIsAcceptingInvite(true);
    setInviteStatus("");
    try {
      const invite = await apiRequest<CoachInvite>(`/api/coach-invites/${inviteToken.trim()}`);
      const accepted = await apiRequest<CoachInviteAcceptResponse>(
        `/api/coach-invites/${inviteToken.trim()}/accept`,
        { method: "POST" },
        token,
      );
      await loadSpaces(token);
      setSelectedSpaceId(accepted.training_space_id);
      setInviteStatus(`Accepted coach invite for ${invite.training_space_name}.`);
    } catch (error) {
      setInviteStatus(error instanceof Error ? error.message : "Could not accept invite.");
    } finally {
      setIsAcceptingInvite(false);
    }
  }

  async function handleCreateSuggestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedSpace) {
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const targetWorkoutId = String(form.get("targetWorkoutId") ?? "");
    const notes = String(form.get("suggestedNotes") ?? "");

    setIsCreatingSuggestion(true);
    setSuggestionStatus("");
    try {
      await apiRequest<CoachSuggestion>(
        `/api/training-spaces/${selectedSpace.id}/coach-suggestions`,
        {
          method: "POST",
          body: JSON.stringify({
            target_entity_type: "workout",
            target_entity_id: targetWorkoutId,
            suggested_change_json: { notes },
          }),
        },
        token,
      );
      formElement.reset();
      setSuggestionStatus("Suggestion sent.");
    } catch (error) {
      setSuggestionStatus(error instanceof Error ? error.message : "Could not send suggestion.");
    } finally {
      setIsCreatingSuggestion(false);
    }
  }

  async function handleResolveSuggestion(suggestionId: string, action: "accept" | "reject") {
    if (!token || !selectedSpace) {
      return;
    }

    setResolvingSuggestionId(suggestionId);
    setSuggestionStatus("");
    try {
      await apiRequest<CoachSuggestion>(
        `/api/training-spaces/${selectedSpace.id}/coach-suggestions/${suggestionId}/${action}`,
        { method: "POST" },
        token,
      );
      await Promise.all([
        loadCoachSuggestions(token, selectedSpace.id, selectedSpace.my_role),
        apiRequest<Workout[]>(`/api/training-spaces/${selectedSpace.id}/workouts`, {}, token).then(setWorkouts),
      ]);
      setSuggestionStatus(action === "accept" ? "Suggestion accepted." : "Suggestion rejected.");
    } catch (error) {
      setSuggestionStatus(error instanceof Error ? error.message : `Could not ${action} suggestion.`);
    } finally {
      setResolvingSuggestionId("");
    }
  }

  function handleLogout() {
    localStorage.removeItem(tokenStorageKey);
    setToken("");
    setUser(null);
    setSpaces([]);
    setSelectedSpaceId("");
    setWorkouts([]);
    setPlannedSessions([]);
    setCoachSuggestions([]);
    setLastInvite(null);
    setInviteToken("");
    setAuthStatus("");
    setSpaceStatus("");
    setHistoryStatus("");
    setInviteStatus("");
    setSuggestionStatus("");
  }

  if (isLoadingSession) {
    return (
      <main className="app-shell app-shell-centered">
        <section className="loading-panel">
          <p className="eyebrow">Train With Me Cloud</p>
          <h1>Loading session</h1>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="app-shell auth-layout">
        <section className="auth-intro" aria-labelledby="auth-title">
          <p className="eyebrow">Train With Me Cloud</p>
          <h1 id="auth-title">Training space</h1>
          <p>Sign in to manage your cloud training history, coach access, and imported V1 data.</p>
        </section>

        <section className="auth-panel" aria-label="Authentication">
          <div className="segmented-control" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={authMode === "login" ? "active" : ""}
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === "register" ? "active" : ""}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
          </div>

          <form className="stacked-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <label>
                Name
                <input name="displayName" autoComplete="name" minLength={1} maxLength={120} required />
              </label>
            )}
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
                minLength={authMode === "login" ? 1 : 8}
                required
              />
            </label>
            {authStatus && <p className="form-status" role="status">{authStatus}</p>}
            <button type="submit" className="primary-action" disabled={isSubmittingAuth}>
              {isSubmittingAuth ? "Working" : authMode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell cloud-planner-shell">
      <header className="planner-header">
        <div className="planner-header-top">
          <div>
            <h1>Train With Me</h1>
            <p>Cloud planner: calendar-first training, shared spaces, and imported V1 history.</p>
          </div>
          <div className="account-bar">
            <div>
              <span>{user.display_name}</span>
              <small>{user.email}</small>
            </div>
            <button type="button" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <nav className="view-nav" aria-label="Main navigation">
          {cloudViews.map((view) => (
            <button
              key={view.id}
              type="button"
              className={activeView === view.id ? "nav-button is-active" : "nav-button"}
              onClick={() => setActiveView(view.id)}
            >
              {view.label}
            </button>
          ))}
        </nav>
      </header>

      <section className="space-controls-panel" aria-label="Training space controls">
        <div className="space-select-row">
          <label>
            Training space
            <select
              value={selectedSpace?.id ?? ""}
              onChange={(event) => setSelectedSpaceId(event.target.value)}
              disabled={!spaces.length}
            >
              {spaces.length ? spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name} ({space.my_role})
                </option>
              )) : (
                <option value="">No training spaces yet</option>
              )}
            </select>
          </label>
          {selectedSpace && <span className="role-pill">{selectedSpace.my_role}</span>}
        </div>

        <form className="inline-space-form" onSubmit={handleCreateSpace}>
          <label>
            New space
            <input name="spaceName" placeholder="Base Season" minLength={1} maxLength={120} required />
          </label>
          <button type="submit" disabled={isCreatingSpace}>
            {isCreatingSpace ? "Creating" : "Create space"}
          </button>
        </form>
        {spaceStatus && <p className="form-status" role="status">{spaceStatus}</p>}
      </section>

      {activeView === "calendar" && (
        <section className="view-panel" aria-label="Calendar">
          <article className="workspace-panel">
            <div className="calendar-toolbar">
              <div>
                <p className="panel-kicker">Calendar</p>
                <h2>{selectedSpace?.name ?? "Select a training space"}</h2>
                <p className="calendar-week-label">{weekLabel}</p>
              </div>
              <div className="calendar-nav">
                <button
                  type="button"
                  onClick={() => setCalendarWeekStart((current) => dateKey(addDays(new Date(`${current}T00:00:00`), -7)))}
                >
                  Previous week
                </button>
                <button type="button" onClick={() => setCalendarWeekStart(dateKey(startOfWeek(new Date())))}>
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarWeekStart((current) => dateKey(addDays(new Date(`${current}T00:00:00`), 7)))}
                >
                  Next week
                </button>
              </div>
            </div>

            <div className="metric-grid">
              <article className="metric-tile">
                <span className="metric-value">{weekWorkoutCount}</span>
                <span className="metric-label">Week workouts</span>
              </article>
              <article className="metric-tile">
                <span className="metric-value">{weekPlanCount}</span>
                <span className="metric-label">Week plans</span>
              </article>
              <article className="metric-tile">
                <span className="metric-value">{workouts.length + plannedSessions.length}</span>
                <span className="metric-label">All items</span>
              </article>
            </div>

            {historyStatus && <p className="form-status history-status" role="status">{historyStatus}</p>}

            <div className="calendar-grid" aria-label="Weekly calendar">
              {calendarDays.map((day) => (
                <article key={day.key} className={day.isToday ? "calendar-day is-today" : "calendar-day"}>
                  <div className="calendar-day-header">
                    <span>{day.label}</span>
                    <time dateTime={day.key}>{day.dateLabel}</time>
                  </div>

                  <div className="calendar-day-items">
                    {day.plannedSessions.map((session) => (
                      <button
                        type="button"
                        className={`calendar-item planned ${activityClassName(session.type)} ${statusClassName(session.status)}`}
                        key={session.id}
                        onClick={() => setCalendarSelection({ type: "planned", id: session.id })}
                      >
                        <strong>{session.title}</strong>
                        <span>{activityLabel(session.type)} • {session.status}</span>
                      </button>
                    ))}
                    {day.workouts.map((workout) => (
                      <button
                        type="button"
                        className={`calendar-item actual ${activityClassName(workout.activity)}`}
                        key={workout.id}
                        onClick={() => setCalendarSelection({ type: "workout", id: workout.id })}
                      >
                        <strong>{activityLabel(workout.activity)}</strong>
                        <span>{summarizeWorkout(workout) || "Logged workout"}</span>
                      </button>
                    ))}
                    {!day.plannedSessions.length && !day.workouts.length && (
                      <p className="calendar-empty">No training</p>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {(selectedCalendarWorkout || selectedCalendarSession) && (
              <section className="calendar-detail-panel" aria-label="Selected calendar item">
                <div className="panel-header">
                  <div>
                    <p className="panel-kicker">{selectedCalendarWorkout ? "Actual" : "Planned"}</p>
                    <h3>
                      {selectedCalendarWorkout
                        ? activityLabel(selectedCalendarWorkout.activity)
                        : selectedCalendarSession?.title}
                    </h3>
                  </div>
                  <div className="calendar-detail-actions">
                    {selectedCalendarWorkout && (
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => void handleDeleteWorkout(selectedCalendarWorkout)}
                        disabled={isDeletingCalendarItem}
                      >
                        {isDeletingCalendarItem ? "Deleting" : "Delete"}
                      </button>
                    )}
                    {selectedCalendarSession && (
                      <>
                        {selectedCalendarSession.status === "planned" && !selectedCalendarSessionWorkout && (
                          <button
                            type="button"
                            onClick={() => void handleMarkPlannedSessionMissed(selectedCalendarSession)}
                            disabled={isMarkingMissedSessionId === selectedCalendarSession.id}
                          >
                            {isMarkingMissedSessionId === selectedCalendarSession.id ? "Marking" : "Mark missed"}
                          </button>
                        )}
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => void handleDeletePlannedSession(selectedCalendarSession)}
                        disabled={isDeletingCalendarItem}
                      >
                        {isDeletingCalendarItem ? "Deleting" : "Delete"}
                      </button>
                      </>
                    )}
                    <button type="button" onClick={() => setCalendarSelection(null)}>Close</button>
                  </div>
                </div>

                {selectedCalendarWorkout && (
                  <>
                    <div className="calendar-detail-grid">
                      <div>
                        <strong>Date</strong>
                        <p>{formatDate(selectedCalendarWorkout.date)}</p>
                      </div>
                      <div>
                        <strong>Summary</strong>
                        <p>{summarizeWorkout(selectedCalendarWorkout) || "Logged workout"}</p>
                      </div>
                      <div>
                        <strong>Notes</strong>
                        <p>{selectedCalendarWorkout.notes || "No notes"}</p>
                      </div>
                    </div>
                    {selectedCalendarWorkout.activity === "strength" && selectedCalendarWorkout.strength_exercises.length > 0 && (
                      <div className="strength-detail-list">
                        {selectedCalendarWorkout.strength_exercises.map((exercise) => (
                          <article key={`${selectedCalendarWorkout.id}-${exercise.order}`}>
                            <h4>{exercise.name}</h4>
                            <ul>
                              {exercise.sets.map((set) => (
                                <li key={`${selectedCalendarWorkout.id}-${exercise.order}-${set.order}`}>
                                  Set {set.order}: {formatStrengthSet(set)}
                                </li>
                              ))}
                            </ul>
                          </article>
                        ))}
                      </div>
                    )}

                    <form
                      className="workout-notes-form"
                      onSubmit={(event) => void handleWorkoutEditSubmit(event, selectedCalendarWorkout)}
                    >
                      <h4>Edit workout</h4>
                      <div className="training-form-grid">
                        <label>
                          Date
                          <input name="workoutDate" type="date" defaultValue={selectedCalendarWorkout.date} required />
                        </label>
                        {selectedCalendarWorkout.activity === "run" && (
                          <>
                            <label>
                              Distance (km)
                              <input
                                name="workoutRunDistance"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={selectedCalendarWorkout.distance ?? ""}
                                required
                              />
                            </label>
                            <label>
                              Time
                              <input name="workoutRunTime" inputMode="numeric" defaultValue={selectedCalendarWorkout.time ?? ""} required />
                            </label>
                          </>
                        )}
                        {selectedCalendarWorkout.activity === "sprint" && (
                          <label>
                            Feeling
                            <select name="workoutSprintFeeling" defaultValue={selectedCalendarWorkout.sprint_feeling ?? ""}>
                              <option value="">Select feeling</option>
                              <option value="sharp">Sharp</option>
                              <option value="solid">Solid</option>
                              <option value="flat">Flat</option>
                              <option value="sluggish">Sluggish</option>
                              <option value="pain">Pain</option>
                            </select>
                          </label>
                        )}
                      </div>
                      {selectedCalendarWorkout.activity === "sprint" && (
                        <div className="strength-detail-list">
                          {workoutEditSprintDraft.map((set, setIndex) => (
                            <article key={`${selectedCalendarWorkout.id}-sprint-edit-${setIndex}`}>
                              <h4>Set {setIndex + 1}</h4>
                              <div className="training-form-grid">
                                <label>
                                  Distance (m)
                                  <input
                                    type="number"
                                    min="1"
                                    value={set.distance_m}
                                    onChange={(event) => updateWorkoutEditSprintSet(setIndex, { distance_m: Number(event.currentTarget.value) })}
                                  />
                                </label>
                                <label>
                                  Time (sec)
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={set.time_sec}
                                    onChange={(event) => updateWorkoutEditSprintSet(setIndex, { time_sec: Number(event.currentTarget.value) })}
                                  />
                                </label>
                                <button type="button" className="danger-button" onClick={() => removeWorkoutEditSprintSet(setIndex)}>
                                  Remove set
                                </button>
                              </div>
                            </article>
                          ))}
                          <button type="button" onClick={addWorkoutEditSprintSet}>Add sprint set</button>
                        </div>
                      )}
                      {selectedCalendarWorkout.activity === "strength" && (
                        <div className="strength-detail-list">
                          {workoutEditStrengthDraft.map((exercise, exerciseIndex) => (
                            <article key={`${selectedCalendarWorkout.id}-strength-edit-${exerciseIndex}`}>
                              <label>
                                Exercise
                                <input value={exercise.name} onChange={(event) => updateWorkoutEditStrengthExercise(exerciseIndex, event.currentTarget.value)} />
                              </label>
                              {exercise.sets.map((set, setIndex) => (
                                <div className="training-form-grid" key={`${selectedCalendarWorkout.id}-strength-edit-${exerciseIndex}-${setIndex}`}>
                                  <label>
                                    Reps
                                    <input
                                      type="number"
                                      min="0"
                                      value={set.reps}
                                      onChange={(event) => updateWorkoutEditStrengthSet(exerciseIndex, setIndex, { reps: Number(event.currentTarget.value) })}
                                    />
                                  </label>
                                  <label>
                                    Load
                                    <select
                                      value={set.load_type}
                                      onChange={(event) => updateWorkoutEditStrengthSet(exerciseIndex, setIndex, {
                                        load_type: event.currentTarget.value,
                                        weight: null,
                                        band_color: "",
                                      })}
                                    >
                                      <option value="kg">kg</option>
                                      <option value="bodyweight">body weight</option>
                                      <option value="band">band</option>
                                    </select>
                                  </label>
                                  {set.load_type === "kg" && (
                                    <label>
                                      Weight
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={set.weight ?? ""}
                                        onChange={(event) => updateWorkoutEditStrengthSet(exerciseIndex, setIndex, {
                                          weight: event.currentTarget.value ? Number(event.currentTarget.value) : null,
                                        })}
                                      />
                                    </label>
                                  )}
                                  {set.load_type === "band" && (
                                    <label>
                                      Band
                                      <input
                                        value={set.band_color}
                                        onChange={(event) => updateWorkoutEditStrengthSet(exerciseIndex, setIndex, { band_color: event.currentTarget.value })}
                                      />
                                    </label>
                                  )}
                                  <button type="button" className="danger-button" onClick={() => removeWorkoutEditStrengthSet(exerciseIndex, setIndex)}>
                                    Remove set
                                  </button>
                                </div>
                              ))}
                              <button type="button" onClick={() => addWorkoutEditStrengthSet(exerciseIndex)}>Add set</button>
                            </article>
                          ))}
                          <button type="button" onClick={addWorkoutEditStrengthExercise}>Add exercise</button>
                        </div>
                      )}
                      <label>
                        Notes
                        <textarea name="workoutNotes" rows={3} defaultValue={selectedCalendarWorkout.notes} />
                      </label>
                      {workoutEditStatus && <p className="form-status neutral-status" role="status">{workoutEditStatus}</p>}
                      <button type="submit" disabled={isSavingWorkoutNotes}>
                        {isSavingWorkoutNotes ? "Saving" : "Save workout"}
                      </button>
                    </form>
                  </>
                )}

                {selectedCalendarSession && (
                  <>
                    <div className="calendar-detail-grid">
                      <div>
                        <strong>Date</strong>
                        <p>{formatDate(selectedCalendarSession.date)}</p>
                      </div>
                      <div>
                        <strong>Planned</strong>
                        <p>{activityLabel(selectedCalendarSession.type)} • {summarizePlanDetails(selectedCalendarSession)}</p>
                      </div>
                      <div>
                        <strong>Actual</strong>
                        <p>
                          {selectedCalendarSessionWorkout
                            ? `${activityLabel(selectedCalendarSessionWorkout.activity)} • ${summarizeWorkout(selectedCalendarSessionWorkout) || "Logged workout"}`
                            : selectedCalendarSession.actual_json
                              ? "Actual data saved"
                              : "No actual linked yet"}
                        </p>
                      </div>
                    </div>
                    {selectedCalendarSessionWorkout?.activity === "strength" && selectedCalendarSessionWorkout.strength_exercises.length > 0 && (
                      <div className="strength-detail-list">
                        {selectedCalendarSessionWorkout.strength_exercises.map((exercise) => (
                          <article key={`${selectedCalendarSession.id}-${selectedCalendarSessionWorkout.id}-${exercise.order}`}>
                            <h4>{exercise.name}</h4>
                            <ul>
                              {exercise.sets.map((set) => (
                                <li key={`${selectedCalendarSession.id}-${selectedCalendarSessionWorkout.id}-${exercise.order}-${set.order}`}>
                                  Set {set.order}: {formatStrengthSet(set)}
                                </li>
                              ))}
                            </ul>
                          </article>
                        ))}
                      </div>
                    )}

                    {!selectedCalendarSessionWorkout && selectedCalendarSession.status === "planned" && (
                      selectedCalendarSession.type === "run" || selectedCalendarSession.type === "sprint" || selectedCalendarSession.type === "strength"
                    ) && (
                      <form
                        className="planned-session-edit-form"
                        onSubmit={(event) => void handlePlannedSessionEditSubmit(event, selectedCalendarSession)}
                      >
                        <h4>Edit planned session</h4>
                        <div className="training-form-grid">
                          <label>
                            Date
                            <input name="plannedEditDate" type="date" defaultValue={selectedCalendarSession.date} required />
                          </label>
                          <label>
                            Title
                            <input name="plannedEditTitle" defaultValue={selectedCalendarSession.title} required />
                          </label>
                        </div>
                        {selectedCalendarSession.type === "run" ? (
                          <div className="training-form-grid">
                            <label>
                              Distance (km)
                              <input
                                name="plannedEditRunDistance"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={typeof selectedCalendarSession.details_json.distance === "number" ? selectedCalendarSession.details_json.distance : ""}
                              />
                            </label>
                            <label>
                              Target pace
                              <input
                                name="plannedEditRunPace"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={typeof selectedCalendarSession.details_json.paceGoal === "number" ? selectedCalendarSession.details_json.paceGoal : ""}
                              />
                            </label>
                          </div>
                        ) : selectedCalendarSession.type === "sprint" ? (
                          <div className="training-form-grid">
                            <label>
                              Reps
                              <input
                                name="plannedEditSprintReps"
                                type="number"
                                min="1"
                                step="1"
                                defaultValue={typeof selectedCalendarSprintBlock.reps === "number" ? selectedCalendarSprintBlock.reps : ""}
                              />
                            </label>
                            <label>
                              Distance (m)
                              <input
                                name="plannedEditSprintDistance"
                                type="number"
                                min="1"
                                step="1"
                                defaultValue={
                                  typeof selectedCalendarSprintBlock.distanceM === "number"
                                    ? selectedCalendarSprintBlock.distanceM
                                    : ""
                                }
                              />
                            </label>
                            <label>
                              Target time (sec)
                              <input
                                name="plannedEditSprintTargetTime"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={
                                  typeof selectedCalendarSprintBlock.targetTimeSec === "number"
                                    ? selectedCalendarSprintBlock.targetTimeSec
                                    : ""
                                }
                              />
                            </label>
                            <label>
                              Rest (sec)
                              <input
                                name="plannedEditSprintRest"
                                type="number"
                                min="0"
                                step="1"
                                defaultValue={
                                  typeof selectedCalendarSprintBlock.restSec === "number"
                                    ? selectedCalendarSprintBlock.restSec
                                    : ""
                                }
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="strength-detail-list">
                            {plannedStrengthBlocks(selectedCalendarSession).map((block, blockIndex) => (
                              <article key={`${selectedCalendarSession.id}-planned-${blockIndex}`}>
                                <h4>{typeof block.label === "string" ? block.label : `Block ${blockIndex + 1}`}</h4>
                                <p>{block.sets ? `${String(block.sets)} set(s)` : "Sets not specified"}</p>
                                <ul>
                                  {plannedExerciseRows(block).map((exercise, exerciseIndex) => (
                                    <li key={`${selectedCalendarSession.id}-planned-${blockIndex}-${exerciseIndex}`}>
                                      {typeof exercise.name === "string" ? exercise.name : "Exercise"}
                                      {exercise.reps ? ` • ${String(exercise.reps)} reps` : ""}
                                      {typeof exercise.weight === "number" ? ` @ ${formatNumber(exercise.weight)} kg` : ""}
                                    </li>
                                  ))}
                                </ul>
                              </article>
                            ))}
                          </div>
                        )}
                        {plannedEditStatus && <p className="form-status neutral-status" role="status">{plannedEditStatus}</p>}
                        <button type="submit" disabled={isSavingPlannedSession}>
                          {isSavingPlannedSession ? "Saving" : "Save planned session"}
                        </button>
                      </form>
                    )}

                    {!selectedCalendarSessionWorkout && selectedCalendarSession.status === "planned" && (
                      selectedCalendarSession.type === "run" || selectedCalendarSession.type === "sprint"
                    ) && (
                      <form
                        className="completion-form"
                        onSubmit={(event) => void handleCompletePlannedSession(event, selectedCalendarSession)}
                      >
                        <h4>Log & complete</h4>
                        {selectedCalendarSession.type === "run" ? (
                          <div className="training-form-grid">
                            <label>
                              Distance (km)
                              <input
                                name="completionRunDistance"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={typeof selectedCalendarSession.details_json.distance === "number" ? selectedCalendarSession.details_json.distance : ""}
                                required
                              />
                            </label>
                            <label>
                              Time
                              <input name="completionRunTime" inputMode="numeric" placeholder="22:00" required />
                            </label>
                          </div>
                        ) : (
                          <div className="training-form-grid">
                            <label>
                              Distance (m)
                              <input
                                name="completionSprintDistance"
                                type="number"
                                min="1"
                                step="1"
                                defaultValue={
                                  typeof selectedCalendarSprintBlock.distanceM === "number"
                                    ? selectedCalendarSprintBlock.distanceM
                                    : ""
                                }
                                required
                              />
                            </label>
                            <label>
                              Time (sec)
                              <input name="completionSprintTime" type="number" min="0" step="0.01" required />
                            </label>
                            <label>
                              Feeling
                              <select name="completionSprintFeeling">
                                <option value="">Select feeling</option>
                                <option value="sharp">Sharp</option>
                                <option value="solid">Solid</option>
                                <option value="flat">Flat</option>
                                <option value="sluggish">Sluggish</option>
                                <option value="pain">Pain</option>
                              </select>
                            </label>
                          </div>
                        )}
                        <label>
                          Notes
                          <textarea name="completionNotes" rows={2} placeholder="What changed or how did it feel?" />
                        </label>
                        {completionStatus && <p className="form-status neutral-status" role="status">{completionStatus}</p>}
                        <button type="submit" disabled={isCompletingSessionId === selectedCalendarSession.id}>
                          {isCompletingSessionId === selectedCalendarSession.id ? "Completing" : "Complete planned session"}
                        </button>
                      </form>
                    )}

                    {!selectedCalendarSessionWorkout && selectedCalendarSession.status === "planned" && selectedCalendarSession.type === "strength" && (
                      <form
                        className="completion-form"
                        onSubmit={(event) => void handleCompleteStrengthSession(event, selectedCalendarSession)}
                      >
                        <h4>Log & complete</h4>
                        <div className="strength-detail-list">
                          {strengthCompletionDraft.map((block, blockIndex) => (
                            <article key={`${selectedCalendarSession.id}-completion-${blockIndex}`}>
                              <h4>{block.label}</h4>
                              <p>{block.planned_sets ? `${block.planned_sets} planned set(s)` : "Sets not specified"}</p>
                              {block.exercises.map((exercise, exerciseIndex) => (
                                <div className="program-block-preview" key={`${block.label}-${exerciseIndex}`}>
                                  <label className="checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={exercise.completed}
                                      onChange={(event) => updateStrengthCompletionExercise(blockIndex, exerciseIndex, { completed: event.currentTarget.checked })}
                                    />
                                    {exercise.name}
                                  </label>
                                  <p>
                                    Planned: {exercise.planned_reps || "-"} reps
                                    {exercise.planned_weight != null ? ` @ ${formatNumber(exercise.planned_weight)} kg` : ""}
                                  </p>
                                  {exercise.actual_sets.map((set) => (
                                    <div className="training-form-grid" key={set.id}>
                                      <label>
                                        Reps
                                        <input
                                          type="number"
                                          min="0"
                                          value={set.reps}
                                          onChange={(event) => updateStrengthCompletionSet(blockIndex, exerciseIndex, set.id, { reps: event.currentTarget.value })}
                                        />
                                      </label>
                                      <label>
                                        Load
                                        <select
                                          value={set.load_type}
                                          onChange={(event) => updateStrengthCompletionSet(blockIndex, exerciseIndex, set.id, { load_type: event.currentTarget.value, weight: "", band_color: "" })}
                                        >
                                          <option value="kg">kg</option>
                                          <option value="bodyweight">body weight</option>
                                          <option value="band">band</option>
                                        </select>
                                      </label>
                                      {set.load_type === "kg" && (
                                        <label>
                                          Weight
                                          <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={set.weight}
                                            onChange={(event) => updateStrengthCompletionSet(blockIndex, exerciseIndex, set.id, { weight: event.currentTarget.value })}
                                          />
                                        </label>
                                      )}
                                      {set.load_type === "band" && (
                                        <label>
                                          Band
                                          <input
                                            value={set.band_color}
                                            onChange={(event) => updateStrengthCompletionSet(blockIndex, exerciseIndex, set.id, { band_color: event.currentTarget.value })}
                                          />
                                        </label>
                                      )}
                                      <button type="button" className="danger-button" onClick={() => removeStrengthCompletionSet(blockIndex, exerciseIndex, set.id)}>
                                        Remove set
                                      </button>
                                    </div>
                                  ))}
                                  <button type="button" onClick={() => addStrengthCompletionSet(blockIndex, exerciseIndex)}>Add set</button>
                                </div>
                              ))}
                            </article>
                          ))}
                        </div>
                        <label>
                          Notes
                          <textarea name="completionNotes" rows={2} placeholder="What changed or how did it feel?" />
                        </label>
                        {completionStatus && <p className="form-status neutral-status" role="status">{completionStatus}</p>}
                        <button type="submit" disabled={isCompletingSessionId === selectedCalendarSession.id}>
                          {isCompletingSessionId === selectedCalendarSession.id ? "Completing" : "Complete planned strength"}
                        </button>
                      </form>
                    )}
                  </>
                )}
              </section>
            )}

            <section className="add-training-card" aria-label="Add training">
              <div className="add-training-header">
                <div>
                  <p className="panel-kicker">Add training</p>
                  <h3>{addTrainingMode === "log" ? "Log actual" : "Plan session"}</h3>
                </div>
                <div className="mode-toggle" aria-label="Add training mode">
                  <button
                    type="button"
                    className={addTrainingMode === "log" ? "is-active" : ""}
                    onClick={() => setAddTrainingMode("log")}
                  >
                    Log actual
                  </button>
                  <button
                    type="button"
                    className={addTrainingMode === "plan" ? "is-active" : ""}
                    onClick={() => setAddTrainingMode("plan")}
                  >
                    Plan session
                  </button>
                </div>
              </div>

              <form className="training-form" onSubmit={handleTrainingSubmit}>
                <div className="training-form-grid">
                  <label>
                    Date
                    <input name="trainingDate" type="date" defaultValue={dateKey(new Date())} required />
                  </label>

                  {addTrainingMode === "log" ? (
                    <label>
                      Activity
                      <select
                        name="actualActivity"
                        value={actualActivity}
                        onChange={(event) => setActualActivity(event.target.value as Activity)}
                      >
                        <option value="strength">Strength</option>
                        <option value="run">Run</option>
                        <option value="sprint">Sprint</option>
                      </select>
                    </label>
                  ) : (
                    <label>
                      Session type
                      <select
                        name="plannedType"
                        value={plannedType}
                        onChange={(event) => setPlannedType(event.target.value as PlannedType)}
                      >
                        <option value="run">Run</option>
                        <option value="sprint">Sprint</option>
                      </select>
                    </label>
                  )}
                </div>

                {addTrainingMode === "log" && actualActivity === "strength" && (
                  <section className="strength-builder" aria-label="Strength workout builder">
                    <div className="training-form-grid">
                      <label>
                        Exercise
                        <input
                          list="strength-exercise-suggestions"
                          value={strengthExerciseName}
                          onChange={(event) => setStrengthExerciseName(event.target.value)}
                          placeholder="Back squat"
                        />
                        <datalist id="strength-exercise-suggestions">
                          {strengthExerciseSuggestions.map((name) => (
                            <option key={name} value={name} />
                          ))}
                        </datalist>
                      </label>
                      <label>
                        Reps
                        <input
                          type="number"
                          min="0"
                          value={strengthReps}
                          onChange={(event) => setStrengthReps(event.target.value)}
                          placeholder="5"
                        />
                      </label>
                      <label>
                        Load type
                        <select
                          value={strengthLoadType}
                          onChange={(event) => setStrengthLoadType(event.target.value)}
                        >
                          <option value="kg">kg</option>
                          <option value="bodyweight">Body weight</option>
                          <option value="band">Band</option>
                        </select>
                      </label>
                      {strengthLoadType === "kg" && (
                        <label>
                          Weight
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={strengthWeight}
                            onChange={(event) => setStrengthWeight(event.target.value)}
                            placeholder="60"
                          />
                        </label>
                      )}
                      {strengthLoadType === "band" && (
                        <label>
                          Band color
                          <input
                            value={strengthBandColor}
                            onChange={(event) => setStrengthBandColor(event.target.value)}
                            placeholder="red"
                          />
                        </label>
                      )}
                    </div>
                    <div className="strength-builder-actions">
                      <button type="button" onClick={handleAddStrengthSet}>Add set to workout</button>
                      <button type="button" onClick={resetStrengthDraft} disabled={!strengthDraftExercises.length}>
                        Clear sets
                      </button>
                    </div>
                    <div className="strength-draft-list" aria-live="polite">
                      {strengthDraftExercises.length > 0 && (
                        <div className="strength-draft-summary">
                          {strengthDraftExercises.reduce((total, exercise) => total + exercise.sets.length, 0)} set(s) ready to save
                        </div>
                      )}
                      {strengthDraftExercises.length ? strengthDraftExercises.map((exercise, exerciseIndex) => (
                        <article className="strength-draft-exercise" key={`${exercise.name}-${exercise.order}`}>
                          <h4>{exercise.name}</h4>
                          <div className="strength-draft-sets">
                            {exercise.sets.map((set, setIndex) => (
                              <div key={`${exercise.name}-${set.order}`} className="strength-draft-set">
                                <span>
                                  Set {set.order}: {formatStrengthSet(set)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStrengthSet(exerciseIndex, setIndex)}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </article>
                      )) : (
                        <p className="empty-state">No strength sets added yet.</p>
                      )}
                    </div>
                  </section>
                )}

                {addTrainingMode === "log" && actualActivity === "run" && (
                  <div className="training-form-grid">
                    <label>
                      Distance (km)
                      <input name="runDistance" type="number" min="0" step="0.01" placeholder="5" required />
                    </label>
                    <label>
                      Time
                      <input name="runTime" inputMode="numeric" placeholder="22:00" required />
                    </label>
                  </div>
                )}

                {addTrainingMode === "log" && actualActivity === "sprint" && (
                  <div className="training-form-grid">
                    <label>
                      Distance (m)
                      <input name="sprintDistance" type="number" min="1" step="1" placeholder="100" required />
                    </label>
                    <label>
                      Time (sec)
                      <input name="sprintTime" type="number" min="0" step="0.01" placeholder="14.2" required />
                    </label>
                    <label>
                      Feeling
                      <select name="sprintFeeling">
                        <option value="">Select feeling</option>
                        <option value="sharp">Sharp</option>
                        <option value="solid">Solid</option>
                        <option value="flat">Flat</option>
                        <option value="sluggish">Sluggish</option>
                        <option value="pain">Pain</option>
                      </select>
                    </label>
                  </div>
                )}

                {addTrainingMode === "plan" && (
                  <>
                    <div className="training-form-grid">
                      <label>
                        Title
                        <input name="plannedTitle" placeholder="Easy run" required />
                      </label>
                      {plannedType === "run" ? (
                        <>
                          <label>
                            Distance (km)
                            <input name="plannedRunDistance" type="number" min="0" step="0.01" placeholder="8" />
                          </label>
                          <label>
                            Target pace
                            <input name="plannedRunPace" type="number" min="0" step="0.01" placeholder="5.5" />
                          </label>
                        </>
                      ) : (
                        <>
                          <label>
                            Reps
                            <input name="plannedSprintReps" type="number" min="1" step="1" placeholder="6" />
                          </label>
                          <label>
                            Distance (m)
                            <input name="plannedSprintDistance" type="number" min="1" step="1" placeholder="100" />
                          </label>
                          <label>
                            Target time (sec)
                            <input name="plannedSprintTargetTime" type="number" min="0" step="0.01" placeholder="14.2" />
                          </label>
                          <label>
                            Rest (sec)
                            <input name="plannedSprintRest" type="number" min="0" step="1" placeholder="90" />
                          </label>
                        </>
                      )}
                    </div>
                  </>
                )}

                <label>
                  Notes
                  <textarea name="trainingNotes" rows={3} placeholder="How did it feel or what is the plan?" />
                </label>

                {trainingFormStatus && <p className="form-status neutral-status" role="status">{trainingFormStatus}</p>}
                <button type="submit" className="primary-action" disabled={isSavingTraining || !selectedSpace}>
                  {isSavingTraining ? "Saving" : addTrainingMode === "log" ? "Save workout" : "Save planned session"}
                </button>
              </form>
            </section>

            <div className="history-grid" aria-busy={isLoadingHistory}>
              <section className="history-panel" aria-label="Workouts">
                <div className="history-panel-header">
                  <div>
                    <p className="panel-kicker">Actual</p>
                    <h3>Workouts</h3>
                  </div>
                  {isLoadingHistory && <span className="subtle-text">Loading</span>}
                </div>

                <div className="history-list">
                  {workouts.length ? workouts.map((workout) => {
                    const linkedPlan = plannedSessionByWorkoutId.get(workout.id);
                    return (
                      <article className="history-item" key={workout.id}>
                        <div className="item-main">
                          <div>
                            <h4>{activityLabel(workout.activity)}</h4>
                            <p>{summarizeWorkout(workout) || "No summary"}</p>
                            {linkedPlan && <p className="linked-text">Plan: {linkedPlan.title}</p>}
                          </div>
                          <time>{formatDate(workout.date)}</time>
                        </div>
                      </article>
                    );
                  }) : (
                    <p className="empty-state">No workouts in this space.</p>
                  )}
                </div>
              </section>

              <section className="history-panel" aria-label="Planned sessions">
                <div className="history-panel-header">
                  <div>
                    <p className="panel-kicker">Planned</p>
                    <h3>Sessions</h3>
                  </div>
                  {isLoadingHistory && <span className="subtle-text">Loading</span>}
                </div>

                <div className="history-list">
                  {plannedSessions.length ? plannedSessions.map((session) => {
                    const linkedWorkout = session.linked_workout_id ? workoutsById.get(session.linked_workout_id) : null;
                    return (
                      <article className="history-item" key={session.id}>
                        <div className="item-main">
                          <div>
                            <h4>{session.title}</h4>
                            <p>{activityLabel(session.type)} • {summarizePlanDetails(session)}</p>
                            {linkedWorkout && <p className="linked-text">Actual: {activityLabel(linkedWorkout.activity)} on {formatDate(linkedWorkout.date)}</p>}
                            {session.actual_json && <p className="linked-text">Actual data saved</p>}
                          </div>
                          <time>{formatDate(session.date)}</time>
                        </div>
                        <div className="badge-row">
                          <span className={`status-badge ${statusClassName(session.status)}`}>{session.status}</span>
                        </div>
                      </article>
                    );
                  }) : (
                    <p className="empty-state">No planned sessions in this space.</p>
                  )}
                </div>
              </section>
            </div>
          </article>
        </section>
      )}

      {activeView === "programs" && (
        <section className="view-panel" aria-label="Programs">
          <article className="workspace-panel">
            <p className="panel-kicker">Programs</p>
            <h2>Strength programs</h2>
            <p className="empty-state">Create, schedule, and review strength programs for the selected space.</p>

            {programStatus && <p className="form-status" role="status">{programStatus}</p>}
            {programTemplateStatus && <p className="form-status neutral-status" role="status">{programTemplateStatus}</p>}

            <section className="program-section cloud-program-section" aria-label="Program templates">
              <div className="program-section-header">
                <div>
                  <h3>Program templates</h3>
                  <p>Create reusable strength templates and schedule them into the calendar.</p>
                </div>
              </div>

              <form
                key={editingProgramTemplate?.id ?? "new-program-template"}
                className="program-template-form"
                onSubmit={handleProgramTemplateSubmit}
              >
                <div className="training-form-grid">
                  <label>
                    Name
                    <input name="programTemplateName" placeholder="Base strength" defaultValue={editingProgramTemplate?.name ?? ""} required />
                  </label>
                  <label>
                    Duration (weeks)
                    <input name="programTemplateDuration" type="number" min="1" max="52" defaultValue={editingProgramTemplate?.duration_weeks ?? 4} required />
                  </label>
                  <label>
                    Start date
                    <input
                      name="programTemplateStartDate"
                      type="date"
                      defaultValue={typeof editingProgramTemplate?.template_json.startDate === "string" ? editingProgramTemplate.template_json.startDate : ""}
                      required
                    />
                  </label>
                  <label>
                    Notes
                    <input name="programTemplateNotes" placeholder="Optional" defaultValue={editingProgramTemplate?.notes ?? ""} />
                  </label>
                </div>
                <section className="program-slot-builder" aria-label="Program workout builder">
                  <h4>Workout structure</h4>
                  <div className="program-slot-form">
                    <div className="training-form-grid">
                      <label>
                        Weekday
                        <select name="programSlotWeekday" defaultValue="1">
                          <option value="1">Monday</option>
                          <option value="2">Tuesday</option>
                          <option value="3">Wednesday</option>
                          <option value="4">Thursday</option>
                          <option value="5">Friday</option>
                          <option value="6">Saturday</option>
                          <option value="7">Sunday</option>
                        </select>
                      </label>
                      <label>
                        Session title
                        <input name="programSlotTitle" placeholder="Strength A" />
                      </label>
                      <label>
                        Slot notes
                        <input name="programSlotNotes" placeholder="Optional" />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        if (event.currentTarget.form) {
                          handleAddProgramSlot(event.currentTarget.form);
                        }
                      }}
                    >
                      Add weekday workout
                    </button>
                  </div>

                  {programSlotDrafts.length > 0 && (
                    <div className="program-slot-form">
                      <h5>Add block</h5>
                      <div className="training-form-grid">
                        <label>
                          Workout
                          <select name="programBlockSlotId">
                            {programSlotDrafts.map((slot) => (
                              <option key={slot.id} value={slot.id}>{weekdayLabel(slot.weekday)} • {slot.title}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Block
                          <input name="programBlockLabel" placeholder="Main lift" />
                        </label>
                        <label>
                          Sets
                          <input name="programBlockSets" placeholder="3" />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          if (event.currentTarget.form) {
                            handleAddProgramBlock(event.currentTarget.form);
                          }
                        }}
                      >
                        Add block
                      </button>
                    </div>
                  )}

                  {programSlotDrafts.some((slot) => slot.blocks.length > 0) && (
                    <div className="program-slot-form">
                      <h5>Add exercise</h5>
                      <div className="training-form-grid">
                        <label>
                          Block
                          <select name="programExerciseBlockRef">
                            {programSlotDrafts.flatMap((slot) => slot.blocks.map((block) => (
                              <option key={`${slot.id}-${block.id}`} value={`${slot.id}::${block.id}`}>
                                {weekdayLabel(slot.weekday)} • {slot.title} • {block.label}
                              </option>
                            )))}
                          </select>
                        </label>
                        <label>
                          Exercise
                          <input name="programExerciseName" placeholder="Back squat" />
                        </label>
                        <label>
                          Reps
                          <input name="programExerciseReps" placeholder="5" />
                        </label>
                        <label>
                          Target weight
                          <input name="programExerciseWeight" type="number" min="0" step="0.1" placeholder="Optional" />
                        </label>
                        <label>
                          Exercise notes
                          <input name="programExerciseNotes" placeholder="Optional" />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          if (event.currentTarget.form) {
                            handleAddProgramExercise(event.currentTarget.form);
                          }
                        }}
                      >
                        Add exercise
                      </button>
                    </div>
                  )}

                  <div className="program-slot-list">
                    {programSlotDrafts.length ? programSlotDrafts.map((slot) => (
                      <article className="program-slot-card" key={slot.id}>
                        <div>
                          <h5>{weekdayLabel(slot.weekday)} • {slot.title}</h5>
                          {slot.notes && <p>{slot.notes}</p>}
                          {slot.blocks.length ? slot.blocks.map((block) => (
                            <div className="program-block-preview" key={block.id}>
                              <div className="program-block-preview-header">
                                <strong>{block.label}</strong>
                                <button type="button" onClick={() => handleRemoveProgramBlock(slot.id, block.id)}>Remove block</button>
                              </div>
                              <p>{block.sets} set(s)</p>
                              {block.exercises.length ? (
                                <ul>
                                  {block.exercises.map((exercise, exerciseIndex) => (
                                    <li key={`${block.id}-${exerciseIndex}`}>
                                      {exercise.name} • {exercise.reps} reps
                                      {exercise.weight != null ? ` @ ${formatNumber(exercise.weight)} kg` : ""}
                                      {exercise.notes ? ` • ${exercise.notes}` : ""}
                                      <button type="button" onClick={() => handleRemoveProgramExercise(slot.id, block.id, exerciseIndex)}>Remove</button>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p>No exercises in this block yet.</p>
                              )}
                            </div>
                          )) : (
                            <p>No blocks in this workout yet.</p>
                          )}
                        </div>
                        <button type="button" onClick={() => handleRemoveProgramSlot(slot.id)}>Remove workout</button>
                      </article>
                    )) : (
                      <p className="empty-state">No workout slots added yet.</p>
                    )}
                  </div>
                </section>
                <div className="dialog-actions">
                  <button type="submit" disabled={isSavingProgramTemplate}>
                    {isSavingProgramTemplate ? "Saving" : editingProgramTemplate ? "Save template changes" : "Save template"}
                  </button>
                  {editingProgramTemplate && (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={(event) => cancelProgramTemplateEdit(event.currentTarget.form)}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>

              <div className="program-list">
                {programTemplates.length ? programTemplates.map((template) => (
                  <article className="program-card" key={template.id}>
                    <h4>{template.name}</h4>
                    <p>
                      {template.duration_weeks} week(s)
                      {typeof template.template_json.startDate === "string" && template.template_json.startDate
                        ? ` • Starts ${formatDate(template.template_json.startDate)}`
                        : ""}
                      {Array.isArray(template.template_json.weekdaySlots) ? ` • ${template.template_json.weekdaySlots.length} workout slot(s)` : ""}
                      {template.notes ? ` • ${template.notes}` : ""}
                    </p>
                    <button type="button" className="ghost-button" onClick={() => handleEditProgramTemplate(template)}>
                      Edit template
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => void handleDeleteProgramTemplate(template)}
                      disabled={isDeletingProgramTemplateId === template.id}
                    >
                      {isDeletingProgramTemplateId === template.id ? "Deleting" : "Delete template"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleScheduleProgramTemplate(template)}
                      disabled={isSchedulingProgramId === template.id}
                    >
                      {isSchedulingProgramId === template.id ? "Scheduling" : "Schedule program"}
                    </button>
                  </article>
                )) : (
                  <p className="empty-state">No program templates yet.</p>
                )}
              </div>
            </section>

            <div className="program-grid">
              <section className="program-section" aria-label="Scheduled programs">
                <h3>Scheduled programs</h3>
                <div className="program-list">
                  {programInstances.length ? programInstances.map((instance) => (
                    <article className="program-card" key={instance.id}>
                      <h4>{instance.template_name}</h4>
                      <p>
                        Starts {formatDate(instance.start_date)}
                        {` • ${instance.duration_weeks} week(s)`}
                        {` • ${instance.generated_session_ids.length} generated session(s)`}
                      </p>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => void handleRemoveProgramInstance(instance)}
                        disabled={isRemovingProgramInstanceId === instance.id}
                      >
                        {isRemovingProgramInstanceId === instance.id ? "Removing" : "Remove scheduled program"}
                      </button>
                    </article>
                  )) : (
                    <p className="empty-state">No scheduled programs yet.</p>
                  )}
                </div>
              </section>

            </div>

            <section className="program-progress-section" aria-label="Program progress">
              <h3>Program progress</h3>
              <div className="program-progress-list">
                {programProgress.length ? programProgress.map((program) => (
                  <article className="program-progress-card" key={program.id}>
                    <div className="program-progress-header">
                      <div>
                        <h4>{program.name}</h4>
                        <p>
                          {program.startDate ? `Starts ${formatDate(program.startDate)}` : "Start date not set"}
                          {program.total ? ` • ${program.total} session(s)` : ""}
                        </p>
                      </div>
                      <span className="status-badge status-progress">
                        {program.total
                          ? `${Math.round(((program.completed + program.modified) / program.total) * 100)}% reviewed`
                          : "No sessions"}
                      </span>
                    </div>

                    <div className="program-progress-summary">
                      <div><strong>{program.completed}</strong><span>Completed</span></div>
                      <div><strong>{program.modified}</strong><span>Modified</span></div>
                      <div><strong>{program.missed}</strong><span>Missed</span></div>
                      <div><strong>{program.planned}</strong><span>Planned</span></div>
                    </div>

                    {program.weeks.length ? (
                      <div className="program-week-list">
                        {program.weeks.map((week) => (
                          <details className="program-week-detail" key={`${program.id}-${week.label}`}>
                            <summary className="program-week-row">
                              <strong>{week.label}</strong>
                              <span>
                                {week.completed} completed
                                {week.modified ? ` • ${week.modified} modified` : ""}
                                {week.missed ? ` • ${week.missed} missed` : ""}
                                {week.planned ? ` • ${week.planned} planned` : ""}
                              </span>
                            </summary>
                            <div className="program-session-list">
                              {week.sessions.map((session) => {
                                const linkedWorkout = session.linked_workout_id ? workoutsById.get(session.linked_workout_id) : null;
                                return (
                                  <article className="program-session-row" key={`${program.id}-${session.id}`}>
                                    <div>
                                      <strong>{formatDate(session.date)} • {session.title}</strong>
                                      <p>
                                        {activityLabel(session.type)} • {summarizePlanDetails(session)}
                                        {session.type === "strength" && strengthPlanPreview(session) ? ` • ${strengthPlanPreview(session)}` : ""}
                                      </p>
                                      <p>
                                        {linkedWorkout
                                          ? `Actual: ${summarizeWorkout(linkedWorkout) || "Logged workout"}`
                                          : session.actual_json
                                            ? "Actual data saved"
                                            : "No actual linked yet"}
                                      </p>
                                    </div>
                                    <div className="program-session-actions">
                                      <span className={`status-badge ${statusClassName(session.status)}`}>{session.status}</span>
                                      <button type="button" onClick={() => openProgramSessionInCalendar(session)}>
                                        Open in Calendar
                                      </button>
                                    </div>
                                  </article>
                                );
                              })}
                            </div>
                          </details>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-state">No generated sessions were imported for this program.</p>
                    )}
                  </article>
                )) : (
                  <p className="empty-state">Schedule programs to see progress here.</p>
                )}
              </div>
            </section>
          </article>
        </section>
      )}

      {activeView === "review" && (
        <section className="view-panel" aria-label="Review">
          <article className="workspace-panel">
            <p className="panel-kicker">Review</p>
            <h2>Planned vs actual</h2>

            <div className="review-summary">
              <article>
                <span>{reviewCounts.completed}</span>
                <small>Completed</small>
              </article>
              <article>
                <span>{reviewCounts.modified}</span>
                <small>Modified</small>
              </article>
              <article>
                <span>{reviewCounts.missed}</span>
                <small>Missed</small>
              </article>
              <article>
                <span>{reviewCounts.planned}</span>
                <small>Still planned</small>
              </article>
            </div>

            <div className="review-list">
              {plannedSessions.length ? plannedSessions.map((session) => {
                const linkedWorkout = session.linked_workout_id ? workoutsById.get(session.linked_workout_id) : null;
                return (
                  <article className="review-card" key={session.id}>
                    <div className="item-main">
                      <div>
                        <h4>{session.title}</h4>
                        <p>{formatDate(session.date)} • {activityLabel(session.type)}</p>
                      </div>
                      <span className={`status-badge ${statusClassName(session.status)}`}>{session.status}</span>
                    </div>
                    <div className="review-diff-grid">
                      <div>
                        <strong>Planned</strong>
                        <p>{summarizePlanDetails(session)}</p>
                      </div>
                      <div>
                        <strong>Actual</strong>
                        <p>
                          {linkedWorkout
                            ? `${activityLabel(linkedWorkout.activity)} • ${summarizeWorkout(linkedWorkout) || "Logged workout"}`
                            : session.actual_json
                              ? "Actual data saved"
                              : "No actual linked yet"}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              }) : (
                <p className="empty-state">No planned sessions to review yet.</p>
              )}
            </div>
          </article>
        </section>
      )}

      {activeView === "stats" && (
        <section className="view-panel" aria-label="Stats">
          <article className="workspace-panel">
            <p className="panel-kicker">Stats</p>
            <h2>Progress</h2>

            <div className="stats-summary">
              <article>
                <span>{workouts.length}</span>
                <small>Total workouts</small>
              </article>
              <article>
                <span>{plannedSessions.length}</span>
                <small>Planned sessions</small>
              </article>
              <article>
                <span>{adherencePercent}%</span>
                <small>Reviewed adherence</small>
              </article>
              <article>
                <span>{cloudGoalCount}</span>
                <small>Cloud goals</small>
              </article>
            </div>

            <div className="stats-grid">
              <section className="stats-section" aria-label="Activity totals">
                <h3>Activity totals</h3>
                <div className="stats-list">
                  <div><strong>Strength</strong><span>{activityCounts.strength}</span></div>
                  <div><strong>Run</strong><span>{activityCounts.run}</span></div>
                  <div><strong>Sprint</strong><span>{activityCounts.sprint}</span></div>
                </div>
              </section>

              <section className="stats-section" aria-label="Best results">
                <h3>Best results</h3>
                <div className="stats-list">
                  <div><strong>Longest run</strong><span>{bestRunDistance ? `${formatNumber(bestRunDistance)} km` : "No data"}</span></div>
                  <div><strong>Best sprint</strong><span>{Number.isFinite(bestSprintTime) ? `${formatNumber(bestSprintTime)} sec` : "No data"}</span></div>
                  <div><strong>Highest strength load</strong><span>{maxStrengthWeight ? `${formatNumber(maxStrengthWeight)} kg` : "No data"}</span></div>
                </div>
              </section>

              <section className="stats-section stats-chart-section" aria-label="Workout charts">
                <h3>Workout charts</h3>
                <div className="stats-chart-grid">
                  <article>
                    <h4>Weekly volume</h4>
                    <MiniBarChart points={weeklyWorkoutChart} unit="workout(s)" />
                  </article>
                  <article>
                    <h4>Run distance</h4>
                    <MiniBarChart points={runDistanceChart} unit="km" />
                  </article>
                  <article>
                    <h4>Strength load</h4>
                    <MiniBarChart points={strengthLoadChart} unit="kg" />
                  </article>
                </div>
              </section>

              <section className="stats-section cloud-goals-section" aria-label="Cloud goals">
                <h3>Cloud goals</h3>
                <form className="goal-edit-form" onSubmit={handleGoalSubmit}>
                  <div className="training-form-grid">
                    <label>
                      Activity
                      <select name="goalActivity" defaultValue="run">
                        <option value="run">Run</option>
                        <option value="sprint">Sprint</option>
                        <option value="strength">Strength</option>
                      </select>
                    </label>
                    <label>
                      Run distance (km)
                      <input
                        name="goalRunDistance"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={numberValue(goalsByActivity.get("run")?.target_json.distance) ?? ""}
                      />
                    </label>
                    <label>
                      Run time
                      <input
                        name="goalRunTime"
                        inputMode="numeric"
                        placeholder="22:00"
                        defaultValue={typeof goalsByActivity.get("run")?.target_json.time === "string" ? String(goalsByActivity.get("run")?.target_json.time) : ""}
                      />
                    </label>
                    <label>
                      Sprint distance (m)
                      <input
                        name="goalSprintDistance"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={numberValue(goalsByActivity.get("sprint")?.target_json.distanceM) ?? ""}
                      />
                    </label>
                    <label>
                      Sprint time (sec)
                      <input
                        name="goalSprintTime"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={numberValue(goalsByActivity.get("sprint")?.target_json.timeSec) ?? ""}
                      />
                    </label>
                    <label>
                      Strength load (kg)
                      <input
                        name="goalStrengthWeight"
                        type="number"
                        min="0"
                        step="0.1"
                        defaultValue={numberValue(goalsByActivity.get("strength")?.target_json.weight) ?? ""}
                      />
                    </label>
                  </div>
                  <label>
                    Notes
                    <textarea name="goalNotes" rows={2} placeholder="Goal context" />
                  </label>
                  {goalStatus && <p className="form-status neutral-status" role="status">{goalStatus}</p>}
                  <button type="submit" disabled={isSavingGoal}>
                    {isSavingGoal ? "Saving" : "Save goal"}
                  </button>
                </form>

                <div className="goal-card-list">
                  {trainingGoals.length ? trainingGoals.map((goal) => (
                    <article className="goal-card" key={goal.id}>
                      <div>
                        <span className="goal-card-label">{activityLabel(goal.activity)} goal</span>
                        <h4>{formatCloudGoal(goal)}</h4>
                      </div>
                      {goal.notes && <p>{goal.notes}</p>}
                    </article>
                  )) : (
                    <p className="empty-state">No cloud goals saved yet.</p>
                  )}
                </div>
              </section>

              <section className="stats-section" aria-label="Imported goals">
                <h3>Imported goals</h3>
                {importedGoals ? (
                  <>
                    <div className="stats-list">
                      <div>
                        <strong>Strength goal</strong>
                        <span>{typeof importedGoals.strength === "number" ? `${formatNumber(importedGoals.strength)} kg` : "No data"}</span>
                      </div>
                      <div>
                        <strong>Active goals</strong>
                        <span>{activeGoals}</span>
                      </div>
                      <div>
                        <strong>Goal history</strong>
                        <span>{goalHistoryRows.length}</span>
                      </div>
                    </div>

                    <div className="goal-card-list">
                      {activeGoalRows.length ? activeGoalRows.map((goal, index) => (
                        <article className="goal-card" key={goal.id ?? `${goal.activity}-${index}`}>
                          <div>
                            <span className="goal-card-label">Active {goal.activity ?? "goal"}</span>
                            <h4>{formatGoalTarget(goal)}</h4>
                          </div>
                          <p>{goal.setAt ? `Set ${formatDate(goal.setAt)}` : "Set date unavailable"}</p>
                          <p>{formatGoalProgress(goal, workouts)}</p>
                        </article>
                      )) : (
                        <p className="empty-state">No active run or sprint goals imported.</p>
                      )}

                      {goalHistoryRows.length ? (
                        <div className="goal-history-list">
                          <h4>Achieved history</h4>
                          {goalHistoryRows.slice(0, 5).map((goal, index) => (
                            <div key={goal.id ?? `goal-history-${index}`}>
                              <span>{formatGoalTarget(goal)}</span>
                              <small>{goal.achievedAt ? `Achieved ${formatDate(goal.achievedAt)}` : "Not marked achieved"}</small>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="empty-state">Import V1 data to see goals here.</p>
                )}
              </section>
            </div>
          </article>
        </section>
      )}

      {activeView === "data" && (
        <section className="view-panel" aria-label="Data">
          <article className="workspace-panel">
            <p className="panel-kicker">Data</p>
            <h2>Cloud data</h2>
            <p className="empty-state">Export V2 cloud data or import a V1-style JSON backup for the selected training space.</p>

            <div className="import-panel">
              <div className="export-panel">
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => void handleExportData()}
                  disabled={!selectedSpace || isExportingData}
                >
                  {isExportingData ? "Exporting" : "Export V2 cloud JSON"}
                </button>
                {exportStatus && <p className="form-status neutral-status" role="status">{exportStatus}</p>}
              </div>

              <label>
                V1 backup JSON
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(event) => void handleImportFileChange(event)}
                  disabled={isPreviewingImport || isCommittingImport}
                />
              </label>

              {importPreview?.summary && (
                <div className="import-summary" aria-label="Import preview">
                  <article>
                    <span>{importPreview.summary.workoutCount}</span>
                    <small>Workouts</small>
                  </article>
                  <article>
                    <span>{importPreview.summary.plannedSessionCount}</span>
                    <small>Plans</small>
                  </article>
                  <article>
                    <span>{importPreview.summary.goalCount}</span>
                    <small>Goals</small>
                  </article>
                  <article>
                    <span>{importPreview.summary.phaseTemplateCount + importPreview.summary.phaseInstanceCount}</span>
                    <small>Phase items</small>
                  </article>
                </div>
              )}

              {importPreview && !importPreview.valid && (
                <p className="form-status">Backup is invalid and cannot be imported.</p>
              )}

              {importPreview?.warnings.length ? (
                <div className="import-messages">
                  <strong>Warnings</strong>
                  <ul>
                    {importPreview.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                  </ul>
                </div>
              ) : null}

              {importPreview?.unsupportedFields.length ? (
                <p className="neutral-status">Unsupported fields: {importPreview.unsupportedFields.join(", ")}</p>
              ) : null}

              {importCommit && (
                <div className="import-messages">
                  <strong>Last import</strong>
                  <p>
                    Imported {importCommit.importedWorkoutCount} workout(s), {importCommit.importedPlannedSessionCount} planned session(s),
                    and {importCommit.importedGoalCount + importCommit.importedPhaseTemplateCount + importCommit.importedPhaseInstanceCount} metadata item(s).
                    Existing: {importCommit.existingWorkoutCount + importCommit.existingPlannedSessionCount}.
                  </p>
                </div>
              )}

              {backfillResult && (
                <div className="import-messages">
                  <strong>Last backfill</strong>
                  <p>Linked {backfillResult.linkedPlannedSessionCount} planned session(s) to matching actual workouts.</p>
                </div>
              )}

              {importStatus && <p className="form-status neutral-status" role="status">{importStatus}</p>}
              <button
                type="button"
                className="primary-action"
                onClick={() => void handleCommitImport()}
                disabled={!importBackup || !selectedSpace || isCommittingImport}
              >
                {isCommittingImport ? "Importing" : "Import into selected space"}
              </button>
              <button
                type="button"
                onClick={() => void handleBackfillImport()}
                disabled={!selectedSpace || isBackfillingImport}
              >
                {isBackfillingImport ? "Backfilling" : "Backfill imported data"}
              </button>
            </div>
          </article>

          <article className="workspace-panel coach-tools-panel" aria-label="Coach tools">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Coach</p>
                <h3>Coach tools</h3>
              </div>
              {pendingSuggestions.length > 0 && <span className="source-badge">{pendingSuggestions.length} pending</span>}
            </div>

            <div className="coach-tools-grid">
              <div className="coach-tool-section">
                <h4>Invite</h4>
                {selectedSpace?.my_role === "owner" && (
                  <button type="button" onClick={handleCreateInvite} disabled={isCreatingInvite}>
                    {isCreatingInvite ? "Creating" : "Create invite"}
                  </button>
                )}
                {lastInvite && (
                  <label className="readonly-field">
                    Invite token
                    <input value={lastInvite.token} readOnly />
                  </label>
                )}
                <form className="stacked-form compact" onSubmit={handleAcceptInvite}>
                  <label>
                    Accept token
                    <input
                      value={inviteToken}
                      onChange={(event) => setInviteToken(event.target.value)}
                      placeholder="Paste invite token"
                      required
                    />
                  </label>
                  <button type="submit" disabled={isAcceptingInvite || !inviteToken.trim()}>
                    {isAcceptingInvite ? "Accepting" : "Accept invite"}
                  </button>
                </form>
                {inviteStatus && <p className="form-status neutral-status" role="status">{inviteStatus}</p>}
              </div>

              <div className="coach-tool-section">
                <h4>Suggestions</h4>
                {selectedSpace?.my_role === "coach" && (
                  <form className="suggestion-form" onSubmit={handleCreateSuggestion}>
                    <label>
                      Workout
                      <select name="targetWorkoutId" required disabled={!workouts.length}>
                        <option value="">Select workout</option>
                        {workouts.map((workout) => (
                          <option key={workout.id} value={workout.id}>
                            {formatDate(workout.date)} - {activityLabel(workout.activity)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Suggested notes
                      <textarea name="suggestedNotes" rows={4} required />
                    </label>
                    <button type="submit" disabled={isCreatingSuggestion || !workouts.length}>
                      {isCreatingSuggestion ? "Sending" : "Send suggestion"}
                    </button>
                  </form>
                )}

                {selectedSpace?.my_role === "owner" && (
                  <div className="suggestion-list">
                    {coachSuggestions.length ? coachSuggestions.map((suggestion) => {
                      const workout = workoutsById.get(suggestion.target_entity_id);
                      const isPending = suggestion.status === "pending";
                      return (
                        <article className="history-item" key={suggestion.id}>
                          <div className="item-main">
                            <div>
                              <h4>{workout ? `${formatDate(workout.date)} ${activityLabel(workout.activity)}` : "Workout suggestion"}</h4>
                              <p>{suggestionNotes(suggestion) || "No note text"}</p>
                            </div>
                            <span className={`status-badge ${statusClassName(suggestion.status)}`}>{suggestion.status}</span>
                          </div>
                          {isPending && (
                            <div className="action-row">
                              <button
                                type="button"
                                onClick={() => void handleResolveSuggestion(suggestion.id, "accept")}
                                disabled={resolvingSuggestionId === suggestion.id}
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleResolveSuggestion(suggestion.id, "reject")}
                                disabled={resolvingSuggestionId === suggestion.id}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </article>
                      );
                    }) : (
                      <p className="empty-state">No coach suggestions yet.</p>
                    )}
                  </div>
                )}

                {selectedSpace?.my_role !== "owner" && selectedSpace?.my_role !== "coach" && (
                  <p className="empty-state">Coach suggestions appear here when a coach is connected.</p>
                )}

                {suggestionStatus && <p className="form-status neutral-status" role="status">{suggestionStatus}</p>}
              </div>
            </div>
          </article>
        </section>
      )}
    </main>
  );
}

export default App;
