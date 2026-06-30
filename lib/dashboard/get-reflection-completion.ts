import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { ReflectionPeriod } from "@/lib/types/database";
import {
  entryMatchesDate,
  getFinalizedEntriesWithAnalyses,
  getTodayDateString,
} from "@/lib/dashboard/reflection-entries";

export interface ReflectionCompletion {
  ochtend: boolean;
  avond: boolean;
}

export async function getReflectionCompletion(
  referenceDate = new Date(),
): Promise<ReflectionCompletion> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const today = getTodayDateString(referenceDate);

  const { data: entries } = await supabase
    .from("entries")
    .select("id, created_at, reflection_period")
    .eq("user_id", user.id)
    .in("reflection_period", ["ochtend", "avond"])
    .order("created_at", { ascending: false });

  if (!entries?.length) {
    return { ochtend: false, avond: false };
  }

  const todayEntries = entries.filter((entry) =>
    entryMatchesDate(entry.created_at, today),
  );

  if (!todayEntries.length) {
    return { ochtend: false, avond: false };
  }

  const entryIds = todayEntries.map((entry) => entry.id);

  const { data: analyses } = await supabase
    .from("entry_analyses")
    .select("entry_id")
    .in("entry_id", entryIds);

  const finalizedIds = new Set((analyses ?? []).map((row) => row.entry_id));

  const completion: ReflectionCompletion = { ochtend: false, avond: false };

  for (const entry of todayEntries) {
    if (!finalizedIds.has(entry.id)) continue;

    const period = entry.reflection_period as ReflectionPeriod | null;
    if (period === "ochtend") completion.ochtend = true;
    if (period === "avond") completion.avond = true;
  }

  return completion;
}

export async function hasAnyFinalizedEntries(): Promise<boolean> {
  const entries = await getFinalizedEntriesWithAnalyses(1);
  return entries.length > 0;
}
