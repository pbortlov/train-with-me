export interface ProgramPreviewExercise {
  code: string;
  name: string;
  reps: string;
  notes: string;
  weight: string;
}

export interface ProgramPreviewBlock {
  label: string;
  duration: string;
  rest: string;
  sets: string;
  exercises: ProgramPreviewExercise[];
}

export interface ProgramPreviewDay {
  weekday: string;
  title: string;
  notes: string;
  blocks: ProgramPreviewBlock[];
}

export interface ProgramPreviewModel {
  name: string;
  durationWeeks: string;
  days: ProgramPreviewDay[];
}

export interface ProgramPreviewResult {
  model: ProgramPreviewModel | null;
  error: string;
}

export interface ProgramBasics {
  name: string;
  durationWeeks: string;
}

export interface ProgramTrainingDay {
  weekday: string;
  title: string;
  notes: string;
}

export function buildProgramPreview(text: unknown, overrideName = ""): ProgramPreviewResult {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { model: null, error: "Paste or import a program to preview it." };
  }

  const model: ProgramPreviewModel = {
    name: overrideName.trim(),
    durationWeeks: "",
    days: [],
  };
  let currentDay: ProgramPreviewDay | null = null;
  let currentBlock: ProgramPreviewBlock | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const columns = lines[index].split(",").map((column) => column.trim());
    const rowType = columns[0]?.toUpperCase();

    if (rowType === "PHASE") {
      model.name = overrideName.trim() || columns[1] || model.name;
      model.durationWeeks = columns[2] || "";
      if (!model.name || !model.durationWeeks) {
        return { model: null, error: `Line ${index + 1}: add a program name and duration.` };
      }
      continue;
    }

    if (rowType === "SLOT") {
      if (!columns[1]) {
        return { model: null, error: `Line ${index + 1}: add a weekday for this training day.` };
      }
      currentDay = {
        weekday: columns[1],
        title: columns[2] || `Strength session ${model.days.length + 1}`,
        notes: columns[3] || "",
        blocks: [],
      };
      model.days.push(currentDay);
      currentBlock = null;
      continue;
    }

    if (rowType === "BLOCK") {
      if (!currentDay) {
        return { model: null, error: `Line ${index + 1}: add a training day before adding blocks.` };
      }
      currentBlock = {
        label: columns[1] || `Block ${currentDay.blocks.length + 1}`,
        duration: columns[2] || "",
        rest: columns[3] || "",
        sets: columns[4] || "",
        exercises: [],
      };
      currentDay.blocks.push(currentBlock);
      continue;
    }

    if (rowType === "EXERCISE") {
      if (!currentBlock) {
        return { model: null, error: `Line ${index + 1}: add a block before adding exercises.` };
      }
      currentBlock.exercises.push({
        code: columns[1] || `E${currentBlock.exercises.length + 1}`,
        name: columns[2] || "Exercise",
        reps: columns[3] || "",
        notes: columns[4] || "",
        weight: columns[5] || "",
      });
      continue;
    }

    return { model: null, error: `Line ${index + 1}: "${columns[0]}" is not a supported row type.` };
  }

  if (!model.name || !model.durationWeeks || !model.days.length) {
    return { model: null, error: "Add a PHASE row and at least one training day to preview this program." };
  }

  return { model, error: "" };
}

export function readProgramBasics(text: unknown, overrideName = ""): ProgramBasics {
  const phaseColumns = findPhaseColumns(text);
  return {
    name: overrideName.trim() || phaseColumns?.[1] || "",
    durationWeeks: phaseColumns?.[2] || "",
  };
}

export function updateProgramBasics(text: unknown, basics: ProgramBasics): string {
  const lines = String(text || "").split("\n");
  const normalizedName = basics.name.trim();
  const normalizedDuration = basics.durationWeeks.trim();
  const phaseRow = `PHASE,${normalizedName},${normalizedDuration}`;
  const phaseIndex = lines.findIndex((line) => line.trim().split(",")[0]?.trim().toUpperCase() === "PHASE");

  if (phaseIndex >= 0) {
    const nextLines = [...lines];
    nextLines[phaseIndex] = phaseRow;
    return nextLines.join("\n");
  }

  return [phaseRow, ...lines.filter((line) => line.length > 0)].join("\n");
}

export function readProgramTrainingDays(text: unknown): ProgramTrainingDay[] {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.split(",")[0]?.trim().toUpperCase() === "SLOT")
    .map((line) => {
      const columns = line.split(",").map((column) => column.trim());
      return {
        weekday: columns[1] || "",
        title: columns[2] || "",
        notes: columns[3] || "",
      };
    });
}

export function updateProgramTrainingDays(text: unknown, days: ProgramTrainingDay[]): string {
  const lines = String(text || "").split("\n");
  const firstSlotIndex = lines.findIndex(isSlotLine);
  const prefix = firstSlotIndex >= 0 ? lines.slice(0, firstSlotIndex) : lines;
  const existingSegments = splitSlotSegments(firstSlotIndex >= 0 ? lines.slice(firstSlotIndex) : []);
  const nextSegments = days.map((day, index) => {
    const existingRest = existingSegments[index]?.slice(1) || [];
    return [formatSlotRow(day, index), ...existingRest];
  });
  return [...prefix, ...nextSegments.flat()].filter((line) => line.length > 0).join("\n");
}

function splitSlotSegments(lines: string[]): string[][] {
  const segments: string[][] = [];
  lines.forEach((line) => {
    if (isSlotLine(line) || segments.length === 0) {
      segments.push([line]);
      return;
    }
    segments[segments.length - 1].push(line);
  });
  return segments.filter((segment) => segment.some((line) => isSlotLine(line)));
}

function formatSlotRow(day: ProgramTrainingDay, index: number): string {
  const weekday = day.weekday.trim();
  const title = day.title.trim() || `Strength session ${index + 1}`;
  const notes = day.notes.trim();
  return `SLOT,${weekday},${title},${notes}`;
}

function isSlotLine(line: string): boolean {
  return line.trim().split(",")[0]?.trim().toUpperCase() === "SLOT";
}

function findPhaseColumns(text: unknown): string[] | null {
  const phaseLine = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.split(",")[0]?.trim().toUpperCase() === "PHASE");
  return phaseLine ? phaseLine.split(",").map((column) => column.trim()) : null;
}
