"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import {
  countBookmarkedPrompts,
  MAX_BOOKMARKS,
} from "@/lib/dashboard/get-carousel-prompts";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

export async function toggleBookmarkPrompt(
  promptId: string,
): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data: prompt, error: fetchError } = await supabase
    .from("reflection_prompts")
    .select("is_bookmarked")
    .eq("id", promptId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !prompt) {
    return { error: "Reflectievraag niet gevonden." };
  }

  const willBookmark = !prompt.is_bookmarked;

  if (willBookmark) {
    const bookmarkCount = await countBookmarkedPrompts();
    if (bookmarkCount >= MAX_BOOKMARKS) {
      return {
        error: `Je kunt maximaal ${MAX_BOOKMARKS} reflecties bewaren.`,
      };
    }
  }

  const { error: updateError } = await supabase
    .from("reflection_prompts")
    .update({
      is_bookmarked: willBookmark,
      bookmarked_at: willBookmark ? new Date().toISOString() : null,
    })
    .eq("id", promptId)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: "Bookmark kon niet worden bijgewerkt." };
  }

  revalidatePath("/vandaag");
  revalidatePath("/bewaard");
  return { success: true };
}

export async function linkPromptToEntry(
  promptId: string,
  entryId: string,
): Promise<void> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  await supabase
    .from("reflection_prompts")
    .update({ entry_id: entryId })
    .eq("id", promptId)
    .eq("user_id", user.id)
    .is("entry_id", null);
}
