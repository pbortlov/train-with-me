export const LOG_ACTIVITIES = ["strength", "run", "sprint"] as const;

export type LogActivity = (typeof LOG_ACTIVITIES)[number];

export type DateShortcut = "today" | "yesterday";

export function normalizeLogActivity(
  value: unknown,
  fallback: LogActivity = "strength",
): LogActivity {
  return LOG_ACTIVITIES.includes(value as LogActivity)
    ? (value as LogActivity)
    : fallback;
}

export function resolveDateShortcut(
  shortcut: DateShortcut,
  todayIsoDate: string,
): string {
  if (shortcut === "today") {
    return todayIsoDate;
  }

  const date = new Date(`${todayIsoDate}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
