import { normalizeSprintSets } from "./normalization";

export interface SprintPerformanceWorkout {
  id?: string;
  activity?: string;
  date?: string;
  createdAt?: number;
  sprintSets?: unknown;
  sprintProfile?: unknown;
  sprintProfileCustom?: unknown;
  sprintSurface?: unknown;
  sprintSlope?: unknown;
}

export interface SprintProfileOption {
  key: string;
  label: string;
}

export interface SprintPerformanceSelection {
  profileKey: string;
  distance: number;
  surface: string;
  slope: string;
}

export interface SprintPerformanceSession {
  id: string;
  date: string;
  bestTime: number;
  repCount: number;
  surface: string;
  slope: string;
}

export interface SprintPerformanceModel {
  sessions: SprintPerformanceSession[];
  latest: SprintPerformanceSession | null;
  previous: SprintPerformanceSession | null;
  allTimeBest: SprintPerformanceSession | null;
  contextIsMixed: boolean;
}

const PROFILE_LABELS: Record<string, string> = {
  acceleration: "Acceleration",
  "max-velocity": "Max velocity",
  "speed-endurance": "Speed endurance",
  "repeat-sprint": "Repeat sprint",
  "hill-sprint": "Hill sprint",
  unclassified: "Unclassified",
};

export function listSprintProfileOptions(workouts: SprintPerformanceWorkout[]): SprintProfileOption[] {
  const options = new Map<string, string>();
  workouts
    .filter((workout) => workout.activity === "sprint")
    .forEach((workout) => {
      const key = getSprintProfileKey(workout);
      options.set(key, getSprintProfileLabel(key));
    });
  return [...options.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function listSprintDistances(workouts: SprintPerformanceWorkout[], profileKey: string): number[] {
  return [...new Set(
    workouts
      .filter((workout) => workout.activity === "sprint" && getSprintProfileKey(workout) === profileKey)
      .flatMap((workout) => normalizeSprintSets(workout.sprintSets))
      .filter((set) => set.distance > 0 && set.time > 0)
      .map((set) => set.distance),
  )].sort((left, right) => left - right);
}

export function buildSprintPerformance(
  workouts: SprintPerformanceWorkout[],
  selection: SprintPerformanceSelection,
): SprintPerformanceModel {
  const sessions = workouts
    .filter((workout) => workout.activity === "sprint" && workout.date)
    .filter((workout) => getSprintProfileKey(workout) === selection.profileKey)
    .filter((workout) => selection.surface === "all" || getSprintSurface(workout) === selection.surface)
    .filter((workout) => selection.slope === "all" || getSprintSlope(workout) === selection.slope)
    .map((workout, index) => {
      const reps = normalizeSprintSets(workout.sprintSets).filter(
        (set) => set.distance === selection.distance && set.time > 0,
      );
      const bestTime = reps.reduce<number | null>((best, set) => best == null || set.time < best ? set.time : best, null);
      if (bestTime == null) {
        return null;
      }
      return {
        id: workout.id || `${workout.date}:${index}`,
        date: workout.date || "",
        bestTime,
        repCount: reps.length,
        surface: getSprintSurface(workout),
        slope: getSprintSlope(workout),
        createdAt: typeof workout.createdAt === "number" ? workout.createdAt : 0,
      };
    })
    .filter((session): session is SprintPerformanceSession & { createdAt: number } => Boolean(session))
    .sort((left, right) => left.date.localeCompare(right.date) || left.createdAt - right.createdAt)
    .map(({ createdAt, ...session }) => session);

  const latest = sessions.at(-1) || null;
  const previous = sessions.length > 1 ? sessions.at(-2) || null : null;
  const allTimeBest = sessions.reduce<SprintPerformanceSession | null>(
    (best, session) => !best || session.bestTime < best.bestTime ? session : best,
    null,
  );
  const contexts = new Set(sessions.map((session) => `${session.surface}:${session.slope}`));

  return {
    sessions,
    latest,
    previous,
    allTimeBest,
    contextIsMixed: contexts.size > 1,
  };
}

function getSprintProfileKey(workout: SprintPerformanceWorkout): string {
  if (workout.sprintProfile === "custom" && typeof workout.sprintProfileCustom === "string" && workout.sprintProfileCustom.trim()) {
    return `custom:${workout.sprintProfileCustom.trim()}`;
  }
  return typeof workout.sprintProfile === "string" && PROFILE_LABELS[workout.sprintProfile]
    ? workout.sprintProfile
    : "unclassified";
}

function getSprintProfileLabel(key: string): string {
  return key.startsWith("custom:") ? key.slice("custom:".length) : PROFILE_LABELS[key] || "Unclassified";
}

function getSprintSurface(workout: SprintPerformanceWorkout): string {
  return typeof workout.sprintSurface === "string" && workout.sprintSurface ? workout.sprintSurface : "unknown";
}

function getSprintSlope(workout: SprintPerformanceWorkout): string {
  return typeof workout.sprintSlope === "string" && workout.sprintSlope ? workout.sprintSlope : "unknown";
}
