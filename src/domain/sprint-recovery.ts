import { normalizeSprintSets } from "./normalization";
import {
  getSprintProfileKey,
  getSprintSlope,
  getSprintSurface,
  type SprintPerformanceSelection,
  type SprintPerformanceWorkout,
} from "./sprint-performance";

export const SPRINT_RECOVERY_MIN_PAIRS = 8;
export const SPRINT_RECOVERY_MIN_SESSIONS = 3;
export const SPRINT_RECOVERY_MIN_PAIRS_PER_BAND = 3;
export const SPRINT_RECOVERY_MIN_SESSIONS_PER_BAND = 2;

const REST_BAND_SIZE_SECONDS = 30;

export interface SprintRecoveryBand {
  restSeconds: number;
  medianTime: number;
  pairCount: number;
  sessionCount: number;
}

export type SprintRecoveryStatus = "choose-context" | "collecting" | "needs-variety" | "no-clear-signal" | "ready";

export interface SprintRecoveryInsight {
  status: SprintRecoveryStatus;
  pairCount: number;
  sessionCount: number;
  supportedBands: SprintRecoveryBand[];
  bestBand: SprintRecoveryBand | null;
  comparisonBand: SprintRecoveryBand | null;
  medianDifference: number | null;
}

interface RecoveryPair {
  restSeconds: number;
  time: number;
  sessionId: string;
}

export function buildSprintRecoveryInsight(
  workouts: SprintPerformanceWorkout[],
  selection: SprintPerformanceSelection,
): SprintRecoveryInsight {
  if (!hasExactContext(selection)) {
    return emptyInsight("choose-context");
  }

  const pairs = collectRecoveryPairs(workouts, selection);
  const pairCount = pairs.length;
  const sessionCount = new Set(pairs.map((pair) => pair.sessionId)).size;
  if (pairCount < SPRINT_RECOVERY_MIN_PAIRS || sessionCount < SPRINT_RECOVERY_MIN_SESSIONS) {
    return { ...emptyInsight("collecting"), pairCount, sessionCount };
  }

  const supportedBands = buildBands(pairs).filter(
    (band) => band.pairCount >= SPRINT_RECOVERY_MIN_PAIRS_PER_BAND
      && band.sessionCount >= SPRINT_RECOVERY_MIN_SESSIONS_PER_BAND,
  );
  if (supportedBands.length < 2) {
    return { ...emptyInsight("needs-variety"), pairCount, sessionCount, supportedBands };
  }

  const rankedBands = supportedBands.slice().sort(
    (left, right) => left.medianTime - right.medianTime
      || right.pairCount - left.pairCount
      || left.restSeconds - right.restSeconds,
  );
  const bestBand = rankedBands[0];
  const comparisonBand = rankedBands[1];
  const medianDifference = Number((comparisonBand.medianTime - bestBand.medianTime).toFixed(3));
  const practicalDifference = Math.max(0.05, bestBand.medianTime * 0.01);

  return {
    status: medianDifference < practicalDifference ? "no-clear-signal" : "ready",
    pairCount,
    sessionCount,
    supportedBands: rankedBands,
    bestBand,
    comparisonBand,
    medianDifference,
  };
}

function hasExactContext(selection: SprintPerformanceSelection): boolean {
  return selection.profileKey !== "all"
    && selection.distance > 0
    && selection.surface !== "all"
    && selection.slope !== "all";
}

function collectRecoveryPairs(
  workouts: SprintPerformanceWorkout[],
  selection: SprintPerformanceSelection,
): RecoveryPair[] {
  return workouts.flatMap((workout, workoutIndex) => {
    if (
      workout.activity !== "sprint"
      || !workout.date
      || getSprintProfileKey(workout) !== selection.profileKey
      || getSprintSurface(workout) !== selection.surface
      || getSprintSlope(workout) !== selection.slope
    ) {
      return [];
    }
    const sessionId = workout.id || `${workout.date}:${workout.createdAt || workoutIndex}`;
    return normalizeSprintSets(workout.sprintSets)
      .filter((set) => set.distance === selection.distance && set.time > 0 && set.restBeforeSec != null)
      .map((set) => ({ restSeconds: set.restBeforeSec as number, time: set.time, sessionId }));
  });
}

function buildBands(pairs: RecoveryPair[]): SprintRecoveryBand[] {
  const grouped = new Map<number, RecoveryPair[]>();
  pairs.forEach((pair) => {
    const restSeconds = Math.round(pair.restSeconds / REST_BAND_SIZE_SECONDS) * REST_BAND_SIZE_SECONDS;
    grouped.set(restSeconds, [...(grouped.get(restSeconds) || []), pair]);
  });
  return [...grouped.entries()].map(([restSeconds, group]) => ({
    restSeconds,
    medianTime: median(group.map((pair) => pair.time)),
    pairCount: group.length,
    sessionCount: new Set(group.map((pair) => pair.sessionId)).size,
  }));
}

function median(values: number[]): number {
  const sorted = values.slice().sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  const result = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  return Number(result.toFixed(3));
}

function emptyInsight(status: SprintRecoveryStatus): SprintRecoveryInsight {
  return {
    status,
    pairCount: 0,
    sessionCount: 0,
    supportedBands: [],
    bestBand: null,
    comparisonBand: null,
    medianDifference: null,
  };
}
