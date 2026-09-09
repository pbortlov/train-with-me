import {
  isStrengthSessionComparable,
  normalizeStrengthExercises,
  strengthExerciseKey,
  type StrengthSet,
} from "./normalization";
import { findStrengthLastPerformance } from "./strength-last-performance";
import {
  buildStrengthSessionProgress,
  type StrengthProgressionProfile,
  type StrengthSessionProgress,
} from "./strength-progression";

export interface StrengthProgressionReviewWorkout {
  activity?: string;
  date?: string;
  createdAt?: number;
  strengthExercises?: unknown;
  strengthContext?: unknown;
}

export interface StrengthProgressionReviewSession {
  date: string;
  createdAt: number;
  sets: StrengthSet[];
  topKgSet: { weight: number; reps: number } | null;
  progressFromPrevious: StrengthSessionProgress | null;
}

export interface StrengthProgressionReviewRow {
  profile: StrengthProgressionProfile;
  sessions: StrengthProgressionReviewSession[];
}

export interface StrengthSaveAchievement {
  exercise: string;
  variation: string;
  equipment: string;
  promotedSetCount: number;
  repGainCount: number;
  newHeaviestKgSet: { weight: number; reps: number } | null;
}

interface ExerciseOccurrence {
  key: string;
  exercise: string;
  variation: string;
  equipment: string;
  date: string;
  createdAt: number;
  workoutIndex: number;
  sets: StrengthSet[];
}

/**
 * Builds the small, evidence-only history shown next to saved kg targets.
 * Unlike general Strength Insights, this deliberately uses only comparable
 * working kg sessions matching the complete progression identity.
 */
export function buildStrengthProgressionReview(
  workouts: StrengthProgressionReviewWorkout[],
  profiles: StrengthProgressionProfile[],
): StrengthProgressionReviewRow[] {
  const occurrences = comparableKgOccurrences(workouts);
  const byKey = new Map<string, ExerciseOccurrence[]>();
  occurrences.forEach((occurrence) => {
    byKey.set(occurrence.key, [...(byKey.get(occurrence.key) || []), occurrence]);
  });

  return profiles
    .filter((profile) => profile.loadType === "kg" || !profile.loadType)
    .map((profile) => {
      const sessions = mergeWorkoutOccurrences(byKey.get(profile.key) || [])
        .sort(compareChronological)
        .map((occurrence, index, all) => ({
          date: occurrence.date,
          createdAt: occurrence.createdAt,
          sets: occurrence.sets,
          topKgSet: findTopKgSet(occurrence.sets),
          progressFromPrevious: index
            ? buildStrengthSessionProgress(all[index - 1].sets, occurrence.sets)
            : null,
        }));
      return { profile, sessions };
    })
    .sort((left, right) => left.profile.exercise.localeCompare(right.profile.exercise));
}

/**
 * Finds only positive, session-to-session evidence to acknowledge after save.
 * It intentionally does not create streaks, volume scores, or a pass/fail
 * label for a workout.
 */
export function buildStrengthSaveAchievements(
  previousWorkouts: StrengthProgressionReviewWorkout[],
  savedWorkout: StrengthProgressionReviewWorkout,
): StrengthSaveAchievement[] {
  if (savedWorkout.activity !== "strength" || !isStrengthSessionComparable(savedWorkout.strengthContext)) {
    return [];
  }

  const currentOccurrences = mergeWorkoutOccurrences(
    comparableKgOccurrences([savedWorkout]),
  );
  return currentOccurrences.flatMap((current) => {
    const previous = findStrengthLastPerformance(
      previousWorkouts,
      current.exercise,
      current.variation,
      current.equipment,
      "kg",
    );
    if (!previous) {
      return [];
    }

    const progress = buildStrengthSessionProgress(previous.sets, current.sets);
    const currentTopSet = findTopKgSet(current.sets);
    const isNewHeaviest = Boolean(
      currentTopSet &&
        (!previous.bestKgSet || currentTopSet.weight > previous.bestKgSet.weight),
    );
    if (!progress.promotedSetCount && !progress.repGainCount && !isNewHeaviest) {
      return [];
    }

    return [{
      exercise: current.exercise,
      variation: current.variation,
      equipment: current.equipment,
      promotedSetCount: progress.promotedSetCount,
      repGainCount: progress.repGainCount,
      newHeaviestKgSet: isNewHeaviest && currentTopSet
        ? { weight: currentTopSet.weight, reps: currentTopSet.reps }
        : null,
    }];
  });
}

function comparableKgOccurrences(workouts: StrengthProgressionReviewWorkout[]): ExerciseOccurrence[] {
  return workouts.flatMap((workout, workoutIndex) => {
    if (workout.activity !== "strength" || !isStrengthSessionComparable(workout.strengthContext)) {
      return [];
    }

    return normalizeStrengthExercises(workout.strengthExercises)
      .filter((exercise) => exercise.loadType === "kg")
      .map((exercise) => {
        const sets = exercise.sets.filter(
          (set): set is StrengthSet & { weight: number } =>
            set.kind !== "warmup" && set.loadType === "kg" && typeof set.weight === "number",
        );
        return {
          key: strengthExerciseKey(exercise.name, exercise.variation, exercise.equipment, "kg"),
          exercise: exercise.name,
          variation: exercise.variation || "",
          equipment: exercise.equipment || "",
          date: workout.date || "",
          createdAt: typeof workout.createdAt === "number" && Number.isFinite(workout.createdAt)
            ? workout.createdAt
            : 0,
          workoutIndex,
          sets,
        };
      })
      .filter((occurrence) => occurrence.sets.length > 0);
  });
}

function mergeWorkoutOccurrences(occurrences: ExerciseOccurrence[]): ExerciseOccurrence[] {
  const byWorkoutAndKey = new Map<string, ExerciseOccurrence>();
  occurrences.forEach((occurrence) => {
    const mergeKey = `${occurrence.workoutIndex}\u0000${occurrence.key}`;
    const existing = byWorkoutAndKey.get(mergeKey);
    if (existing) {
      existing.sets.push(...occurrence.sets);
      return;
    }
    byWorkoutAndKey.set(mergeKey, { ...occurrence, sets: [...occurrence.sets] });
  });
  return [...byWorkoutAndKey.values()];
}

function compareChronological(left: ExerciseOccurrence, right: ExerciseOccurrence): number {
  return (
    left.date.localeCompare(right.date) ||
    left.createdAt - right.createdAt ||
    left.workoutIndex - right.workoutIndex
  );
}

function findTopKgSet(sets: StrengthSet[]): { weight: number; reps: number } | null {
  return sets
    .filter((set): set is StrengthSet & { weight: number } => set.loadType === "kg" && typeof set.weight === "number")
    .sort((left, right) => right.weight - left.weight || right.reps - left.reps)[0] || null;
}
