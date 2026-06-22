import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { startOfWeek, toLocalDateString } from "@/lib/data/week-utils";
import { formatDayLabel } from "@/lib/insights/history-format";
import { createClient } from "@/lib/supabase/server";
import type { EntryAnalysis } from "@/lib/types/database";
import type {
  HistoryDayGroup,
  HistoryEntryItem,
  HistoryWeekData,
} from "@/lib/types/history";

export type {
  HistoryDayGroup,
  HistoryEntryItem,
  HistoryWeekData,
} from "@/lib/types/history";

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const startFormatter = new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
  });
  const endFormatter = new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startPart = startFormatter.format(weekStart);
  const endPart = endFormatter.format(weekEnd);

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${weekStart.getDate()} – ${endPart}`;
  }

  return `${startPart} – ${endPart}`;
}

async function getWeekStartsWithEntries(userId: string): Promise<string[]> {
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

export async function getHistoryByWeek(
  weekStartParam?: string,
): Promise<HistoryWeekData> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const now = new Date();
  const currentWeekStart = startOfWeek(now);
  const currentWeekStartStr = toLocalDateString(currentWeekStart);

  const weekStarts = await getWeekStartsWithEntries(user.id);
  const selectedWeekStart = weekStartParam
    ? startOfWeek(new Date(`${weekStartParam}T12:00:00`))
    : currentWeekStart;
  const selectedWeekStartStr = toLocalDateString(selectedWeekStart);
  const weekEnd = addDays(selectedWeekStart, 6);
  weekEnd.setHours(23, 59, 59, 999);

  const { data: entries } = await supabase
    .from("entries")
    .select("id, created_at")
    .eq("user_id", user.id)
    .gte("created_at", selectedWeekStart.toISOString())
    .lte("created_at", weekEnd.toISOString())
    .order("created_at", { ascending: false });

  const entryIds = (entries ?? []).map((entry) => entry.id);

  let analysesByEntry = new Map<string, EntryAnalysis>();

  if (entryIds.length > 0) {
    const { data: analyses } = await supabase
      .from("entry_analyses")
      .select("*")
      .in("entry_id", entryIds);

    analysesByEntry = new Map(
      (analyses ?? []).map((analysis) => [
        analysis.entry_id,
        analysis as EntryAnalysis,
      ]),
    );
  }

  const grouped = new Map<string, HistoryEntryItem[]>();

  for (const entry of entries ?? []) {
    const dateKey = toLocalDateString(new Date(entry.created_at));
    const item: HistoryEntryItem = {
      id: entry.id,
      created_at: entry.created_at,
      analysis: analysesByEntry.get(entry.id) ?? null,
    };

    const existing = grouped.get(dateKey) ?? [];
    existing.push(item);
    grouped.set(dateKey, existing);
  }

  const dayGroups: HistoryDayGroup[] = [...grouped.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, dayEntries]) => ({
      dateKey,
      label: formatDayLabel(dateKey, now),
      entries: dayEntries.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    }));

  const currentIndex = weekStarts.indexOf(selectedWeekStartStr);
  const hasPreviousWeek =
    currentIndex >= 0 ? currentIndex < weekStarts.length - 1 : weekStarts.length > 0;
  const previousWeekStart =
    currentIndex >= 0 ? (weekStarts[currentIndex + 1] ?? null) : weekStarts[0] ?? null;
  const nextWeekStart =
    currentIndex > 0 ? (weekStarts[currentIndex - 1] ?? null) : null;
  const isCurrentWeek = selectedWeekStartStr === currentWeekStartStr;

  return {
    weekStart: selectedWeekStartStr,
    weekEnd: toLocalDateString(weekEnd),
    weekLabel: formatWeekRange(selectedWeekStart),
    isCurrentWeek,
    hasPreviousWeek,
    hasNextWeek: !isCurrentWeek && nextWeekStart !== null,
    previousWeekStart,
    nextWeekStart,
    dayGroups,
  };
}

export async function getAdjacentWeekStart(
  currentWeekStart: string,
  direction: "prev" | "next",
): Promise<string | null> {
  const user = await getAuthenticatedUser();
  const weekStarts = await getWeekStartsWithEntries(user.id);
  const currentIndex = weekStarts.indexOf(currentWeekStart);

  if (currentIndex === -1) {
    return direction === "prev" ? weekStarts[0] ?? null : null;
  }

  if (direction === "prev") {
    return weekStarts[currentIndex + 1] ?? null;
  }

  return weekStarts[currentIndex - 1] ?? null;
}
