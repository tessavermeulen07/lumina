"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

type DeleteIntentionResult = { ok: true } | { error: string };

export async function deleteIntention(
  id: string,
): Promise<DeleteIntentionResult> {
  await getAuthenticatedUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("habits_and_intentions")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return { error: "Intentie kon niet worden verwijderd." };
  }

  revalidatePath("/vandaag");

  return { ok: true };
}
