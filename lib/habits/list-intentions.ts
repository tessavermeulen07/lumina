import { resolveGoalCategoryLabel } from "@/lib/goals/category-labels";
import { listCustomGoalCategories } from "@/lib/habits/list-goal-categories";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { HabitAndIntention } from "@/lib/types/database";
import type { Goal } from "@/lib/types/goal";

function toGoal(
  row: HabitAndIntention,
  customCategories: { id: string; name: string }[],
): Goal {
  return {
    id: row.id,
    name: row.title,
    category: row.category,
    categoryLabel: resolveGoalCategoryLabel(row.category, customCategories),
    frequency: row.frequency,
    description: row.description ?? "",
  };
}

export async function listGoals(): Promise<Goal[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const customCategories = await listCustomGoalCategories();

  const { data, error } = await supabase
    .from("habits_and_intentions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Doelen konden niet worden geladen.");
  }

  return (data ?? []).map((row) =>
    toGoal(row as HabitAndIntention, customCategories),
  );
}

/** @deprecated Use listGoals */
export async function listIntentions(): Promise<Goal[]> {
  return listGoals();
}
