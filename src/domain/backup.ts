export const BACKUP_VERSION = 2;

export interface BackupCollections {
  workouts: unknown[];
  goals: Record<string, unknown>;
  plannedSessions: unknown[];
  phaseTemplates: unknown[];
  phaseInstances: unknown[];
  uiSettings: Record<string, unknown>;
  strengthProgression: unknown;
}

export interface BackupPayload extends BackupCollections {
  version: number;
  exportedAt: string;
}

export function createBackupPayload(collections: BackupCollections, exportedAt = new Date().toISOString()): BackupPayload {
  return {
    version: BACKUP_VERSION,
    exportedAt,
    ...collections,
  };
}

export function parseBackupPayload(value: unknown): BackupCollections {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid backup file format.");
  }

  const backup = value as Record<string, unknown>;
  if (!Array.isArray(backup.workouts) || !backup.goals || typeof backup.goals !== "object" || Array.isArray(backup.goals)) {
    throw new Error("Invalid backup file format.");
  }

  return {
    workouts: backup.workouts,
    goals: backup.goals as Record<string, unknown>,
    plannedSessions: Array.isArray(backup.plannedSessions) ? backup.plannedSessions : [],
    phaseTemplates: Array.isArray(backup.phaseTemplates) ? backup.phaseTemplates : [],
    phaseInstances: Array.isArray(backup.phaseInstances) ? backup.phaseInstances : [],
    uiSettings:
      backup.uiSettings && typeof backup.uiSettings === "object" && !Array.isArray(backup.uiSettings)
        ? backup.uiSettings as Record<string, unknown>
        : {},
    strengthProgression: backup.strengthProgression || {},
  };
}
