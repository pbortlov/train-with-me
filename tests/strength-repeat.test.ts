import { describe, expect, it } from 'vitest';
import { buildStrengthRepeatDraft, isRepeatSetValid } from '../src/domain/strength-repeat';
import { normalizeStrengthExercises } from '../src/domain/normalization';

describe('strength repeat', () => {
  it('copies actual values independently and clears pain and confirmation', () => {
    const source = [{ name: 'Squat', variation: 'Paused', equipment: 'Barbell', painAffected: true, sets: [{ reps: 10, weight: 30, loadType: 'kg' }] }];
    const [draft] = buildStrengthRepeatDraft(source);
    expect(draft.sets[0].confirmed).toBe(false);
    expect(draft).not.toHaveProperty('painAffected');
    draft.sets[0].weight = 35;
    expect(draft.previousSets[0].weight).toBe(30);
    expect(source[0].sets[0].weight).toBe(30);
    expect(draft.equipment).toBe('Barbell');
  });
  it('saves only confirmed edited work without previous snapshots', () => {
    const [draft] = buildStrengthRepeatDraft([{ name: 'Squat', sets: [{ reps: 10, weight: 30 }, { reps: 10, weight: 30 }] }]);
    draft.sets[0].reps = 8;
    draft.sets[0].weight = 35;
    draft.sets[0].confirmed = true;
    const [saved] = normalizeStrengthExercises([{ ...draft, sets: draft.sets.filter(s => s.confirmed) }]);
    expect(saved.sets).toHaveLength(1);
    expect(saved.sets[0]).toMatchObject({ reps: 8, weight: 35 });
    expect(saved).not.toHaveProperty('previousSets');
    expect(saved.sets[0]).not.toHaveProperty('confirmed');
  });
  it('rejects incomplete set numbers before confirmation', () => {
    const [draft] = buildStrengthRepeatDraft([{ name: 'Squat', sets: [{ reps: 10, weight: 30 }] }]);
    expect(isRepeatSetValid(draft.sets[0])).toBe(true);
    expect(isRepeatSetValid({ ...draft.sets[0], reps: 0 })).toBe(false);
    expect(isRepeatSetValid({ ...draft.sets[0], weight: null })).toBe(false);
    expect(isRepeatSetValid({ ...draft.sets[0], loadType: 'bodyweight', weight: null })).toBe(true);
  });
});
