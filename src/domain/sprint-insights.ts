import { normalizeSprintSets } from "./normalization";

export interface SprintWorkout {
  activity?: string;
  date?: string;
  sprintSets?: unknown;
  sprintFeeling?: unknown;
}

export interface SprintDistanceBest {
  distance: number;
  time: number;
  date: string;
}

export interface SprintSessionRow {
  date: string;
  repCount: number;
  distances: number[];
  bestTime: number | null;
  feeling: string;
}

export interface SprintInsights {
  workoutCount: number;
  latestSprintDate: string;
  totalReps: number;
  uniqueDistanceCount: number;
  fastestRep: SprintDistanceBest | null;
  bestByDistance: SprintDistanceBest[];
  feelingCounts: Array<{ feeling: string; count: number }>;
  rows: SprintSessionRow[];
}

export function buildSprintInsights(workouts: SprintWorkout[]): SprintInsights {
  const sprintWorkouts = workouts.filter((workout) => workout.activity === "sprint");
  const bestByDistance = new Map<number, SprintDistanceBest>();
  const feelingCounts = new Map<string, number>();
  let fastestRep: SprintDistanceBest | null = null;
  let totalReps = 0;

  const rows = sprintWorkouts
    .map((workout) => {
      const sets = normalizeSprintSets(workout.sprintSets).filter(
        (set) => set.distance > 0 && set.time > 0,
      );
      const distances = [...new Set(sets.map((set) => set.distance))].sort((a, b) => a - b);
      const bestTime = sets.reduce<number | null>(
        (best, set) => (best == null || set.time < best ? set.time : best),
        null,
      );
      const feeling = typeof workout.sprintFeeling === "string" ? workout.sprintFeeling : "";
      if (feeling) {
        feelingCounts.set(feeling, (feelingCounts.get(feeling) || 0) + 1);
      }
      totalReps += sets.length;

      sets.forEach((set) => {
        const candidate = { distance: set.distance, time: set.time, date: workout.date || "" };
        const currentDistanceBest = bestByDistance.get(set.distance);
        if (
          !currentDistanceBest ||
          set.time < currentDistanceBest.time ||
          (set.time === currentDistanceBest.time && (workout.date || "") > currentDistanceBest.date)
        ) {
          bestByDistance.set(set.distance, candidate);
        }
        if (
          !fastestRep ||
          set.time < fastestRep.time ||
          (set.time === fastestRep.time && (workout.date || "") > fastestRep.date)
        ) {
          fastestRep = candidate;
        }
      });

      return {
        date: workout.date || "",
        repCount: sets.length,
        distances,
        bestTime,
        feeling,
      };
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return {
    workoutCount: sprintWorkouts.length,
    latestSprintDate: latestDate(sprintWorkouts),
    totalReps,
    uniqueDistanceCount: bestByDistance.size,
    fastestRep,
    bestByDistance: [...bestByDistance.values()].sort((a, b) => a.distance - b.distance),
    feelingCounts: [...feelingCounts.entries()]
      .map(([feeling, count]) => ({ feeling, count }))
      .sort((a, b) => b.count - a.count || a.feeling.localeCompare(b.feeling)),
    rows,
  };
}

function latestDate(workouts: SprintWorkout[]): string {
  return workouts
    .map((workout) => workout.date || "")
    .filter(Boolean)
    .sort()
    .at(-1) || "";
}
