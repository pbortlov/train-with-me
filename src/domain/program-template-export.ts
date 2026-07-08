export const PROGRAM_TEMPLATE_EXPORT_VERSION = 1;

export interface ProgramTemplateExercise {
  code: string;
  name: string;
  reps: string;
  notes: string;
  weight: number | null;
}

export interface ProgramTemplateBlock {
  label: string;
  durationMin: number | null;
  durationMax: number | null;
  restSec: number | null;
  restMaxSec: number | null;
  sets: string;
  exercises: ProgramTemplateExercise[];
}

export interface ProgramTemplateDay {
  id: string;
  weekday: number;
  title: string;
  notes: string;
  blocks: ProgramTemplateBlock[];
}

export interface ProgramTemplate {
  id: string;
  name: string;
  durationWeeks: number;
  weekdaySlots: ProgramTemplateDay[];
  importedAt: number;
  updatedAt: number;
  copiedFromTemplateId: string;
}

export interface ProgramTemplateExportPayload {
  version: number;
  exportedAt: string;
  phaseTemplates: ProgramTemplate[];
}

function createTemplateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `template-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toNumberOrNull(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function normalizeText(value: unknown, fallback = ""): string {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function normalizeBlock(block: unknown): ProgramTemplateBlock {
  const normalizedBlock = asRecord(block);
  return {
    label: normalizeText(normalizedBlock.label),
    durationMin: toNumberOrNull(normalizedBlock.durationMin),
    durationMax: toNumberOrNull(normalizedBlock.durationMax),
    restSec: toNumberOrNull(normalizedBlock.restSec),
    restMaxSec: toNumberOrNull(normalizedBlock.restMaxSec),
    sets: normalizeText(normalizedBlock.sets),
    exercises: Array.isArray(normalizedBlock.exercises)
      ? normalizedBlock.exercises.map(normalizeExercise)
      : [],
  };
}

function normalizeExercise(exercise: unknown): ProgramTemplateExercise {
  const normalizedExercise = asRecord(exercise);
  return {
    code: normalizeText(normalizedExercise.code),
    name: normalizeText(normalizedExercise.name, "Exercise"),
    reps: normalizeText(normalizedExercise.reps),
    notes: normalizeText(normalizedExercise.notes),
    weight: toNumberOrNull(normalizedExercise.weight),
  };
}

function normalizeDay(day: unknown): ProgramTemplateDay {
  const normalizedDay = asRecord(day);
  return {
    id: normalizeText(normalizedDay.id, createTemplateId()),
    weekday: toNumberOrNull(normalizedDay.weekday) || 1,
    title: normalizeText(normalizedDay.title, "Strength session"),
    notes: normalizeText(normalizedDay.notes),
    blocks: Array.isArray(normalizedDay.blocks) ? normalizedDay.blocks.map(normalizeBlock) : [],
  };
}

export function normalizeProgramTemplate(template: unknown): ProgramTemplate {
  const normalizedTemplate = asRecord(template);
  const importedAt = toNumberOrNull(normalizedTemplate.importedAt);
  const updatedAt = toNumberOrNull(normalizedTemplate.updatedAt);
  const fallbackTimestamp = importedAt || Date.now();

  return {
    id: normalizeText(normalizedTemplate.id, createTemplateId()),
    name: normalizeText(normalizedTemplate.name, "Strength phase"),
    durationWeeks: toNumberOrNull(normalizedTemplate.durationWeeks) || 1,
    weekdaySlots: Array.isArray(normalizedTemplate.weekdaySlots)
      ? normalizedTemplate.weekdaySlots.map(normalizeDay)
      : [],
    importedAt: fallbackTimestamp,
    updatedAt: updatedAt || fallbackTimestamp,
    copiedFromTemplateId: normalizeText(normalizedTemplate.copiedFromTemplateId),
  };
}

export function normalizeProgramTemplates(value: unknown): ProgramTemplate[] {
  return Array.isArray(value) ? value.map(normalizeProgramTemplate) : [];
}

export function createProgramTemplateExportPayload(
  phaseTemplates: unknown[],
  exportedAt = new Date().toISOString(),
): ProgramTemplateExportPayload {
  return {
    version: PROGRAM_TEMPLATE_EXPORT_VERSION,
    exportedAt,
    phaseTemplates: normalizeProgramTemplates(phaseTemplates),
  };
}

export function parseProgramTemplateExportPayload(value: unknown): ProgramTemplate[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid program template export file format.");
  }

  const payload = value as Record<string, unknown>;
  const version = payload.version;
  if (version != null && version !== PROGRAM_TEMPLATE_EXPORT_VERSION) {
    throw new Error("Invalid program template export file format.");
  }
  if (!Array.isArray(payload.phaseTemplates)) {
    throw new Error("Invalid program template export file format.");
  }

  return normalizeProgramTemplates(payload.phaseTemplates);
}

export function mergeProgramTemplates(existing: ProgramTemplate[], imported: ProgramTemplate[]): ProgramTemplate[] {
  const importedIds = new Set(imported.map((template) => template.id));
  return [...imported, ...existing.filter((template) => !importedIds.has(template.id))];
}
