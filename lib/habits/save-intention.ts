"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { GoalFrequency } from "@/lib/types/goal";

type SaveIntentionInput = {
  name: string;
  frequency: GoalFrequency;
  description: string;
};

type SaveIntentionResult = { id: string } | { error: string };

export async function saveIntention(
  input: SaveIntentionInput,
): Promise<SaveIntentionResult> {
  const trimmedName = input.name.trim();

  if (!trimmedName) {
    return { error: "Geef je intentie een naam." };
  }

  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("habits_and_intentions")
    .insert({
      user_id: user.id,
      title: trimmedName,
      description: input.description.trim() || null,
      frequency: input.frequency,
      type: "intention",
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Intentie kon niet worden opgeslagen." };
  }

  revalidatePath("/vandaag");

  return { id: data.id };
}
