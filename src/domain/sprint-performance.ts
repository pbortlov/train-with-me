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

export interface SprintRepConsistencySession extends SprintPerformanceSession {
  reps: Array<{ order: number; time: number; restBeforeSec?: number }>;
  firstTime: number;
  lastTime: number;
  firstToLastChange: number;
}

export interface SprintRecordGroup {
  profileKey: string;
  profileLabel: string;
  distance: number;
  bestTime: number;
  date: string;
  surface: string;
  slope: string;
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
      .filter((workout) => workout.activity === "sprint")
      .filter((workout) => profileKey === "all" || getSprintProfileKey(workout) === profileKey)
      .flatMap((workout) => normalizeSprintSets(workout.sprintSets))
      .filter((set) => set.distance > 0 && set.time > 0)
      .map((set) => set.distance),
  )].sort((left, right) => left - right);
}

export function buildSprintPerformance(
  workouts: SprintPerformanceWorkout[],
  selection: SprintPerformanceSelection,
): SprintPerformanceModel {
  if (selection.profileKey === "all" || selection.distance <= 0) {
    return { sessions: [], latest: null, previous: null, allTimeBest: null, contextIsMixed: false };
  }
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

export function buildSprintRecordGroups(
  workouts: SprintPerformanceWorkout[],
  selection: SprintPerformanceSelection,
): SprintRecordGroup[] {
  const records = new Map<string, SprintRecordGroup>();
  workouts
    .filter((workout) => workout.activity === "sprint" && workout.date)
    .filter((workout) => selection.profileKey === "all" || getSprintProfileKey(workout) === selection.profileKey)
    .filter((workout) => selection.surface === "all" || getSprintSurface(workout) === selection.surface)
    .filter((workout) => selection.slope === "all" || getSprintSlope(workout) === selection.slope)
    .forEach((workout) => {
      const profileKey = getSprintProfileKey(workout);
      normalizeSprintSets(workout.sprintSets)
        .filter((set) => set.time > 0 && set.distance > 0)
        .filter((set) => selection.distance <= 0 || set.distance === selection.distance)
        .forEach((set) => {
          const key = `${profileKey}:${set.distance}`;
          const candidate: SprintRecordGroup = {
            profileKey,
            profileLabel: getSprintProfileLabel(profileKey),
            distance: set.distance,
            bestTime: set.time,
            date: workout.date || "",
            surface: getSprintSurface(workout),
            slope: getSprintSlope(workout),
          };
          const current = records.get(key);
          if (!current || candidate.bestTime < current.bestTime || (candidate.bestTime === current.bestTime && candidate.date > current.date)) {
            records.set(key, candidate);
          }
        });
    });
  return [...records.values()].sort(
    (left, right) => left.profileLabel.localeCompare(right.profileLabel) || left.distance - right.distance,
  );
}

export function buildSprintRepConsistency(
  workouts: SprintPerformanceWorkout[],
  selection: SprintPerformanceSelection,
): SprintRepConsistencySession[] {
  if (selection.profileKey === "all" || selection.distance <= 0) {
    return [];
  }
  return workouts
    .filter((workout) => workout.activity === "sprint" && workout.date)
    .filter((workout) => getSprintProfileKey(workout) === selection.profileKey)
    .filter((workout) => selection.surface === "all" || getSprintSurface(workout) === selection.surface)
    .filter((workout) => selection.slope === "all" || getSprintSlope(workout) === selection.slope)
    .map((workout, index) => {
      const reps = normalizeSprintSets(workout.sprintSets)
        .filter((set) => set.distance === selection.distance && set.time > 0)
        .map((set) => ({
          order: set.order,
          time: set.time,
          ...(set.restBeforeSec != null ? { restBeforeSec: set.restBeforeSec } : {}),
        }));
      const firstTime = reps[0]?.time;
      const lastTime = reps.at(-1)?.time;
      const bestTime = reps.reduce<number | null>((best, rep) => best == null || rep.time < best ? rep.time : best, null);
      if (!reps.length || firstTime == null || lastTime == null || bestTime == null) {
        return null;
      }
      return {
        id: workout.id || `${workout.date}:${index}`,
        date: workout.date || "",
        bestTime,
        repCount: reps.length,
        surface: getSprintSurface(workout),
        slope: getSprintSlope(workout),
        reps,
        firstTime,
        lastTime,
        firstToLastChange: Number((lastTime - firstTime).toFixed(3)),
        createdAt: typeof workout.createdAt === "number" ? workout.createdAt : 0,
      };
    })
    .filter((session): session is SprintRepConsistencySession & { createdAt: number } => Boolean(session))
    .sort((left, right) => left.date.localeCompare(right.date) || left.createdAt - right.createdAt)
    .map(({ createdAt, ...session }) => session);
}

export function getSprintProfileKey(workout: SprintPerformanceWorkout): string {
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

export function getSprintSurface(workout: SprintPerformanceWorkout): string {
  return typeof workout.sprintSurface === "string" && workout.sprintSurface ? workout.sprintSurface : "unknown";
}

export function getSprintSlope(workout: SprintPerformanceWorkout): string {
  return typeof workout.sprintSlope === "string" && workout.sprintSlope ? workout.sprintSlope : "unknown";
}
