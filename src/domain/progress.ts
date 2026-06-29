export interface ProgressWorkout {
  activity?: string;
  date?: string;
}

export interface ProgressSession {
  status?: string;
  type?: string;
}

export interface ProgressGoals {
  strength?: unknown;
  active?: {
    run?: unknown;
    sprint?: unknown;
  };
  history?: Array<{ achievedAt?: string | null }>;
}

export interface ProgressHubModel {
  totalWorkouts: number;
  lastWorkoutDate: string;
  workoutCounts: {
    strength: number;
    run: number;
    sprint: number;
  };
  plannedSessions: number;
  completedSessions: number;
  completionRate: number;
  activeGoals: number;
  achievedGoals: number;
}

export function buildProgressHubModel(
  workouts: ProgressWorkout[],
  sessions: ProgressSession[],
  goals: ProgressGoals,
): ProgressHubModel {
  const completedSessions = sessions.filter((session) =>
    ["completed", "modified"].includes(session.status || ""),
  ).length;
  const plannedSessions = sessions.length;
  const activeGoals = [
    typeof goals.strength === "number" && Number.isFinite(goals.strength),
    Boolean(goals.active?.run),
    Boolean(goals.active?.sprint),
  ].filter(Boolean).length;

  return {
    totalWorkouts: workouts.length,
    lastWorkoutDate: latestWorkoutDate(workouts),
    workoutCounts: {
      strength: workouts.filter((workout) => workout.activity === "strength").length,
      run: workouts.filter((workout) => workout.activity === "run").length,
      sprint: workouts.filter((workout) => workout.activity === "sprint").length,
    },
    plannedSessions,
    completedSessions,
    completionRate: plannedSessions
      ? Math.round((completedSessions / plannedSessions) * 100)
      : 0,
    activeGoals,
    achievedGoals: (goals.history || []).filter((goal) => goal.achievedAt).length,
  };
}

function latestWorkoutDate(workouts: ProgressWorkout[]): string {
  return workouts
    .map((workout) => workout.date || "")
    .filter(Boolean)
    .sort()
    .at(-1) || "";
}
