"use server";

import { revalidatePath } from "next/cache";
import { isBuiltinGoalCategory } from "@/lib/goals/category-labels";
import { listCustomGoalCategories } from "@/lib/habits/list-goal-categories";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { GoalFrequency } from "@/lib/types/goal";

type SaveGoalInput = {
  name: string;
  category: string;
  frequency: GoalFrequency;
  description: string;
};

type SaveGoalResult = { id: string } | { error: string };

async function isValidGoalCategory(
  category: string,
  userId: string,
): Promise<boolean> {
  if (isBuiltinGoalCategory(category)) {
    return true;
  }

  const customCategories = await listCustomGoalCategories();
  return customCategories.some(
    (item) => item.id === category && item.user_id === userId,
  );
}

export async function saveGoal(input: SaveGoalInput): Promise<SaveGoalResult> {
  const trimmedName = input.name.trim();

  if (!trimmedName) {
    return { error: "Geef je doel een naam." };
  }

  const user = await getAuthenticatedUser();

  if (!(await isValidGoalCategory(input.category, user.id))) {
    return { error: "Kies een geldige categorie." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("habits_and_intentions")
    .insert({
      user_id: user.id,
      title: trimmedName,
      description: input.description.trim() || null,
      frequency: input.frequency,
      category: input.category,
      type: "intention",
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Doel kon niet worden opgeslagen." };
  }

  revalidatePath("/vandaag");

  return { id: data.id };
}

/** @deprecated Use saveGoal */
export async function saveIntention(
  input: SaveGoalInput,
): Promise<SaveGoalResult> {
  return saveGoal(input);
}
