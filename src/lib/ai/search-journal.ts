import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export interface JournalSearchResult {
  id: string;
  content: string;
  created_at: string;
}

function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word.length > 2);
}

export async function searchJournalHistory(
  query: string,
  limit = 5,
): Promise<JournalSearchResult[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const { data: ftsResults, error: ftsError } = await supabase
    .from("entries")
    .select("id, content, created_at")
    .eq("user_id", user.id)
    .textSearch("search_vector", trimmed, {
      type: "websearch",
      config: "dutch",
    })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!ftsError && ftsResults?.length) {
    return ftsResults;
  }

  const keywords = extractKeywords(trimmed);
  const searchTerm = keywords[0] ?? trimmed;

  const { data: fallbackResults, error: fallbackError } = await supabase
    .from("entries")
    .select("id, content, created_at")
    .eq("user_id", user.id)
    .ilike("content", `%${searchTerm}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (fallbackError) {
    return [];
  }

  return fallbackResults ?? [];
}
