import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { generateFollowUpPrompts } from "@/lib/ai/generate-follow-up-prompts";
import { getTodayDateString } from "@/lib/dashboard/reflection-entries";
import { createClient } from "@/lib/supabase/server";

const DAILY_PROMPT_COUNT = 3;

export async function ensureDailyPrompts(
  referenceDate = new Date(),
): Promise<void> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const today = getTodayDateString(referenceDate);

  const { count, error } = await supabase
    .from("reflection_prompts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("prompt_date", today);

  if (error) {
    throw new Error("Vervolgreflecties konden niet worden geladen.");
  }

  if ((count ?? 0) > 0) {
    return;
  }

  const generated = await generateFollowUpPrompts(DAILY_PROMPT_COUNT);

  const rows = generated.map((prompt) => ({
    user_id: user.id,
    topic: prompt.topic.trim(),
    question: prompt.question.trim(),
    prompt_date: today,
    is_bookmarked: false,
  }));

  const { error: insertError } = await supabase
    .from("reflection_prompts")
    .insert(rows);

  if (insertError) {
    throw new Error("Vervolgreflecties konden niet worden opgeslagen.");
  }
}
