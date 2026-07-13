export const DEFAULT_TIMEZONE = "Europe/Amsterdam";

export const COMMON_TIMEZONE_OPTIONS = [
  { value: "Europe/Amsterdam", label: "Nederland (Amsterdam)" },
  { value: "Europe/Brussels", label: "België (Brussel)" },
  { value: "Europe/Berlin", label: "Duitsland (Berlijn)" },
  { value: "Europe/London", label: "Verenigd Koninkrijk (Londen)" },
  { value: "Europe/Paris", label: "Frankrijk (Parijs)" },
  { value: "America/New_York", label: "Verenigde Staten (New York)" },
  { value: "America/Los_Angeles", label: "Verenigde Staten (Los Angeles)" },
  { value: "Asia/Tokyo", label: "Japan (Tokyo)" },
] as const;

function getParts(timezone: string, referenceDate: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: resolveTimezone(timezone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(referenceDate);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

export function resolveTimezone(value: string | null | undefined): string {
  if (!value || value.trim().length === 0) {
    return DEFAULT_TIMEZONE;
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return value;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

export function getDateStringInTimezone(
  timezone: string,
  referenceDate = new Date(),
): string {
  const parts = getParts(timezone, referenceDate);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function hasPassedTimeInTimezone(
  targetTime: string | null | undefined,
  timezone: string,
  referenceDate = new Date(),
): boolean {
  if (!targetTime) {
    return false;
  }

  const [hoursStr = "0", minutesStr = "0"] = targetTime.split(":");
  const parsedHours = Number(hoursStr);
  const parsedMinutes = Number(minutesStr);

  if (Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes)) {
    return false;
  }

  const targetMinutes = parsedHours * 60 + parsedMinutes;
  const parts = getParts(timezone, referenceDate);
  const nowMinutes = parts.hour * 60 + parts.minute;
  return nowMinutes >= targetMinutes;
}

export function getLocalHourInTimezone(
  timezone: string,
  referenceDate = new Date(),
): number {
  return getParts(timezone, referenceDate).hour;
}

export function detectBrowserTimezone(): string {
  try {
    return resolveTimezone(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  } catch {
    return DEFAULT_TIMEZONE;
  }
}
