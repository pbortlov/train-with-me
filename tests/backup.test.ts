import { describe, expect, it } from "vitest";
import { BACKUP_VERSION, createBackupPayload, parseBackupPayload } from "../src/domain/backup";

const requiredBackup = {
  workouts: [{ id: "w1", activity: "run" }],
  goals: { strength: 100 },
};

describe("backup compatibility", () => {
  it("exports the established version 2 shape", () => {
    const payload = createBackupPayload({
      ...requiredBackup,
      plannedSessions: [],
      phaseTemplates: [],
      phaseInstances: [],
      uiSettings: {},
      strengthProgression: { profiles: [] },
    }, "2026-06-10T10:00:00.000Z");

    expect(payload.version).toBe(BACKUP_VERSION);
    expect(payload.exportedAt).toBe("2026-06-10T10:00:00.000Z");
    expect(parseBackupPayload(payload).workouts).toHaveLength(1);
  });

  it("imports unversioned and older backups with omitted optional collections", () => {
    expect(parseBackupPayload(requiredBackup)).toEqual({
      ...requiredBackup,
      plannedSessions: [],
      phaseTemplates: [],
      phaseInstances: [],
      uiSettings: {},
      strengthProgression: {},
    });
    expect(parseBackupPayload({ version: 1, ...requiredBackup }).workouts).toHaveLength(1);
  });

  it("rejects backups without required workouts and goals", () => {
    expect(() => parseBackupPayload({ workouts: [] })).toThrow("Invalid backup file format.");
    expect(() => parseBackupPayload({ goals: {} })).toThrow("Invalid backup file format.");
  });

  it("keeps progression data optional for old backups and preserves it for new ones", () => {
    const parsed = parseBackupPayload({
      ...requiredBackup,
      strengthProgression: { gymWeightJumps: [1.25, 2.5], profiles: [{ exercise: "Back squat" }] },
    });

    expect(parsed.strengthProgression).toEqual({
      gymWeightJumps: [1.25, 2.5],
      profiles: [{ exercise: "Back squat" }],
    });
  });
});
