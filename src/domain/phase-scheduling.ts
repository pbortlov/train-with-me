export interface PhaseSlotDayShift {
  phaseSlotId: string;
  fromWeekIndex: number;
  dayDelta: number;
  createdAt: number;
}

export interface PhaseLifecycleStatus {
  code: "on-track" | "shifted" | "finished-on-time" | "finished-late";
  label: string;
}

function normalizeDate(value: unknown): string {
  if (typeof value !== "string" || !value) {
    return "";
  }
  const date = parseDateValue(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  date.setHours(0, 0, 0, 0);
  return formatDate(date);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateValue(dateValue: string | Date): Date {
  if (dateValue instanceof Date) {
    return new Date(dateValue);
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(dateValue);
}

function addDays(dateValue: string | Date, days: number): Date {
  const date = parseDateValue(dateValue);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

function signedDaysBetween(startDate: string, endDate: string): number | null {
  const start = parseDateValue(startDate);
  const end = parseDateValue(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export function getProgramWeekday(value: Date | string): number {
  const date = parseDateValue(value);
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

export function buildPhaseSlotId(slotWeekday: number, slotIndex: number, slotId = ""): string {
  return slotId || `${slotWeekday}-${slotIndex}`;
}

export function normalizePhaseSlotDayShifts(value: unknown): PhaseSlotDayShift[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      const candidate: Record<string, unknown> = typeof item === "object" && item ? item as Record<string, unknown> : {};
      const phaseSlotId = typeof candidate.phaseSlotId === "string" ? candidate.phaseSlotId : "";
      const fromWeekIndex = Number.isFinite(Number(candidate.fromWeekIndex)) ? Number(candidate.fromWeekIndex) : NaN;
      const hasDayDelta = Number.isFinite(Number(candidate.dayDelta));
      const hasWeekDelta = Number.isFinite(Number(candidate.weekDelta));
      const dayDelta = hasDayDelta ? Number(candidate.dayDelta) : hasWeekDelta ? Number(candidate.weekDelta) * 7 : NaN;
      const createdAt = Number.isFinite(Number(candidate.createdAt)) ? Number(candidate.createdAt) : Date.now();
      if (!phaseSlotId || !Number.isInteger(fromWeekIndex) || !Number.isInteger(dayDelta) || dayDelta === 0) {
        return null;
      }
      return {
        phaseSlotId,
        fromWeekIndex,
        dayDelta,
        createdAt,
      };
    })
    .filter((item): item is PhaseSlotDayShift => Boolean(item))
    .sort((left, right) => {
      if (left.fromWeekIndex !== right.fromWeekIndex) {
        return left.fromWeekIndex - right.fromWeekIndex;
      }
      return left.createdAt - right.createdAt;
    });
}

export function getAnchoredPhaseOccurrenceDate(startDate: string, slotWeekday: number, phaseWeekIndex: number): string {
  const normalizedStartDate = parseDateValue(startDate);
  normalizedStartDate.setHours(0, 0, 0, 0);
  const startWeekday = getProgramWeekday(normalizedStartDate);
  const anchoredWeekStart = addDays(normalizedStartDate, phaseWeekIndex * 7);
  const slotOffset = ((slotWeekday - startWeekday) + 7) % 7;
  return formatDate(addDays(anchoredWeekStart, slotOffset));
}

export function getCumulativeSlotDayDelta(
  phaseSlotId: string,
  phaseWeekIndex: number,
  slotDayShifts: PhaseSlotDayShift[],
): number {
  return slotDayShifts.reduce((sum, rule) => {
    if (rule.phaseSlotId !== phaseSlotId || phaseWeekIndex < rule.fromWeekIndex) {
      return sum;
    }
    return sum + rule.dayDelta;
  }, 0);
}

export function getPhaseOccurrenceSchedule(input: {
  startDate: string;
  slotWeekday: number;
  phaseSlotId: string;
  phaseWeekIndex: number;
  slotDayShifts?: PhaseSlotDayShift[];
}): {
  generatedDate: string;
  effectiveDate: string;
  dayDelta: number;
} {
  const generatedDate = getAnchoredPhaseOccurrenceDate(input.startDate, input.slotWeekday, input.phaseWeekIndex);
  const dayDelta = getCumulativeSlotDayDelta(
    input.phaseSlotId,
    input.phaseWeekIndex,
    normalizePhaseSlotDayShifts(input.slotDayShifts || []),
  );
  return {
    generatedDate,
    effectiveDate: formatDate(addDays(generatedDate, dayDelta)),
    dayDelta,
  };
}

export function getDateShiftDelta(fromDate: string, toDate: string): number | null {
  const normalizedFromDate = normalizeDate(fromDate);
  const normalizedToDate = normalizeDate(toDate);
  if (!normalizedFromDate || !normalizedToDate) {
    return null;
  }
  return signedDaysBetween(normalizedFromDate, normalizedToDate);
}

export function getProgramWeekIndexForDate(startDate: string, sessionDate: string): number | null {
  const normalizedStartDate = normalizeDate(startDate);
  const normalizedSessionDate = normalizeDate(sessionDate);
  if (!normalizedStartDate || !normalizedSessionDate) {
    return null;
  }
  const dayDelta = signedDaysBetween(normalizedStartDate, normalizedSessionDate);
  if (dayDelta === null) {
    return null;
  }
  return Math.max(0, Math.floor(dayDelta / 7));
}

export function getPlannedPhaseEndDate(startDate: string, durationWeeks: number): string {
  const normalizedStartDate = normalizeDate(startDate);
  if (!normalizedStartDate) {
    return "";
  }
  const normalizedDurationWeeks = Math.max(1, Number(durationWeeks) || 1);
  return formatDate(addDays(normalizedStartDate, (normalizedDurationWeeks * 7) - 1));
}

export function getExpectedPhaseEndDate(
  startDate: string,
  durationWeeks: number,
  scheduledDates: string[],
): string {
  const plannedEndDate = getPlannedPhaseEndDate(startDate, durationWeeks);
  const latestScheduledDate = (scheduledDates || [])
    .map((date) => normalizeDate(date))
    .filter(Boolean)
    .sort()
    .at(-1) || "";
  if (!plannedEndDate) {
    return latestScheduledDate;
  }
  if (!latestScheduledDate) {
    return plannedEndDate;
  }
  return latestScheduledDate > plannedEndDate ? latestScheduledDate : plannedEndDate;
}

export function getCompletedPhaseFinishDate(sessions: Array<{ date?: string; status?: string }>): string {
  if (!Array.isArray(sessions) || !sessions.length) {
    return "";
  }
  const closedStatuses = new Set(["completed", "modified", "missed"]);
  if (sessions.some((session) => !closedStatuses.has(String(session?.status || "")))) {
    return "";
  }
  return sessions
    .map((session) => normalizeDate(session?.date))
    .filter(Boolean)
    .sort()
    .at(-1) || "";
}

export function getPhaseLifecycleStatus(input: {
  plannedEndDate: string;
  expectedFinishDate: string;
  actualFinishDate?: string;
}): PhaseLifecycleStatus {
  const plannedEndDate = normalizeDate(input.plannedEndDate);
  const expectedFinishDate = normalizeDate(input.expectedFinishDate);
  const actualFinishDate = normalizeDate(input.actualFinishDate || "");

  if (actualFinishDate) {
    if (plannedEndDate && actualFinishDate <= plannedEndDate) {
      return { code: "finished-on-time", label: "Finished on time" };
    }
    return { code: "finished-late", label: "Finished late" };
  }

  if (plannedEndDate && expectedFinishDate && expectedFinishDate > plannedEndDate) {
    return { code: "shifted", label: "Shifted" };
  }

  return { code: "on-track", label: "On track" };
}
