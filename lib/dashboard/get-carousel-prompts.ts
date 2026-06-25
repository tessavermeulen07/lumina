import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { getTodayDateString } from "@/lib/dashboard/reflection-entries";
import { createClient } from "@/lib/supabase/server";
import type { FollowUpPromptCardData } from "@/lib/types/dashboard-reflection";
import type { ReflectionPrompt } from "@/lib/types/database";

const MAX_BOOKMARKS = 15;

function toCardData(row: ReflectionPrompt): FollowUpPromptCardData {
  return {
    id: row.id,
    topic: row.topic,
    question: row.question,
    isBookmarked: row.is_bookmarked,
  };
}

export async function getCarouselPrompts(
  referenceDate = new Date(),
): Promise<FollowUpPromptCardData[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const today = getTodayDateString(referenceDate);

  const { data, error } = await supabase
    .from("reflection_prompts")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Vervolgreflecties konden niet worden geladen.");
  }

  const visible = (data ?? []).filter(
    (row) =>
      row.is_bookmarked ||
      (row.prompt_date === today && row.entry_id === null),
  ) as ReflectionPrompt[];

  visible.sort((a, b) => {
    if (a.is_bookmarked !== b.is_bookmarked) {
      return a.is_bookmarked ? -1 : 1;
    }
    if (a.is_bookmarked && b.is_bookmarked) {
      const aTime = a.bookmarked_at ? new Date(a.bookmarked_at).getTime() : 0;
      const bTime = b.bookmarked_at ? new Date(b.bookmarked_at).getTime() : 0;
      return bTime - aTime;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return visible.map((row) => toCardData(row));
}

export async function getReflectionPromptById(
  promptId: string,
): Promise<ReflectionPrompt | null> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reflection_prompts")
    .select("*")
    .eq("id", promptId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as ReflectionPrompt;
}

export async function countBookmarkedPrompts(): Promise<number> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { count } = await supabase
    .from("reflection_prompts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_bookmarked", true);

  return count ?? 0;
}

export { MAX_BOOKMARKS };
