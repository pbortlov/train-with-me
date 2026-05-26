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

type ImportedV1Metadata = {
  id: string;
  entityType: string;
  originalV1Id: string;
  payload: Record<string, unknown>;
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

function isHistorical(source: string, coachEditable: boolean): boolean {
  return source === "v1_import" || !coachEditable;
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
  const [calendarSelection, setCalendarSelection] = useState<CalendarSelection>(null);
  const [calendarWeekStart, setCalendarWeekStart] = useState(() => dateKey(startOfWeek(new Date())));
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[]>([]);
  const [v1Metadata, setV1Metadata] = useState<ImportedV1Metadata[]>([]);
  const [coachSuggestions, setCoachSuggestions] = useState<CoachSuggestion[]>([]);
  const [lastInvite, setLastInvite] = useState<CoachInvite | null>(null);
  const [inviteToken, setInviteToken] = useState(() => new URLSearchParams(window.location.search).get("coachInvite") ?? "");
  const [historyStatus, setHistoryStatus] = useState("");
  const [programStatus, setProgramStatus] = useState("");
  const [trainingFormStatus, setTrainingFormStatus] = useState("");
  const [completionStatus, setCompletionStatus] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [importPreview, setImportPreview] = useState<V1ImportPreview | null>(null);
  const [importBackup, setImportBackup] = useState<Record<string, unknown> | null>(null);
  const [importCommit, setImportCommit] = useState<V1ImportCommit | null>(null);
  const [inviteStatus, setInviteStatus] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState("");
  const [isLoadingSession, setIsLoadingSession] = useState(Boolean(token));
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSavingTraining, setIsSavingTraining] = useState(false);
  const [isCompletingSessionId, setIsCompletingSessionId] = useState("");
  const [isDeletingCalendarItem, setIsDeletingCalendarItem] = useState(false);
  const [isPreviewingImport, setIsPreviewingImport] = useState(false);
  const [isCommittingImport, setIsCommittingImport] = useState(false);
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
        workouts: workouts.filter((workout) => workout.date === key),
        plannedSessions: plannedSessions.filter((session) => session.date === key),
      };
    });
  }, [calendarWeekStart, plannedSessions, workouts]);
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
  const phaseTemplates = v1Metadata.filter((row) => row.entityType === "phase_template");
  const phaseInstances = v1Metadata.filter((row) => row.entityType === "phase_instance");
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
      setV1Metadata([]);
      setProgramStatus("");
      return;
    }

    let isActive = true;
    setProgramStatus("");
    loadV1Metadata(token, selectedSpaceId)
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        setV1Metadata([]);
        setProgramStatus(error instanceof Error ? error.message : "Could not load imported programs.");
      });

    return () => {
      isActive = false;
    };
  }, [loadV1Metadata, selectedSpaceId, token]);

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
          const loadType = String(form.get("strengthLoadType") ?? "kg");
          body.strength_exercises = [{
            name: String(form.get("exerciseName") ?? ""),
            sets: [{
              reps: Number(form.get("strengthReps")),
              weight: loadType === "kg" ? Number(form.get("strengthWeight")) : null,
              load_type: loadType,
              band_color: loadType === "band" ? String(form.get("bandColor") ?? "") : "",
            }],
          }];
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

  async function handleExportData() {
    if (!token || !selectedSpace) {
      return;
    }

    setIsExportingData(true);
    setExportStatus("");
    try {
      const backup = await apiRequest<Record<string, unknown>>(
        `/api/imports/v1/export/${selectedSpace.id}`,
        {},
        token,
      );
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `train-with-me-cloud-${selectedSpace.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${dateKey(new Date())}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setExportStatus("Backup exported.");
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
                        className="calendar-item planned"
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
                        className="calendar-item actual"
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
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => void handleDeletePlannedSession(selectedCalendarSession)}
                        disabled={isDeletingCalendarItem}
                      >
                        {isDeletingCalendarItem ? "Deleting" : "Delete"}
                      </button>
                    )}
                    <button type="button" onClick={() => setCalendarSelection(null)}>Close</button>
                  </div>
                </div>

                {selectedCalendarWorkout && (
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
                  <div className="training-form-grid">
                    <label>
                      Exercise
                      <input name="exerciseName" placeholder="Back squat" required />
                    </label>
                    <label>
                      Reps
                      <input name="strengthReps" type="number" min="0" placeholder="5" required />
                    </label>
                    <label>
                      Load type
                      <select name="strengthLoadType">
                        <option value="kg">kg</option>
                        <option value="bodyweight">Body weight</option>
                        <option value="band">Band</option>
                      </select>
                    </label>
                    <label>
                      Weight or band
                      <input name="strengthWeight" type="number" min="0" step="0.1" placeholder="60" />
                    </label>
                    <label>
                      Band color
                      <input name="bandColor" placeholder="red" />
                    </label>
                  </div>
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
                        <div className="badge-row">
                          {isHistorical(workout.source, workout.coach_editable) && <span className="history-badge">Historical</span>}
                          {workout.original_v1_id && <span className="source-badge">V1</span>}
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
                          <span className="status-badge">{session.status}</span>
                          {isHistorical(session.source, session.coach_editable) && <span className="history-badge">Historical</span>}
                          {session.original_v1_id && <span className="source-badge">V1</span>}
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
            <p className="empty-state">Imported V1 phase templates and scheduled phase instances for the selected space.</p>

            {programStatus && <p className="form-status" role="status">{programStatus}</p>}

            <div className="program-grid">
              <section className="program-section" aria-label="Imported phase templates">
                <h3>Saved phase templates</h3>
                <div className="program-list">
                  {phaseTemplates.length ? phaseTemplates.map((row) => {
                    const name = typeof row.payload.name === "string" ? row.payload.name : row.originalV1Id;
                    const duration = typeof row.payload.durationWeeks === "number" ? row.payload.durationWeeks : null;
                    const slots = Array.isArray(row.payload.weekdaySlots) ? row.payload.weekdaySlots.length : null;
                    return (
                      <article className="program-card" key={row.id}>
                        <h4>{name}</h4>
                        <p>
                          {duration != null ? `${duration} week(s)` : "Duration not set"}
                          {slots != null ? ` • ${slots} weekday slot(s)` : ""}
                        </p>
                        <span className="source-badge">V1</span>
                      </article>
                    );
                  }) : (
                    <p className="empty-state">No imported phase templates yet.</p>
                  )}
                </div>
              </section>

              <section className="program-section" aria-label="Imported phase instances">
                <h3>Scheduled phase instances</h3>
                <div className="program-list">
                  {phaseInstances.length ? phaseInstances.map((row) => {
                    const templateId = typeof row.payload.templateId === "string" ? row.payload.templateId : "";
                    const startDate = typeof row.payload.startDate === "string" ? row.payload.startDate : "";
                    const generatedSessionIds = Array.isArray(row.payload.generatedSessionIds) ? row.payload.generatedSessionIds.length : null;
                    return (
                      <article className="program-card" key={row.id}>
                        <h4>{templateId || row.originalV1Id}</h4>
                        <p>
                          {startDate ? `Starts ${formatDate(startDate)}` : "Start date not set"}
                          {generatedSessionIds != null ? ` • ${generatedSessionIds} generated session(s)` : ""}
                        </p>
                        <span className="source-badge">V1</span>
                      </article>
                    );
                  }) : (
                    <p className="empty-state">No imported phase instances yet.</p>
                  )}
                </div>
              </section>
            </div>
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
                      <span className="status-badge">{session.status}</span>
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
                    <div className="badge-row">
                      {isHistorical(session.source, session.coach_editable) && <span className="history-badge">Historical</span>}
                      {session.original_v1_id && <span className="source-badge">V1</span>}
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
                <span>{activeGoals}</span>
                <small>Imported active goals</small>
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
            <p className="empty-state">Export or import a V1-style JSON backup for the selected training space.</p>

            <div className="import-panel">
              <div className="export-panel">
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => void handleExportData()}
                  disabled={!selectedSpace || isExportingData}
                >
                  {isExportingData ? "Exporting" : "Export selected space JSON"}
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

              {importStatus && <p className="form-status neutral-status" role="status">{importStatus}</p>}
              <button
                type="button"
                className="primary-action"
                onClick={() => void handleCommitImport()}
                disabled={!importBackup || !selectedSpace || isCommittingImport}
              >
                {isCommittingImport ? "Importing" : "Import into selected space"}
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
                            <span className="status-badge">{suggestion.status}</span>
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
