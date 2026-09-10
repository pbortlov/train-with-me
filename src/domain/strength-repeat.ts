import { normalizeStrengthExercises, type StrengthSet } from './normalization';

export function buildStrengthRepeatDraft(value: unknown) {
  return normalizeStrengthExercises(value).map(({ painAffected, ...exercise }) => ({
    ...exercise,
    repeatDraft: true,
    previousSets: exercise.sets.map(set => ({ ...set })),
    sets: exercise.sets.map(set => ({ ...set, confirmed: false })),
  }));
}

export function isRepeatSetValid(set: StrengthSet): boolean {
  return Number.isInteger(set.reps) && set.reps > 0 &&
    (set.loadType !== 'kg' || (typeof set.weight === 'number' && Number.isFinite(set.weight) && set.weight >= 0)) &&
    (set.loadType !== 'band' || Boolean(set.bandColor));
}
