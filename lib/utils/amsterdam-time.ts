const AMSTERDAM_TIMEZONE = "Europe/Amsterdam";

function getParts(referenceDate: Date) {
  const formatter = new Intl.DateTimeFormat("nl-NL", {
    timeZone: AMSTERDAM_TIMEZONE,
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

export function getAmsterdamDateString(referenceDate = new Date()): string {
  const parts = getParts(referenceDate);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function hasPassedAmsterdamTime(
  targetTime: string | null | undefined,
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
  const parts = getParts(referenceDate);
  const nowMinutes = parts.hour * 60 + parts.minute;
  return nowMinutes >= targetMinutes;
}
