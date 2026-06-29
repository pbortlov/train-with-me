import { normalizeStrengthExercises } from "./normalization";

export interface StrengthWorkout {
  activity?: string;
  date?: string;
  strengthExercises?: unknown;
}

export interface StrengthInsightExerciseRow {
  exercise: string;
  setCount: number;
  workoutCount: number;
  bestKg: number | null;
  bestKgDate: string;
  loadTypes: string[];
}

export interface StrengthInsights {
  workoutCount: number;
  latestWorkoutDate: string;
  uniqueExerciseCount: number;
  totalSets: number;
  kgSetCount: number;
  bodyweightSetCount: number;
  bandSetCount: number;
  topKgLift: {
    exercise: string;
    weight: number;
    reps: number;
    date: string;
  } | null;
  mostTrainedExercise: {
    exercise: string;
    setCount: number;
  } | null;
  exerciseRows: StrengthInsightExerciseRow[];
}

export function buildStrengthInsights(
  workouts: StrengthWorkout[],
): StrengthInsights {
  const strengthWorkouts = workouts.filter(
    (workout) => workout.activity === "strength",
  );
  const rowsByExercise = new Map<string, StrengthInsightExerciseRow>();
  let topKgLift: StrengthInsights["topKgLift"] = null;
  let totalSets = 0;
  let kgSetCount = 0;
  let bodyweightSetCount = 0;
  let bandSetCount = 0;

  strengthWorkouts.forEach((workout) => {
    const workoutExerciseNames = new Set<string>();
    normalizeStrengthExercises(workout.strengthExercises).forEach((exercise) => {
      workoutExerciseNames.add(exercise.name);
      const row =
        rowsByExercise.get(exercise.name) ||
        {
          exercise: exercise.name,
          setCount: 0,
          workoutCount: 0,
          bestKg: null,
          bestKgDate: "",
          loadTypes: [],
        };
      const loadTypes = new Set(row.loadTypes);

      exercise.sets.forEach((set) => {
        totalSets += 1;
        row.setCount += 1;
        loadTypes.add(set.loadType);
        if (set.loadType === "kg" && typeof set.weight === "number") {
          kgSetCount += 1;
          const isBestForExercise = row.bestKg == null || set.weight > row.bestKg;
          if (isBestForExercise) {
            row.bestKg = set.weight;
            row.bestKgDate = workout.date || "";
          }
          const isTopLift =
            !topKgLift ||
            set.weight > topKgLift.weight ||
            (set.weight === topKgLift.weight && (workout.date || "") > topKgLift.date);
          if (isTopLift) {
            topKgLift = {
              exercise: exercise.name,
              weight: set.weight,
              reps: set.reps,
              date: workout.date || "",
            };
          }
          return;
        }
        if (set.loadType === "bodyweight") {
          bodyweightSetCount += 1;
          return;
        }
        if (set.loadType === "band") {
          bandSetCount += 1;
        }
      });

      row.loadTypes = [...loadTypes].sort();
      rowsByExercise.set(exercise.name, row);
    });

    workoutExerciseNames.forEach((name) => {
      const row = rowsByExercise.get(name);
      if (row) {
        row.workoutCount += 1;
      }
    });
  });

  const exerciseRows = [...rowsByExercise.values()].sort((a, b) => {
    const setDiff = b.setCount - a.setCount;
    return setDiff || a.exercise.localeCompare(b.exercise);
  });
  const mostTrainedExercise = exerciseRows[0]
    ? {
        exercise: exerciseRows[0].exercise,
        setCount: exerciseRows[0].setCount,
      }
    : null;

  return {
    workoutCount: strengthWorkouts.length,
    latestWorkoutDate: latestDate(strengthWorkouts),
    uniqueExerciseCount: rowsByExercise.size,
    totalSets,
    kgSetCount,
    bodyweightSetCount,
    bandSetCount,
    topKgLift,
    mostTrainedExercise,
    exerciseRows,
  };
}

function latestDate(workouts: StrengthWorkout[]): string {
  return workouts
    .map((workout) => workout.date || "")
    .filter(Boolean)
    .sort()
    .at(-1) || "";
}
