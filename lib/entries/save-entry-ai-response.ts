"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { EntryAiResponse } from "@/lib/types/database";

type SaveEntryAiResponseInput = {
  entryId: string;
  action: string;
  responseText: string;
  sortOrder: number;
};

type SaveEntryAiResponseResult =
  | { response: EntryAiResponse }
  | { error: string };

export async function saveEntryAiResponse(
  input: SaveEntryAiResponseInput,
): Promise<SaveEntryAiResponseResult> {
  const trimmed = input.responseText.trim();

  if (!trimmed) {
    return { error: "Leeg AI-antwoord kan niet worden opgeslagen." };
  }

  await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("entry_ai_responses")
    .insert({
      entry_id: input.entryId,
      action: input.action,
      response_text: trimmed,
      sort_order: input.sortOrder,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { error: "AI-antwoord kon niet worden opgeslagen." };
  }

  revalidatePath("/entries");
  revalidatePath(`/schrijf?id=${input.entryId}`);

  return { response: data };
}
