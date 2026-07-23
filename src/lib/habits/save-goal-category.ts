"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

type SaveGoalCategoryResult = { id: string; name: string } | { error: string };

export async function saveGoalCategory(
  name: string,
): Promise<SaveGoalCategoryResult> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { error: "Geef je categorie een naam." };
  }

  if (trimmedName.length > 100) {
    return { error: "De categorienaam is te lang." };
  }

  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("goal_categories")
    .insert({
      user_id: user.id,
      name: trimmedName,
    })
    .select("id, name")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Je hebt al een categorie met deze naam." };
    }

    return { error: "Categorie kon niet worden opgeslagen." };
  }

  revalidatePath("/vandaag");

  return { id: data.id, name: data.name };
}
