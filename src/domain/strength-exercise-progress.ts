import {
  isStrengthSessionComparable,
  normalizeStrengthExercises,
  strengthExerciseKey,
  type StrengthSet,
} from "./normalization";
import type { StrengthProgressionProfile } from "./strength-progression";

export interface StrengthExerciseProgressWorkout {
  activity?: string;
  date?: string;
  createdAt?: number;
  strengthExercises?: unknown;
  strengthContext?: unknown;
}

export interface StrengthExerciseProgressRow {
  key: string;
  exercise: string;
  variation: string;
  equipment: string;
  loadType: StrengthSet["loadType"];
  sessionCount: number;
  setCount: number;
  latestDate: string;
  latestSets: StrengthSet[];
  latestStatus: "comparable" | "pain-excluded" | "session-excluded";
  hasSavedTarget: boolean;
}

interface ExerciseOccurrence {
  key: string;
  exercise: string;
  variation: string;
  equipment: string;
  loadType: StrengthSet["loadType"];
  date: string;
  createdAt: number;
  workoutIndex: number;
  sets: StrengthSet[];
  status: StrengthExerciseProgressRow["latestStatus"];
}

export function buildStrengthExerciseProgressList(
  workouts: StrengthExerciseProgressWorkout[],
  profiles: StrengthProgressionProfile[] = [],
): StrengthExerciseProgressRow[] {
  const occurrences = workouts.flatMap((workout, workoutIndex) => {
    if (workout.activity !== "strength") {
      return [];
    }
    const sessionComparable = isStrengthSessionComparable(workout.strengthContext);
    return normalizeStrengthExercises(workout.strengthExercises).map((exercise) => {
      const loadType = exercise.loadType || exercise.sets[0]?.loadType || "kg";
      const status: ExerciseOccurrence["status"] = exercise.painAffected
        ? "pain-excluded"
        : sessionComparable
          ? "comparable"
          : "session-excluded";
      return {
        key: strengthExerciseKey(exercise.name, exercise.variation, exercise.equipment, loadType),
        exercise: exercise.name,
        variation: exercise.variation || "",
        equipment: exercise.equipment || "",
        loadType,
        date: workout.date || "",
        createdAt: typeof workout.createdAt === "number" && Number.isFinite(workout.createdAt)
          ? workout.createdAt
          : 0,
        workoutIndex,
        sets: [...exercise.sets],
        status,
      };
    });
  });

  const grouped = new Map<string, ExerciseOccurrence[]>();
  occurrences.forEach((occurrence) => {
    grouped.set(occurrence.key, [...(grouped.get(occurrence.key) || []), occurrence]);
  });

  return [...grouped.entries()]
    .map(([key, entries]) => {
      const ordered = entries.slice().sort(compareChronological);
      const latest = ordered.at(-1) as ExerciseOccurrence;
      const profile = profiles.find((candidate) => candidate.key === key);
      return {
        key,
        exercise: latest.exercise,
        variation: latest.variation,
        equipment: latest.equipment,
        loadType: latest.loadType,
        sessionCount: ordered.length,
        setCount: ordered.reduce((total, entry) => total + entry.sets.length, 0),
        latestDate: latest.date,
        latestSets: latest.sets,
        latestStatus: latest.status,
        hasSavedTarget: Boolean(profile && (profile.loadType === "kg" || !profile.loadType)),
      };
    })
    .sort((left, right) =>
      right.latestDate.localeCompare(left.latestDate)
      || left.exercise.localeCompare(right.exercise)
      || left.key.localeCompare(right.key),
    );
}

function compareChronological(left: ExerciseOccurrence, right: ExerciseOccurrence): number {
  return left.date.localeCompare(right.date)
    || left.createdAt - right.createdAt
    || left.workoutIndex - right.workoutIndex;
}
