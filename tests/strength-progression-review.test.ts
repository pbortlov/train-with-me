import { describe, expect, it } from "vitest";

import { strengthExerciseKey } from "../src/domain/normalization";
import {
  buildStrengthProgressionReview,
  buildStrengthSaveAchievements,
} from "../src/domain/strength-progression-review";

const backSquatProfile = {
  exercise: "Back squat",
  variation: "High bar",
  equipment: "Barbell",
  loadType: "kg" as const,
  key: strengthExerciseKey("Back squat", "High bar", "Barbell", "kg"),
  goal: "strength" as const,
  targetSets: 3,
  repMin: 8,
  repMax: 10,
  workingWeight: 32.5,
  allowedJumps: [1.25, 2.5],
};

describe("strength progression review", () => {
  it("shows exact comparable sequences and a promoted set across repeated sessions", () => {
    const review = buildStrengthProgressionReview([
      {
        activity: "strength",
        date: "2026-08-03",
        strengthExercises: [{
          name: "Back squat",
          variation: "High bar",
          equipment: "Barbell",
          loadType: "kg",
          sets: [
            { reps: 10, weight: 30, loadType: "kg" },
            { reps: 10, weight: 30, loadType: "kg" },
            { reps: 10, weight: 32.5, loadType: "kg" },
          ],
        }],
      },
      {
        activity: "strength",
        date: "2026-08-10",
        strengthExercises: [{
          name: "Back squat",
          variation: "High bar",
          equipment: "Barbell",
          loadType: "kg",
          sets: [
            { reps: 10, weight: 30, loadType: "kg" },
            { reps: 10, weight: 32.5, loadType: "kg" },
            { reps: 10, weight: 32.5, loadType: "kg" },
          ],
        }],
      },
    ], [backSquatProfile]);

    expect(review).toHaveLength(1);
    expect(review[0].sessions).toMatchObject([
      { date: "2026-08-03", progressFromPrevious: null },
      {
        date: "2026-08-10",
        sets: [
          { reps: 10, weight: 30 },
          { reps: 10, weight: 32.5 },
          { reps: 10, weight: 32.5 },
        ],
        topKgSet: { weight: 32.5, reps: 10 },
        progressFromPrevious: { promotedSetCount: 1, repGainCount: 0 },
      },
    ]);
  });

  it("keeps unlike, warm-up, and non-comparable work out of a target review", () => {
    const review = buildStrengthProgressionReview([
      {
        activity: "strength",
        date: "2026-08-01",
        strengthExercises: [{
          name: "Back squat",
          variation: "High bar",
          equipment: "Barbell",
          sets: [
            { reps: 8, weight: 20, loadType: "kg", kind: "warmup" },
            { reps: 8, weight: 80, loadType: "kg", kind: "working" },
          ],
        }],
      },
      {
        activity: "strength",
        date: "2026-08-08",
        strengthContext: { isDeload: true },
        strengthExercises: [{
          name: "Back squat",
          variation: "High bar",
          equipment: "Barbell",
          sets: [{ reps: 8, weight: 100, loadType: "kg", kind: "working" }],
        }],
      },
      {
        activity: "strength",
        date: "2026-08-15",
        strengthExercises: [{
          name: "Back squat",
          variation: "Low bar",
          equipment: "Barbell",
          sets: [{ reps: 8, weight: 100, loadType: "kg", kind: "working" }],
        }],
      },
      {
        activity: "strength",
        date: "2026-08-22",
        strengthExercises: [{
          name: "Back squat",
          variation: "High bar",
          equipment: "Barbell",
          sets: [{ reps: 8, weight: 82.5, loadType: "kg", kind: "working" }],
        }],
      },
    ], [backSquatProfile]);

    expect(review[0].sessions).toHaveLength(2);
    expect(review[0].sessions.map((session) => session.topKgSet?.weight)).toEqual([80, 82.5]);
  });

  it("returns positive post-save evidence without treating an unlike session as progress", () => {
    const previousWorkouts = [{
      activity: "strength",
      date: "2026-08-03",
      strengthExercises: [{
        name: "Back squat",
        variation: "High bar",
        equipment: "Barbell",
        sets: [
          { reps: 8, weight: 80, loadType: "kg" },
          { reps: 8, weight: 80, loadType: "kg" },
        ],
      }],
    }];
    const savedWorkout = {
      activity: "strength",
      date: "2026-08-10",
      strengthExercises: [{
        name: "Back squat",
        variation: "High bar",
        equipment: "Barbell",
        sets: [
          { reps: 8, weight: 82.5, loadType: "kg" },
          { reps: 9, weight: 80, loadType: "kg" },
        ],
      }],
    };

    expect(buildStrengthSaveAchievements(previousWorkouts, savedWorkout)).toEqual([{
      exercise: "Back squat",
      variation: "High bar",
      equipment: "Barbell",
      promotedSetCount: 1,
      repGainCount: 1,
      newHeaviestKgSet: { weight: 82.5, reps: 8 },
    }]);
    expect(buildStrengthSaveAchievements(previousWorkouts, {
      ...savedWorkout,
      strengthContext: { isTechnique: true },
    })).toEqual([]);
  });
});
