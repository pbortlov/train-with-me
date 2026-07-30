export interface SprintRestResult {
  seconds: number | null;
  error: string;
}

export function parseSprintRest(value: unknown): SprintRestResult {
  if (typeof value !== "string") {
    return { seconds: null, error: "Enter rest as seconds or m:ss." };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { seconds: null, error: "" };
  }
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return { seconds: Number(trimmed), error: "" };
  }
  const match = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (!match) {
    return { seconds: null, error: "Enter rest as seconds or m:ss, for example 90 or 1:30." };
  }
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  if (seconds > 59) {
    return { seconds: null, error: "Seconds must be 00-59 in m:ss." };
  }
  return { seconds: (minutes * 60) + seconds, error: "" };
}

export function formatSprintRestForInput(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) {
    return "";
  }
  if (!Number.isInteger(seconds)) {
    return String(seconds);
  }
  if (seconds < 60) {
    return String(seconds);
  }
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function formatSprintRest(seconds: number | null | undefined): string {
  const inputValue = formatSprintRestForInput(seconds);
  if (!inputValue) {
    return "";
  }
  return inputValue.includes(":") ? inputValue : `${inputValue} s`;
}
