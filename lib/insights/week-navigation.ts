import { startOfWeek, toLocalDateString } from "@/lib/data/week-utils";
import { createClient } from "@/lib/supabase/server";

export interface WeekNavigation {
  isCurrentWeek: boolean;
  hasPreviousWeek: boolean;
  hasNextWeek: boolean;
  previousWeekStart: string | null;
  nextWeekStart: string | null;
}

export async function getWeekStartsWithEntries(
  userId: string,
): Promise<string[]> {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("entries")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!entries?.length) {
    return [];
  }

  const weekStarts = new Set<string>();

  for (const entry of entries) {
    const weekStart = startOfWeek(new Date(entry.created_at));
    weekStarts.add(toLocalDateString(weekStart));
  }

  return [...weekStarts].sort((a, b) => b.localeCompare(a));
}

export function resolveWeekNavigation(
  weekStarts: string[],
  selectedWeekStartStr: string,
  currentWeekStartStr: string,
): WeekNavigation {
  const currentIndex = weekStarts.indexOf(selectedWeekStartStr);
  const hasPreviousWeek =
    currentIndex >= 0
      ? currentIndex < weekStarts.length - 1
      : weekStarts.length > 0;
  const previousWeekStart =
    currentIndex >= 0
      ? (weekStarts[currentIndex + 1] ?? null)
      : (weekStarts[0] ?? null);
  const isCurrentWeek = selectedWeekStartStr === currentWeekStartStr;
  let nextWeekStart: string | null = null;

  if (!isCurrentWeek) {
    if (currentIndex > 0) {
      nextWeekStart = weekStarts[currentIndex - 1] ?? null;
    } else if (selectedWeekStartStr < currentWeekStartStr) {
      nextWeekStart = currentWeekStartStr;
    }
  }

  return {
    isCurrentWeek,
    hasPreviousWeek,
    hasNextWeek: !isCurrentWeek,
    previousWeekStart,
    nextWeekStart,
  };
}
