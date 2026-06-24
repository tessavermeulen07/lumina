const DAY_ABBREVS = ["ZO", "MA", "DI", "WO", "DO", "VR", "ZA"] as const;

const MONTH_ABBREVS = [
  "JAN",
  "FEB",
  "MAA",
  "APR",
  "MEI",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OKT",
  "NOV",
  "DEC",
] as const;

export function formatEntryDateCompact(isoDate: string): string {
  const date = new Date(isoDate);
  const dayAbbrev = DAY_ABBREVS[date.getDay()] ?? "MA";
  const dayNumber = date.getDate();
  const monthAbbrev = MONTH_ABBREVS[date.getMonth()] ?? "JAN";
  const time = new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `${dayAbbrev} ${dayNumber} ${monthAbbrev} · ${time}`;
}

export function formatEntryTime(isoDate: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function formatDayLabel(
  dateKey: string,
  referenceDate = new Date(),
): string {
  const date = new Date(`${dateKey}T12:00:00`);
  const yesterday = toLocalDateString(addDays(referenceDate, -1));

  if (dateKey === yesterday) {
    return "Gisteren";
  }

  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
