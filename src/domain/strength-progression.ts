import type { StrengthSet } from "./normalization";

export const DEFAULT_GYM_WEIGHT_JUMPS = [1, 1.25, 2.5, 5];

export interface StrengthProgressionProfile {
  exercise: string;
  key: string;
  goal: "strength";
  targetSets: number;
  repMin: number;
  repMax: number;
  workingWeight: number;
  allowedJumps: number[];
}

export interface StrengthProgressionState {
  gymWeightJumps: number[];
  profiles: StrengthProgressionProfile[];
}

export interface StrengthSessionProgress {
  promotedSetCount: number;
  repGainCount: number;
}

export interface QualifyingHeavierSet {
  reps: number;
  weight: number;
}

export interface AutomaticStrengthTargetProgression {
  profile: StrengthProgressionProfile;
  qualifyingSet: QualifyingHeavierSet | null;
  nextTargetSuggestion: NextTargetSuggestion | null;
}

export interface NextTargetSuggestion {
  targetSets: number;
  reps: number;
  weight: number;
  increment: number;
}

export function createDefaultStrengthProgressionState(): StrengthProgressionState {
  return {
    gymWeightJumps: [...DEFAULT_GYM_WEIGHT_JUMPS],
    profiles: [],
  };
}

export function normalizeStrengthProgressionState(value: unknown): StrengthProgressionState {
  if (!isRecord(value)) {
    return createDefaultStrengthProgressionState();
  }

  const profilesByKey = new Map<string, StrengthProgressionProfile>();
  const profiles = Array.isArray(value.profiles) ? value.profiles : [];
  profiles.forEach((profile) => {
    const normalized = normalizeStrengthProgressionProfile(profile);
    if (normalized) {
      profilesByKey.set(normalized.key, normalized);
    }
  });

  const gymWeightJumps = normalizeWeightJumps(value.gymWeightJumps, DEFAULT_GYM_WEIGHT_JUMPS);
  return {
    gymWeightJumps: gymWeightJumps.length ? gymWeightJumps : [...DEFAULT_GYM_WEIGHT_JUMPS],
    profiles: [...profilesByKey.values()].sort((left, right) => left.exercise.localeCompare(right.exercise)),
  };
}

export function findStrengthProgressionProfile(
  state: StrengthProgressionState,
  exerciseName: string,
): StrengthProgressionProfile | null {
  const key = normalizeExerciseKey(exerciseName);
  return state.profiles.find((profile) => profile.key === key) || null;
}

export function upsertStrengthProgressionProfile(
  state: StrengthProgressionState,
  profile: Omit<StrengthProgressionProfile, "key">,
): StrengthProgressionState {
  const normalized = normalizeStrengthProgressionProfile(profile);
  if (!normalized) {
    return state;
  }

  return {
    ...state,
    profiles: [...state.profiles.filter((entry) => entry.key !== normalized.key), normalized]
      .sort((left, right) => left.exercise.localeCompare(right.exercise)),
  };
}

export function parseWeightJumps(value: string): number[] {
  return normalizeWeightJumps(
    value.split(",").map((entry) => Number(entry.trim())).filter(Number.isFinite),
    [],
  );
}

export function getAllowedWeightJumps(
  state: StrengthProgressionState,
  profile: StrengthProgressionProfile,
): number[] {
  return profile.allowedJumps.length ? profile.allowedJumps : state.gymWeightJumps;
}

export function buildStrengthSessionProgress(
  previousSets: StrengthSet[],
  currentSets: StrengthSet[],
): StrengthSessionProgress {
  const previousKgSets = kgSets(previousSets);
  const currentKgSets = kgSets(currentSets);

  return {
    promotedSetCount: countPromotedSets(previousKgSets, currentKgSets),
    repGainCount: countRepGains(previousKgSets, currentKgSets),
  };
}

export function advanceStrengthTargetAfterWorkout(
  profile: StrengthProgressionProfile,
  completedSets: StrengthSet[],
  gymWeightJumps: number[],
): AutomaticStrengthTargetProgression {
  const qualifyingSet = findQualifyingHeavierKgSet(completedSets, profile);
  return {
    profile: qualifyingSet ? { ...profile, workingWeight: qualifyingSet.weight } : profile,
    qualifyingSet,
    nextTargetSuggestion: qualifyingSet
      ? null
      : findTopRangeNextTargetSuggestion(completedSets, profile, gymWeightJumps),
  };
}

export function findQualifyingHeavierKgSet(
  completedSets: StrengthSet[],
  profile: Pick<StrengthProgressionProfile, "workingWeight" | "repMin">,
): QualifyingHeavierSet | null {
  return kgSets(completedSets)
    .filter((set) => set.weight > profile.workingWeight && set.reps >= profile.repMin)
    .sort((left, right) => right.weight - left.weight || right.reps - left.reps)[0] || null;
}

export function findTopRangeNextTargetSuggestion(
  completedSets: StrengthSet[],
  profile: StrengthProgressionProfile,
  gymWeightJumps: number[],
): NextTargetSuggestion | null {
  const completedTargetSetCount = kgSets(completedSets).filter(
    (set) => set.weight >= profile.workingWeight && set.reps >= profile.repMax,
  ).length;
  if (completedTargetSetCount < profile.targetSets) {
    return null;
  }

  const increment = selectSuggestedIncrement(
    profile.allowedJumps.length ? profile.allowedJumps : gymWeightJumps,
    profile.workingWeight,
  );
  return increment == null
    ? null
    : {
      targetSets: profile.targetSets,
      reps: profile.repMin,
      weight: profile.workingWeight + increment,
      increment,
    };
}

function normalizeStrengthProgressionProfile(value: unknown): StrengthProgressionProfile | null {
  if (!isRecord(value) || typeof value.exercise !== "string") {
    return null;
  }

  const exercise = value.exercise.trim();
  const key = normalizeExerciseKey(exercise);
  const targetSets = positiveInteger(value.targetSets);
  const repMin = positiveInteger(value.repMin);
  const repMax = positiveInteger(value.repMax);
  const workingWeight = positiveNumber(value.workingWeight) ? value.workingWeight : null;
  if (!key || !targetSets || !repMin || !repMax || repMax < repMin || !workingWeight) {
    return null;
  }

  return {
    exercise,
    key,
    goal: "strength",
    targetSets,
    repMin,
    repMax,
    workingWeight,
    allowedJumps: normalizeWeightJumps(value.allowedJumps, []),
  };
}

function countPromotedSets(previousSets: ComparableKgSet[], currentSets: ComparableKgSet[]): number {
  const previousByReps = setsByMetric(previousSets, (set) => set.reps, (set) => set.weight);
  const currentByReps = setsByMetric(currentSets, (set) => set.reps, (set) => set.weight);
  let promotedSetCount = 0;

  currentByReps.forEach((currentWeights, reps) => {
    const previousWeights = previousByReps.get(reps) || [];
    currentWeights.forEach((weight, index) => {
      if (index < previousWeights.length && weight > previousWeights[index]) {
        promotedSetCount += 1;
      }
    });
  });

  return promotedSetCount;
}

function countRepGains(previousSets: ComparableKgSet[], currentSets: ComparableKgSet[]): number {
  const previousByWeight = setsByMetric(previousSets, (set) => set.weight, (set) => set.reps);
  const currentByWeight = setsByMetric(currentSets, (set) => set.weight, (set) => set.reps);
  let repGainCount = 0;

  currentByWeight.forEach((currentReps, weight) => {
    const previousReps = previousByWeight.get(weight) || [];
    currentReps.forEach((reps, index) => {
      if (index < previousReps.length && reps > previousReps[index]) {
        repGainCount += 1;
      }
    });
  });

  return repGainCount;
}

function setsByMetric(
  sets: ComparableKgSet[],
  groupBy: (set: ComparableKgSet) => number,
  valueOf: (set: ComparableKgSet) => number,
): Map<number, number[]> {
  const grouped = new Map<number, number[]>();
  sets.forEach((set) => {
    const key = groupBy(set);
    grouped.set(key, [...(grouped.get(key) || []), valueOf(set)]);
  });
  grouped.forEach((values, key) => grouped.set(key, values.sort((left, right) => left - right)));
  return grouped;
}

function selectSuggestedIncrement(jumps: number[], workingWeight: number): number | null {
  if (!jumps.length) {
    return null;
  }

  const targetIncrement = workingWeight * 0.025;
  return [...jumps].sort((left, right) =>
    Math.abs(left - targetIncrement) - Math.abs(right - targetIncrement) || left - right,
  )[0];
}

function kgSets(sets: StrengthSet[]): ComparableKgSet[] {
  return sets
    .filter((set): set is StrengthSet & { weight: number } => set.loadType === "kg" && typeof set.weight === "number")
    .map((set) => ({ reps: set.reps, weight: set.weight }));
}

function normalizeWeightJumps(value: unknown, fallback: number[]): number[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  return [...new Set(value.filter(positiveNumber))].sort((left, right) => left - right);
}

function normalizeExerciseKey(value: string): string {
  return value.trim().toLowerCase();
}

function positiveInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

function positiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

interface ComparableKgSet {
  reps: number;
  weight: number;
}
