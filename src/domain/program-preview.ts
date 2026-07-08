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

export function buildProgramPreviewSummary(model: ProgramPreviewModel | null): string {
  if (!model) {
    return "";
  }
  const dayCount = model.days.length;
  const blockCount = model.days.reduce((total, day) => total + day.blocks.length, 0);
  const exerciseCount = model.days.reduce(
    (total, day) =>
      total + day.blocks.reduce((blockTotal, block) => blockTotal + block.exercises.length, 0),
    0,
  );

  return [
    `${dayCount} training ${dayCount === 1 ? "day" : "days"}`,
    `${blockCount} ${blockCount === 1 ? "block" : "blocks"}`,
    `${exerciseCount} ${exerciseCount === 1 ? "exercise" : "exercises"}`,
  ].join(" • ");
}

export function buildProgramPreviewSummaryFromText(text: unknown, overrideName = ""): string {
  return buildProgramPreviewSummary(buildProgramPreview(text, overrideName).model);
}

export function buildProgramTemplateSummary(template: unknown): { summary: string; detail: string } {
  const normalizedTemplate = template as {
    durationWeeks?: unknown;
    weekdaySlots?: Array<{
      weekday?: unknown;
      title?: unknown;
      blocks?: Array<{
        exercises?: unknown[];
      }>;
    }>;
  } | null;

  if (!normalizedTemplate) {
    return { summary: "", detail: "" };
  }

  const weekdaySlots = Array.isArray(normalizedTemplate.weekdaySlots) ? normalizedTemplate.weekdaySlots : [];
  const dayCount = weekdaySlots.length;
  const blockCount = weekdaySlots.reduce((total, slot) => total + (Array.isArray(slot.blocks) ? slot.blocks.length : 0), 0);
  const exerciseCount = weekdaySlots.reduce(
    (total, slot) =>
      total +
      (Array.isArray(slot.blocks)
        ? slot.blocks.reduce(
            (blockTotal, block) => blockTotal + (Array.isArray(block.exercises) ? block.exercises.length : 0),
            0,
          )
        : 0),
    0,
  );
  const durationWeeks = Number(normalizedTemplate.durationWeeks) || 0;
  const summary = [
    `${durationWeeks} weeks`,
    `${dayCount} training ${dayCount === 1 ? "day" : "days"}`,
    `${blockCount} ${blockCount === 1 ? "block" : "blocks"}`,
    `${exerciseCount} ${exerciseCount === 1 ? "exercise" : "exercises"}`,
  ].join(" • ");
  const detailSlots = weekdaySlots.slice(0, 2).map((slot) => {
    const title = String(slot.title || "Strength session");
    const notes = String((slot as { notes?: unknown }).notes || "").trim();
    return `${formatWeekdayLabel(slot.weekday)}: ${title}${notes ? ` (${notes})` : ""}`;
  });
  const detail = detailSlots.length
    ? `${detailSlots.join(" • ")}${weekdaySlots.length > detailSlots.length ? ` • +${weekdaySlots.length - detailSlots.length} more` : ""}`
    : "No training days";

  return { summary, detail };
}

export function filterPhaseTemplatesForDisplay<
  T extends {
    name?: unknown;
    durationWeeks?: unknown;
    weekdaySlots?: Array<{
      weekday?: unknown;
      title?: unknown;
      notes?: unknown;
      blocks?: Array<{
        label?: unknown;
        duration?: unknown;
        rest?: unknown;
        sets?: unknown;
        exercises?: Array<{
          code?: unknown;
          name?: unknown;
          reps?: unknown;
          notes?: unknown;
          weight?: unknown;
        }>;
      }>;
    }>;
  },
>(templates: T[], query: unknown): T[] {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) {
    return [...templates];
  }

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  return templates.filter((template) => {
    const haystack = buildTemplateSearchText(template);
    return tokens.every((token) => haystack.includes(token));
  });
}

export function buildProgramImportHints(error: unknown): string[] {
  const message = String(error || "");
  if (!message) {
    return [];
  }
  if (message.includes("Paste or import a program")) {
    return ["Start with a PROGRAM row, then add at least one TRAINING row."];
  }
  if (message.includes("PROGRAM row needs a program name")) {
    return ["Add text after `PROGRAM,` for the program name."];
  }
  if (message.includes("PROGRAM row needs a duration in weeks")) {
    return ["Add a positive whole-number week count like `PROGRAM,Phase 1,5`."];
  }
  if (message.includes("PROGRAM row duration must be a positive integer")) {
    return ["Use a positive whole number for weeks, like `PROGRAM,Phase 1,5`."];
  }
  if (message.includes("add a training day before adding blocks")) {
    return ["Add a `TRAINING` row before any `BLOCK` rows."];
  }
  if (message.includes("add a block before adding exercises")) {
    return ["Add a `BLOCK` row before any `EXERCISE` rows."];
  }
  if (message.includes("must include at least one EXERCISE row")) {
    return ["Add at least one `EXERCISE` row before starting the next `BLOCK` or `TRAINING`."];
  }
  if (message.includes("Empty block detected")) {
    return [
      "Add at least one `EXERCISE` row to every `BLOCK` before saving.",
      "Delete the `BLOCK` row if the block should not exist.",
    ];
  }
  if (message.includes("not a supported row type")) {
    return ["Use only `PROGRAM`, `TRAINING`, `BLOCK`, and `EXERCISE` rows."];
  }
  if (message.includes("Add a PROGRAM row and at least one training day")) {
    return ["Include a `PROGRAM` row and at least one `TRAINING` row.", "A minimal example is `PROGRAM,Phase 1,5` then `TRAINING,Tuesday,Strength A,Notes`."];
  }
  return [];
}

export function buildCopiedProgramName(name: unknown): string {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) {
    return "Copy of Strength phase";
  }
  return normalizedName.toLowerCase().startsWith("copy of ") ? normalizedName : `Copy of ${normalizedName}`;
}

export function sortPhaseTemplatesForDisplay<
  T extends { updatedAt?: unknown; importedAt?: unknown; name?: unknown },
>(templates: T[]): T[] {
  return [...templates].sort((left, right) => {
    const rightUpdatedAt = toTimestamp(right.updatedAt);
    const leftUpdatedAt = toTimestamp(left.updatedAt);
    if (rightUpdatedAt !== leftUpdatedAt) {
      return rightUpdatedAt - leftUpdatedAt;
    }
    const rightImportedAt = toTimestamp(right.importedAt);
    const leftImportedAt = toTimestamp(left.importedAt);
    if (rightImportedAt !== leftImportedAt) {
      return rightImportedAt - leftImportedAt;
    }
    return String(left.name || "").localeCompare(String(right.name || ""));
  });
}

export function buildTemplateRecencyLabel(template: { updatedAt?: unknown; importedAt?: unknown }, now = Date.now()): string {
  const timestamp = toTimestamp(template?.updatedAt) || toTimestamp(template?.importedAt);
  if (!timestamp) {
    return "";
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const ageDays = Math.floor(Math.max(0, now - timestamp) / dayMs);

  if (ageDays <= 0) {
    return "Edited today";
  }
  if (ageDays === 1) {
    return "Edited yesterday";
  }
  if (ageDays < 7) {
    return `Edited ${ageDays} days ago`;
  }
  return `Edited on ${new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function formatWeekdayLabel(value: unknown): string {
  const weekday = Number(value) || 0;
  const labels = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return labels[weekday] || "Day";
}

function buildTemplateSearchText(template: {
  name?: unknown;
  durationWeeks?: unknown;
  weekdaySlots?: Array<{
    weekday?: unknown;
    title?: unknown;
    notes?: unknown;
    blocks?: Array<{
      label?: unknown;
      duration?: unknown;
      rest?: unknown;
      sets?: unknown;
      exercises?: Array<{
        code?: unknown;
        name?: unknown;
        reps?: unknown;
        notes?: unknown;
        weight?: unknown;
      }>;
    }>;
  }>;
}): string {
  const parts = [
    template.name,
    template.durationWeeks,
    ...(template.weekdaySlots || []).flatMap((slot) => [
      formatWeekdayLabel(slot.weekday),
      slot.title,
      slot.notes,
      ...(slot.blocks || []).flatMap((block) => [
        block.label,
        block.duration,
        block.rest,
        block.sets,
        ...(block.exercises || []).flatMap((exercise) => [
          exercise.code,
          exercise.name,
          exercise.reps,
          exercise.notes,
          exercise.weight,
        ]),
      ]),
    ]),
  ];

  return parts
    .map((value) => String(value || "").toLowerCase())
    .join(" ")
    .replace(/\s+/g, " ");
}

function toTimestamp(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export interface ProgramBasics {
  name: string;
  durationWeeks: string;
}

export interface ProgramBasicsValidation {
  nameError: string;
  durationWeeksError: string;
}

export interface ProgramTrainingDay {
  weekday: string;
  title: string;
  notes: string;
}

export interface ProgramBlockEditor {
  label: string;
  duration: string;
  rest: string;
  sets: string;
}

export interface ProgramDayBlocks {
  blocks: ProgramBlockEditor[];
}

export interface ProgramExerciseEditor {
  code: string;
  name: string;
  reps: string;
  notes: string;
  weight: string;
}

export interface ProgramBlockExercises {
  exercises: ProgramExerciseEditor[];
}

export interface ProgramDayExercises {
  blocks: ProgramBlockExercises[];
}

export function validateProgramBasics(basics: ProgramBasics): ProgramBasicsValidation {
  const name = basics.name.trim();
  const durationWeeks = basics.durationWeeks.trim();

  if (!name) {
    return {
      nameError: "PROGRAM row needs a program name.",
      durationWeeksError: "",
    };
  }

  if (!durationWeeks) {
    return {
      nameError: "",
      durationWeeksError: "PROGRAM row needs a duration in weeks.",
    };
  }

  if (!/^[1-9]\d*$/.test(durationWeeks)) {
    return {
      nameError: "",
      durationWeeksError: "PROGRAM row duration must be a positive integer.",
    };
  }

  return {
    nameError: "",
    durationWeeksError: "",
  };
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
  const formatEmptyBlockError = (day: ProgramPreviewDay | null, block: ProgramPreviewBlock | null): string => {
    const dayLabel = day ? `${day.weekday} ${day.title}`.trim() : "this training day";
    const blockLabel = block?.label ? ` / ${block.label}` : "";
    return `Empty block detected in ${dayLabel}${blockLabel}. Add at least one exercise before saving this program.`;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const columns = lines[index].split(",").map((column) => column.trim());
    const rowType = columns[0]?.toUpperCase();

    if (rowType === "PROGRAM") {
      model.name = overrideName.trim() || columns[1] || model.name;
      model.durationWeeks = columns[2] || "";
      const validation = validateProgramBasics({
        name: model.name,
        durationWeeks: model.durationWeeks,
      });
      if (validation.nameError) {
        return { model: null, error: `Line ${index + 1}: ${validation.nameError}` };
      }
      if (validation.durationWeeksError) {
        return { model: null, error: `Line ${index + 1}: ${validation.durationWeeksError}` };
      }
      continue;
    }

    if (rowType === "TRAINING") {
      if (currentBlock && !currentBlock.exercises.length) {
        return { model: null, error: formatEmptyBlockError(currentDay, currentBlock) };
      }
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
      if (currentBlock && !currentBlock.exercises.length) {
        return { model: null, error: formatEmptyBlockError(currentDay, currentBlock) };
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
    return { model: null, error: "Add a PROGRAM row and at least one training day to preview this program." };
  }

  for (const day of model.days) {
    for (const block of day.blocks) {
      if (!block.exercises.length) {
        return { model: null, error: formatEmptyBlockError(day, block) };
      }
    }
  }

  if (currentBlock && !currentBlock.exercises.length) {
    return { model: null, error: formatEmptyBlockError(currentDay, currentBlock) };
  }

  return { model, error: "" };
}

export function buildStarterProgramText(): string {
  return [
    "PROGRAM,Starter strength phase,4",
    "TRAINING,Tuesday,Strength A,Lower focus and main lift",
    "BLOCK,A,15-20 mins,90-120s,3-4",
    "EXERCISE,A1,Back squat,2x8-10,Heavy,",
    "EXERCISE,A2,Romanian deadlift,8-10,Controlled tempo,",
    "BLOCK,B,10-12 mins,60-90s,2-3",
    "EXERCISE,B1,Bulgarian split squat,8 each leg,,Bodyweight",
    "TRAINING,Friday,Strength B,Upper focus and pull",
    "BLOCK,A,12-15 mins,60-90s,3",
    "EXERCISE,A1,Bench press,3x5,Strong,",
    "EXERCISE,A2,Barbell row,8-10,,",
  ].join("\n");
}

export function readProgramBasics(text: unknown, overrideName = ""): ProgramBasics {
  const phaseColumns = findProgramColumns(text);
  return {
    name: overrideName.trim() || phaseColumns?.[1] || "",
    durationWeeks: phaseColumns?.[2] || "",
  };
}

export function updateProgramBasics(text: unknown, basics: ProgramBasics): string {
  const lines = String(text || "").split("\n");
  const normalizedName = basics.name.trim();
  const normalizedDuration = basics.durationWeeks.trim();
  const phaseRow = `PROGRAM,${normalizedName},${normalizedDuration}`;
  const phaseIndex = lines.findIndex((line) => line.trim().split(",")[0]?.trim().toUpperCase() === "PROGRAM");

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
    .filter((line) => line.split(",")[0]?.trim().toUpperCase() === "TRAINING")
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

export function readProgramDayBlocks(text: unknown): ProgramDayBlocks[] {
  return splitSlotSegmentsFromText(text).map((segment) => ({
    blocks: segment
      .filter(isBlockLine)
      .map((line) => {
        const columns = line.split(",").map((column) => column.trim());
        return {
          label: columns[1] || "",
          duration: columns[2] || "",
          rest: columns[3] || "",
          sets: columns[4] || "",
        };
      }),
  }));
}

export function updateProgramDayBlocks(text: unknown, dayBlocks: ProgramDayBlocks[]): string {
  const lines = String(text || "").split("\n");
  const firstSlotIndex = lines.findIndex(isSlotLine);
  if (firstSlotIndex < 0) {
    return lines.filter((line) => line.length > 0).join("\n");
  }

  const prefix = lines.slice(0, firstSlotIndex);
  const existingSegments = splitSlotSegments(lines.slice(firstSlotIndex));
  const nextSegments = existingSegments.map((segment, dayIndex) => {
    const slotRow = segment[0];
    const blockSegments = splitBlockSegments(segment.slice(1));
    const nextBlocks = dayBlocks[dayIndex]?.blocks || [];
    const nextBlockRows = nextBlocks.map((block, blockIndex) => {
      const existingExercises = blockSegments[blockIndex]?.slice(1) || [];
      return [formatBlockRow(block, blockIndex), ...existingExercises];
    });
    return [slotRow, ...nextBlockRows.flat()];
  });

  return [...prefix, ...nextSegments.flat()].filter((line) => line.length > 0).join("\n");
}

export function readProgramDayExercises(text: unknown): ProgramDayExercises[] {
  return splitSlotSegmentsFromText(text).map((daySegment) => ({
    blocks: splitBlockSegments(daySegment.slice(1)).map((blockSegment) => ({
      exercises: blockSegment
        .filter(isExerciseLine)
        .map((line) => {
          const columns = line.split(",").map((column) => column.trim());
          return {
            code: columns[1] || "",
            name: columns[2] || "",
            reps: columns[3] || "",
            notes: columns[4] || "",
            weight: columns[5] || "",
          };
        }),
    })),
  }));
}

export function updateProgramDayExercises(text: unknown, dayExercises: ProgramDayExercises[]): string {
  const lines = String(text || "").split("\n");
  const firstSlotIndex = lines.findIndex(isSlotLine);
  if (firstSlotIndex < 0) {
    return lines.filter((line) => line.length > 0).join("\n");
  }

  const prefix = lines.slice(0, firstSlotIndex);
  const existingSegments = splitSlotSegments(lines.slice(firstSlotIndex));
  const nextSegments = existingSegments.map((daySegment, dayIndex) => {
    const slotRow = daySegment[0];
    const blockSegments = splitBlockSegments(daySegment.slice(1));
    const nextBlocks = blockSegments.map((blockSegment, blockIndex) => {
      const blockRow = blockSegment[0];
      const nextExercises = dayExercises[dayIndex]?.blocks?.[blockIndex]?.exercises || [];
      return [blockRow, ...nextExercises.map(formatExerciseRow)];
    });
    return [slotRow, ...nextBlocks.flat()];
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

function splitSlotSegmentsFromText(text: unknown): string[][] {
  const lines = String(text || "").split("\n");
  const firstSlotIndex = lines.findIndex(isSlotLine);
  return firstSlotIndex >= 0 ? splitSlotSegments(lines.slice(firstSlotIndex)) : [];
}

function splitBlockSegments(lines: string[]): string[][] {
  const segments: string[][] = [];
  lines.forEach((line) => {
    if (isBlockLine(line) || segments.length === 0) {
      segments.push([line]);
      return;
    }
    segments[segments.length - 1].push(line);
  });
  return segments.filter((segment) => segment.some((line) => isBlockLine(line)));
}

function formatSlotRow(day: ProgramTrainingDay, index: number): string {
  const weekday = day.weekday.trim();
  const title = day.title.trim() || `Strength session ${index + 1}`;
  const notes = day.notes.trim();
  return `TRAINING,${weekday},${title},${notes}`;
}

function isSlotLine(line: string): boolean {
  return line.trim().split(",")[0]?.trim().toUpperCase() === "TRAINING";
}

function formatBlockRow(block: ProgramBlockEditor, index: number): string {
  const label = block.label.trim() || `Block ${index + 1}`;
  return `BLOCK,${label},${block.duration.trim()},${block.rest.trim()},${block.sets.trim()}`;
}

function isBlockLine(line: string): boolean {
  return line.trim().split(",")[0]?.trim().toUpperCase() === "BLOCK";
}

function formatExerciseRow(exercise: ProgramExerciseEditor, index: number): string {
  const code = exercise.code.trim() || `E${index + 1}`;
  const name = exercise.name.trim() || "Exercise";
  return `EXERCISE,${code},${name},${exercise.reps.trim()},${exercise.notes.trim()},${exercise.weight.trim()}`;
}

function isExerciseLine(line: string): boolean {
  return line.trim().split(",")[0]?.trim().toUpperCase() === "EXERCISE";
}

function findProgramColumns(text: unknown): string[] | null {
  const phaseLine = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.split(",")[0]?.trim().toUpperCase() === "PROGRAM");
  return phaseLine ? phaseLine.split(",").map((column) => column.trim()) : null;
}
