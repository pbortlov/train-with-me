import { normalizeStrengthExercises, type StrengthSet } from "./normalization";

export interface StrengthPerformanceWorkout {
  activity?: string;
  date?: string;
  createdAt?: number;
  strengthExercises?: unknown;
}

export interface StrengthKgBestSet {
  weight: number;
  reps: number;
  date: string;
}

export interface StrengthLastPerformance {
  exercise: string;
  date: string;
  sets: StrengthSet[];
  bestKgSet: StrengthKgBestSet | null;
}

interface ExerciseOccurrence {
  exercise: string;
  date: string;
  createdAt: number;
  workoutIndex: number;
  sets: StrengthSet[];
}

export function findStrengthLastPerformance(
  workouts: StrengthPerformanceWorkout[],
  exerciseName: string,
): StrengthLastPerformance | null {
  const exerciseKey = normalizeExerciseName(exerciseName);
  if (!exerciseKey) {
    return null;
  }

  const occurrences = workouts.flatMap((workout, workoutIndex) => {
    if (workout.activity !== "strength") {
      return [];
    }

    return normalizeStrengthExercises(workout.strengthExercises)
      .filter((exercise) => normalizeExerciseName(exercise.name) === exerciseKey)
      .map<ExerciseOccurrence>((exercise) => ({
        exercise: exercise.name,
        date: workout.date || "",
        createdAt: typeof workout.createdAt === "number" && Number.isFinite(workout.createdAt)
          ? workout.createdAt
          : 0,
        workoutIndex,
        sets: exercise.sets,
      }));
  });

  if (!occurrences.length) {
    return null;
  }

  const latest = [...occurrences].sort(compareRecentOccurrence)[0];
  return {
    exercise: latest.exercise,
    date: latest.date,
    sets: latest.sets,
    bestKgSet: findBestKgSet(occurrences),
  };
}

function normalizeExerciseName(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function findBestKgSet(occurrences: ExerciseOccurrence[]): StrengthKgBestSet | null {
  const candidates = occurrences.flatMap((occurrence) =>
    occurrence.sets
      .filter((set) => set.loadType === "kg" && typeof set.weight === "number")
      .map((set) => ({
        weight: set.weight as number,
        reps: set.reps,
        date: occurrence.date,
        createdAt: occurrence.createdAt,
        workoutIndex: occurrence.workoutIndex,
      })),
  );

  if (!candidates.length) {
    return null;
  }

  const best = candidates.sort((left, right) =>
    right.weight - left.weight ||
    right.reps - left.reps ||
    compareRecentOccurrence(left, right),
  )[0];
  return { weight: best.weight, reps: best.reps, date: best.date };
}

function compareRecentOccurrence(
  left: Pick<ExerciseOccurrence, "date" | "createdAt" | "workoutIndex">,
  right: Pick<ExerciseOccurrence, "date" | "createdAt" | "workoutIndex">,
): number {
  return (
    right.date.localeCompare(left.date) ||
    right.createdAt - left.createdAt ||
    left.workoutIndex - right.workoutIndex
  );
}
