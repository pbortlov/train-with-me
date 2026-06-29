import { calculateRunPace, parseRunDuration } from "./run";

export interface RunWorkout {
  activity?: string;
  date?: string;
  distance?: unknown;
  time?: unknown;
  pace?: unknown;
}

export interface RunInsightRow {
  date: string;
  distance: number;
  durationSeconds: number | null;
  pace: number | null;
}

export interface RunningInsights {
  runCount: number;
  latestRunDate: string;
  totalDistance: number;
  longestRun: {
    distance: number;
    date: string;
  } | null;
  bestPace: {
    pace: number;
    date: string;
    distance: number;
  } | null;
  averagePace: number | null;
  totalDurationSeconds: number;
  rows: RunInsightRow[];
}

export function buildRunningInsights(workouts: RunWorkout[]): RunningInsights {
  const rows = workouts
    .filter((workout) => workout.activity === "run")
    .map((workout) => {
      const distance = toNumberOrNull(workout.distance);
      const durationSeconds = parseRunDuration(workout.time).seconds;
      const storedPace = toNumberOrNull(workout.pace);
      const calculatedPace = calculateRunPace(distance, durationSeconds);
      return {
        date: workout.date || "",
        distance: distance && distance > 0 ? distance : 0,
        durationSeconds,
        pace: storedPace ?? calculatedPace,
      };
    })
    .filter((row) => row.distance > 0)
    .sort((a, b) => {
      const dateDiff = (b.date || "").localeCompare(a.date || "");
      return dateDiff || b.distance - a.distance;
    });

  const totalDistance = rows.reduce((sum, row) => sum + row.distance, 0);
  const timedRows = rows.filter(
    (row) => row.durationSeconds != null && row.durationSeconds > 0,
  );
  const totalDurationSeconds = timedRows.reduce(
    (sum, row) => sum + Number(row.durationSeconds),
    0,
  );
  const timedDistance = timedRows.reduce((sum, row) => sum + row.distance, 0);
  const paceRows = rows.filter((row): row is RunInsightRow & { pace: number } =>
    typeof row.pace === "number" && Number.isFinite(row.pace),
  );

  return {
    runCount: rows.length,
    latestRunDate: rows[0]?.date || "",
    totalDistance,
    longestRun: longestRun(rows),
    bestPace: bestPace(paceRows),
    averagePace: timedDistance > 0 ? totalDurationSeconds / 60 / timedDistance : null,
    totalDurationSeconds,
    rows,
  };
}

function longestRun(rows: RunInsightRow[]): RunningInsights["longestRun"] {
  const longest = rows.reduce<RunInsightRow | null>((best, row) => {
    if (!best || row.distance > best.distance) {
      return row;
    }
    return best;
  }, null);
  return longest ? { distance: longest.distance, date: longest.date } : null;
}

function bestPace(
  rows: Array<RunInsightRow & { pace: number }>,
): RunningInsights["bestPace"] {
  const best = rows.reduce<(RunInsightRow & { pace: number }) | null>((current, row) => {
    if (!current || row.pace < current.pace) {
      return row;
    }
    return current;
  }, null);
  return best
    ? { pace: best.pace, date: best.date, distance: best.distance }
    : null;
}

function toNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
