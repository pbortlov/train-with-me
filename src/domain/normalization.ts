export interface SprintSet {
  order: number;
  time: number;
  distance: number;
}

export type SprintProfile = "acceleration" | "max-velocity" | "speed-endurance" | "repeat-sprint" | "hill-sprint" | "custom" | "";
export type SprintSurface = "natural-grass" | "artificial-turf" | "hybrid-grass" | "synthetic-track" | "indoor-synthetic-track" | "other" | "";
export type SprintSlope = "flat" | "uphill" | "downhill" | "";

const SPRINT_PROFILES: SprintProfile[] = ["acceleration", "max-velocity", "speed-endurance", "repeat-sprint", "hill-sprint", "custom", ""];
const SPRINT_SURFACES: SprintSurface[] = ["natural-grass", "artificial-turf", "hybrid-grass", "synthetic-track", "indoor-synthetic-track", "other", ""];
const SPRINT_SLOPES: SprintSlope[] = ["flat", "uphill", "downhill", ""];

export interface StrengthSet {
  order: number;
  reps: number;
  weight: number | null;
  loadType: "kg" | "bodyweight" | "band";
  bandColor: string;
}

export interface StrengthExercise {
  name: string;
  sets: StrengthSet[];
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function normalizeSprintSets(value: unknown): SprintSet[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((set): set is Record<string, unknown> => isRecord(set) && isNumber(set.time) && isNumber(set.distance))
    .map((set, index) => ({
      order: index + 1,
      time: Number(set.time),
      distance: Number(set.distance),
    }));
}

export function normalizeSprintProfile(value: unknown): SprintProfile {
  return typeof value === "string" && SPRINT_PROFILES.includes(value as SprintProfile)
    ? value as SprintProfile
    : "";
}

export function normalizeSprintSurface(value: unknown): SprintSurface {
  return typeof value === "string" && SPRINT_SURFACES.includes(value as SprintSurface)
    ? value as SprintSurface
    : "";
}

export function normalizeSprintSlope(value: unknown): SprintSlope {
  return typeof value === "string" && SPRINT_SLOPES.includes(value as SprintSlope)
    ? value as SprintSlope
    : "";
}

export function normalizeSprintText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeStrengthExercises(value: unknown): StrengthExercise[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (exercise): exercise is Record<string, unknown> =>
        isRecord(exercise) &&
        typeof exercise.name === "string" &&
        exercise.name.trim().length > 0 &&
        Array.isArray(exercise.sets),
    )
    .map((exercise) => ({
      name: String(exercise.name).trim(),
      sets: (exercise.sets as unknown[])
        .filter((set): set is Record<string, unknown> => isRecord(set) && isNumber(set.reps))
        .map((set, index) => {
          const loadType: StrengthSet["loadType"] =
            set.loadType === "band" || set.loadType === "bodyweight" ? set.loadType : "kg";
          return {
            order: index + 1,
            reps: Number(set.reps),
            weight: loadType === "kg" && isNumber(set.weight) ? Number(set.weight) : null,
            loadType,
            bandColor: typeof set.bandColor === "string" ? set.bandColor : "",
          };
        }),
    }))
    .filter((exercise) => exercise.sets.length > 0);
}
