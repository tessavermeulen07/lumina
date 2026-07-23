import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { AiInsight } from "@/types/database";

export async function getRecentInsights(limit = 3): Promise<AiInsight[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("user_id", user.id)
    .order("date_to", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return data ?? [];
}
