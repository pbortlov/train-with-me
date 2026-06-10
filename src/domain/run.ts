export interface DurationResult {
  seconds: number | null;
  error: string;
}

export function parseRunDuration(value: unknown): DurationResult {
  if (typeof value !== "string") {
    return { seconds: null, error: "Enter time as mm:ss or hh:mm:ss." };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { seconds: null, error: "" };
  }

  const parts = trimmed.split(":");
  if ((parts.length !== 2 && parts.length !== 3) || parts.some((part) => !/^\d+$/.test(part))) {
    return { seconds: null, error: "Enter time as mm:ss or hh:mm:ss." };
  }

  const numbers = parts.map(Number);
  const [hours, minutes, seconds] = parts.length === 3 ? numbers : [0, numbers[0], numbers[1]];
  if (seconds > 59) {
    return { seconds: null, error: "Seconds must be 00-59." };
  }
  if (parts.length === 2 && minutes > 59) {
    return { seconds: null, error: "Use hh:mm:ss for runs 1 hour or longer, for example 01:05:30." };
  }
  if (parts.length === 3 && minutes > 59) {
    return { seconds: null, error: "Minutes must be 00-59 in hh:mm:ss." };
  }

  return { seconds: (hours * 3600) + (minutes * 60) + seconds, error: "" };
}

export function formatSecondsAsRunDuration(totalSeconds: number): string | null {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return null;
  }

  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function normalizeRunDuration(value: unknown): string {
  const seconds = parseRunDuration(value).seconds;
  return seconds == null ? "" : formatSecondsAsRunDuration(seconds) ?? "";
}

export function normalizeStoredRunDuration(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = normalizeRunDuration(value);
  if (normalized) {
    return normalized;
  }

  const parts = value.trim().split(":");
  if (parts.length === 2 && parts.every((part) => /^\d+$/.test(part))) {
    const [minutes, seconds] = parts.map(Number);
    if (minutes > 59 && seconds <= 59) {
      return formatSecondsAsRunDuration((minutes * 60) + seconds) ?? "";
    }
  }
  return "";
}

export function calculateRunPace(distanceKm: number | null, totalSeconds: number | null): number | null {
  if (distanceKm == null || distanceKm <= 0 || totalSeconds == null || !Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return null;
  }
  return totalSeconds / 60 / distanceKm;
}
