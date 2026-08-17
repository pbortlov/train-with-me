export interface SprintRestResult {
  seconds: number | null;
  error: string;
}

export function parseSprintRest(value: unknown): SprintRestResult {
  if (typeof value !== "string") {
    return { seconds: null, error: "Enter rest as seconds or m:ss with optional decimals." };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { seconds: null, error: "" };
  }
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return { seconds: Number(trimmed), error: "" };
  }
  const match = trimmed.match(/^(\d+):(\d{1,2}(?:\.\d+)?)$/);
  if (!match) {
    return { seconds: null, error: "Enter rest as seconds or m:ss with optional decimals, for example 90, 1:30, or 1:45.1." };
  }
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  if (seconds >= 60) {
    return { seconds: null, error: "Seconds must be below 60 in m:ss." };
  }
  return { seconds: (minutes * 60) + seconds, error: "" };
}

export function formatSprintRestForInput(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) {
    return "";
  }
  const roundedSeconds = Number(seconds.toFixed(3));
  if (roundedSeconds < 60) {
    return String(roundedSeconds);
  }
  const minutes = Math.floor(roundedSeconds / 60);
  const secondsPart = Number((roundedSeconds - (minutes * 60)).toFixed(3));
  const [wholeSeconds, decimalSeconds] = String(secondsPart).split(".");
  return `${minutes}:${wholeSeconds.padStart(2, "0")}${decimalSeconds ? `.${decimalSeconds}` : ""}`;
}

export function formatSprintRest(seconds: number | null | undefined): string {
  const inputValue = formatSprintRestForInput(seconds);
  if (!inputValue) {
    return "";
  }
  return inputValue.includes(":") ? inputValue : `${inputValue} s`;
}
