import type { GoalCategory } from "@/lib/types/database";
import type { GoalCategoryOption } from "@/lib/types/goal";
import { builtinGoalCategories } from "@/lib/goals/category-labels";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export async function listCustomGoalCategories(): Promise<GoalCategory[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("goal_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("goal_categories laden mislukt:", error.message);
    return [];
  }

  return (data ?? []) as GoalCategory[];
}

export async function listGoalCategoryOptions(): Promise<GoalCategoryOption[]> {
  const customCategories = await listCustomGoalCategories();

  return [
    ...builtinGoalCategories.map((category) => ({
      value: category.value,
      label: category.label,
      isCustom: false,
    })),
    ...customCategories.map((category) => ({
      value: category.id,
      label: category.name,
      isCustom: true,
    })),
  ];
}
