import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { HabitAndIntention } from "@/lib/types/database";

export async function getHabitById(
  habitId: string,
): Promise<HabitAndIntention | null> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("habits_and_intentions")
    .select("*")
    .eq("id", habitId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as HabitAndIntention;
}
