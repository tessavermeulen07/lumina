import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { isEntryUnlockedForUser } from "@/lib/entries/private-entry-access";
import { createClient } from "@/lib/supabase/server";
import type { BookmarkedItem } from "@/types/bookmarks";

const SUMMARY_MAX_LENGTH = 160;

function truncateSummary(text: string): string {
  const trimmed = text.trim();

  if (trimmed.length <= SUMMARY_MAX_LENGTH) {
    return trimmed;
  }

  return `${trimmed.slice(0, SUMMARY_MAX_LENGTH).trimEnd()}…`;
}

export async function getBookmarkedItems(): Promise<BookmarkedItem[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const [entriesResult, promptsResult] = await Promise.all([
    supabase
      .from("entries")
      .select("id, bookmarked_at, is_private")
      .eq("user_id", user.id)
      .eq("is_bookmarked", true)
      .order("bookmarked_at", { ascending: false }),
    supabase
      .from("reflection_prompts")
      .select("id, topic, question, bookmarked_at")
      .eq("user_id", user.id)
      .eq("is_bookmarked", true)
      .order("bookmarked_at", { ascending: false }),
  ]);

  const entries = entriesResult.data ?? [];
  const entryIds = entries.map((entry) => entry.id);

  let analysesByEntry = new Map<string, { title: string; summary: string }>();

  if (entryIds.length > 0) {
    const { data: analyses } = await supabase
      .from("entry_analyses")
      .select("entry_id, title, summary")
      .in("entry_id", entryIds);

    analysesByEntry = new Map(
      (analyses ?? []).map((analysis) => [
        analysis.entry_id,
        { title: analysis.title, summary: analysis.summary },
      ]),
    );
  }

  const unlockChecks = await Promise.all(
    entries.map(async (entry) => ({
      id: entry.id,
      isUnlocked: entry.is_private
        ? await isEntryUnlockedForUser(entry.id, user.id)
        : true,
    })),
  );
  const unlockedById = new Map(
    unlockChecks.map((check) => [check.id, check.isUnlocked]),
  );

  const entryItems: BookmarkedItem[] = entries.map((entry) => {
    const isUnlocked = unlockedById.get(entry.id) ?? true;
    const analysis = analysesByEntry.get(entry.id);
    const isLocked = entry.is_private && !isUnlocked;

    return {
      kind: "entry",
      id: entry.id,
      title: isLocked ? null : (analysis?.title ?? null),
      summary: isLocked
        ? null
        : analysis
          ? truncateSummary(analysis.summary)
          : "Concept — nog niet afgerond",
      bookmarkedAt: entry.bookmarked_at ?? new Date().toISOString(),
      isPrivate: entry.is_private,
      isUnlocked,
    };
  });

  const promptItems: BookmarkedItem[] = (promptsResult.data ?? []).map(
    (prompt) => ({
      kind: "prompt",
      id: prompt.id,
      title: prompt.topic,
      summary: truncateSummary(prompt.question),
      bookmarkedAt: prompt.bookmarked_at ?? new Date().toISOString(),
    }),
  );

  return [...entryItems, ...promptItems].sort(
    (a, b) =>
      new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime(),
  );
}
