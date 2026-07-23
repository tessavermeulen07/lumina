import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { AiInsightPatterns } from "@/types/database";
import { toLocalDateString } from "@/lib/data/week-utils";

export interface SaveInsightInput {
  insightText: string;
  patternsDetected?: AiInsightPatterns | null;
  dateFrom?: string;
  dateTo?: string;
}

export async function saveAiInsight(
  input: SaveInsightInput,
): Promise<{ id: string } | { error: string }> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const today = toLocalDateString(new Date());

  const { data, error } = await supabase
    .from("ai_insights")
    .insert({
      user_id: user.id,
      insight_text: input.insightText,
      patterns_detected: input.patternsDetected ?? null,
      date_from: input.dateFrom ?? today,
      date_to: input.dateTo ?? today,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Inzicht kon niet worden opgeslagen." };
  }

  return { id: data.id };
}
