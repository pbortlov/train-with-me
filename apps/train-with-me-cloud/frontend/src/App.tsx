import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type AuthMode = "login" | "register";

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

type ApiErrorPayload = {
  detail?: {
    error?: {
      message?: string;
    };
  };
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const tokenStorageKey = "twm_cloud_access_token";

function formatDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function activityLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[]>([]);
  const [coachSuggestions, setCoachSuggestions] = useState<CoachSuggestion[]>([]);
  const [lastInvite, setLastInvite] = useState<CoachInvite | null>(null);
  const [inviteToken, setInviteToken] = useState(() => new URLSearchParams(window.location.search).get("coachInvite") ?? "");
  const [historyStatus, setHistoryStatus] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState("");
  const [isLoadingSession, setIsLoadingSession] = useState(Boolean(token));
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
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
      setHistoryStatus("");
      return;
    }

    let isActive = true;
    setIsLoadingHistory(true);
    setHistoryStatus("");
    Promise.all([
      apiRequest<Workout[]>(`/api/training-spaces/${selectedSpaceId}/workouts`, {}, token),
      apiRequest<PlannedSession[]>(`/api/training-spaces/${selectedSpaceId}/planned-sessions`, {}, token),
    ])
      .then(([nextWorkouts, nextPlannedSessions]) => {
        if (!isActive) {
          return;
        }
        setWorkouts(nextWorkouts);
        setPlannedSessions(nextPlannedSessions);
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
  }, [selectedSpaceId, token]);

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

    const form = new FormData(event.currentTarget);
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
      event.currentTarget.reset();
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

    const form = new FormData(event.currentTarget);
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
      event.currentTarget.reset();
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
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Train With Me Cloud</p>
          <h1>Dashboard</h1>
        </div>
        <div className="account-bar">
          <div>
            <span>{user.display_name}</span>
            <small>{user.email}</small>
          </div>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="dashboard-grid">
        <aside className="sidebar-panel" aria-label="Training spaces">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Spaces</p>
              <h2>Training spaces</h2>
            </div>
          </div>

          {spaces.length > 0 ? (
            <div className="space-list" role="listbox" aria-label="Select training space">
              {spaces.map((space) => (
                <button
                  key={space.id}
                  type="button"
                  className={selectedSpace?.id === space.id ? "space-item active" : "space-item"}
                  onClick={() => setSelectedSpaceId(space.id)}
                >
                  <span>{space.name}</span>
                  <small>{space.my_role}</small>
                </button>
              ))}
            </div>
          ) : (
            <p className="empty-state">No training spaces yet.</p>
          )}

          <form className="stacked-form compact" onSubmit={handleCreateSpace}>
            <label>
              New space
              <input name="spaceName" placeholder="Base Season" minLength={1} maxLength={120} required />
            </label>
            {spaceStatus && <p className="form-status" role="status">{spaceStatus}</p>}
            <button type="submit" disabled={isCreatingSpace}>
              {isCreatingSpace ? "Creating" : "Create space"}
            </button>
          </form>

          <section className="collab-panel" aria-label="Coach invite">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Coach</p>
                <h3>Invite</h3>
              </div>
            </div>
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
          </section>
        </aside>

        <section className="workspace-panel" aria-label="Dashboard">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Current</p>
              <h2>{selectedSpace?.name ?? "Select a training space"}</h2>
            </div>
            {selectedSpace && <span className="role-pill">{selectedSpace.my_role}</span>}
          </div>

          <div className="metric-grid">
            <article className="metric-tile">
              <span className="metric-value">{spaces.length}</span>
              <span className="metric-label">Spaces</span>
            </article>
            <article className="metric-tile">
              <span className="metric-value">{workouts.length}</span>
              <span className="metric-label">Workouts</span>
            </article>
            <article className="metric-tile">
              <span className="metric-value">{plannedSessions.length}</span>
              <span className="metric-label">Plans</span>
            </article>
          </div>

          {historyStatus && <p className="form-status history-status" role="status">{historyStatus}</p>}

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

          <section className="coach-workspace" aria-label="Coach suggestions">
            <div className="history-panel-header">
              <div>
                <p className="panel-kicker">Coach</p>
                <h3>Suggestions</h3>
              </div>
              {pendingSuggestions.length > 0 && <span className="source-badge">{pendingSuggestions.length} pending</span>}
            </div>

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
          </section>
        </section>
      </section>
    </main>
  );
}

export default App;
