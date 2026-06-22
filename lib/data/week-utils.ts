import type { WeekDay } from "@/lib/types/dashboard";

const dayLabels = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getWeekDays(
  entryDates: Set<string>,
  referenceDate = new Date(),
): WeekDay[] {
  const today = toLocalDateString(referenceDate);
  const monday = startOfWeek(referenceDate);

  return dayLabels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateStr = toLocalDateString(date);

    return {
      label,
      date: dateStr,
      hasEntry: entryDates.has(dateStr),
      isToday: dateStr === today,
    };
  });
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function calculateStreak(
  entryDates: Set<string>,
  referenceDate = new Date(),
): number {
  let streak = 0;
  const cursor = new Date(referenceDate);
  cursor.setHours(0, 0, 0, 0);

  const todayStr = toLocalDateString(cursor);
  if (!entryDates.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (entryDates.has(toLocalDateString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
