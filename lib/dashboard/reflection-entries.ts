import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { toLocalDateString } from "@/lib/data/week-utils";
import { createClient } from "@/lib/supabase/server";
import type { ReflectionPeriod } from "@/lib/types/database";
import type { EntryWithAnalysis } from "@/lib/types/dashboard-reflection";

export function getTodayDateString(referenceDate = new Date()): string {
  return toLocalDateString(referenceDate);
}

export function getYesterdayDateString(referenceDate = new Date()): string {
  const yesterday = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  return toLocalDateString(yesterday);
}

export function truncateText(text: string, maxLength = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function getFinalizedEntriesWithAnalyses(
  limit = 10,
): Promise<EntryWithAnalysis[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data: entries, error } = await supabase
    .from("entries")
    .select("id, content, created_at, reflection_period")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit * 2);

  if (error || !entries?.length) {
    return [];
  }

  const entryIds = entries.map((entry) => entry.id);

  const { data: analyses } = await supabase
    .from("entry_analyses")
    .select("*")
    .in("entry_id", entryIds);

  const analysisByEntryId = new Map(
    (analyses ?? []).map((analysis) => [analysis.entry_id, analysis]),
  );

  return entries
    .filter((entry) => analysisByEntryId.has(entry.id))
    .slice(0, limit)
    .map((entry) => ({
      id: entry.id,
      content: entry.content,
      created_at: entry.created_at,
      reflection_period: entry.reflection_period as ReflectionPeriod | null,
      analysis: analysisByEntryId.get(entry.id) ?? null,
    }));
}

export function entryMatchesDate(
  createdAt: string,
  dateStr: string,
): boolean {
  return toLocalDateString(new Date(createdAt)) === dateStr;
}

export async function getTodayFinalizedEntries(
  referenceDate = new Date(),
): Promise<EntryWithAnalysis[]> {
  const today = getTodayDateString(referenceDate);
  const entries = await getFinalizedEntriesWithAnalyses(20);

  return entries
    .filter((entry) => entryMatchesDate(entry.created_at, today))
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
}
