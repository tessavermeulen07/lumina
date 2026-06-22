import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { HabitAndIntention } from "@/lib/types/database";
import type { Goal } from "@/lib/types/goal";

function toGoal(row: HabitAndIntention): Goal {
  return {
    id: row.id,
    name: row.title,
    frequency: row.frequency,
    description: row.description ?? "",
  };
}

export async function listIntentions(): Promise<Goal[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("habits_and_intentions")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "intention")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Intenties konden niet worden geladen.");
  }

  return (data ?? []).map(toGoal);
}
