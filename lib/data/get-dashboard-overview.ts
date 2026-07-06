import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import {
  calculateStreak,
  countWords,
  getWeekDays,
  toLocalDateString,
} from "@/lib/data/week-utils";
import { createClient } from "@/lib/supabase/server";
import { stripRichTextToPlain } from "@/lib/utils/rich-text";
import type { DashboardOverviewData } from "@/lib/types/dashboard";

export async function getDashboardOverview(
  referenceDate = new Date(),
): Promise<DashboardOverviewData> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data: entries, error } = await supabase
    .from("entries")
    .select("content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Dashboard kon niet worden geladen.");
  }

  const entryDates = new Set<string>();
  let wordCount = 0;

  for (const entry of entries ?? []) {
    entryDates.add(toLocalDateString(new Date(entry.created_at)));
    wordCount += countWords(stripRichTextToPlain(entry.content));
  }

  return {
    weekDays: getWeekDays(entryDates, referenceDate),
    stats: {
      streak: calculateStreak(entryDates, referenceDate),
      entryCount: entries?.length ?? 0,
      wordCount,
    },
  };
}
