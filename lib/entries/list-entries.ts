import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { Entry } from "@/lib/types/database";

export type EntryListItem = Pick<Entry, "id" | "content" | "created_at"> & {
  has_ai_responses: boolean;
};

export async function listEntries(limit?: number): Promise<EntryListItem[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  let query = supabase
    .from("entries")
    .select("id, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: entries, error } = await query;

  if (error) {
    throw new Error("Entries konden niet worden geladen.");
  }

  if (!entries?.length) {
    return [];
  }

  const entryIds = entries.map((entry) => entry.id);

  const { data: aiResponses } = await supabase
    .from("entry_ai_responses")
    .select("entry_id")
    .in("entry_id", entryIds);

  const entriesWithAi = new Set(
    (aiResponses ?? []).map((response) => response.entry_id),
  );

  return entries.map((entry) => ({
    ...entry,
    has_ai_responses: entriesWithAi.has(entry.id),
  }));
}
