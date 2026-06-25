export interface DatedRecord {
  id?: string;
  date?: string;
  linkedWorkoutId?: string;
  status?: string;
}

export interface TodayModel<
  TSession extends DatedRecord,
  TWorkout extends DatedRecord,
> {
  date: string;
  sessions: TSession[];
  standaloneWorkouts: TWorkout[];
  completedCount: number;
  plannedCount: number;
}

export function buildTodayModel<
  TSession extends DatedRecord,
  TWorkout extends DatedRecord,
>(
  date: string,
  sessions: TSession[],
  workouts: TWorkout[],
): TodayModel<TSession, TWorkout> {
  const todaySessions = sessions.filter((session) => session.date === date);
  const linkedWorkoutIds = new Set(
    sessions
      .map((session) => session.linkedWorkoutId)
      .filter((id): id is string => Boolean(id)),
  );
  const standaloneWorkouts = workouts.filter(
    (workout) =>
      workout.date === date && !linkedWorkoutIds.has(workout.id ?? ""),
  );

  return {
    date,
    sessions: todaySessions,
    standaloneWorkouts,
    completedCount: todaySessions.filter(
      (session) =>
        session.status === "completed" || session.status === "modified",
    ).length,
    plannedCount: todaySessions.filter(
      (session) => session.status === "planned",
    ).length,
  };
}
