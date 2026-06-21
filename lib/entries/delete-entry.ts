"use server";

import { revalidatePath } from "next/cache";
import { getEntryErrorMessage } from "@/lib/entries/errors";
import { createClient } from "@/lib/supabase/server";

type DeleteEntryResult = { ok: true } | { error: string };

export async function deleteEntry(entryId: string): Promise<DeleteEntryResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Je bent niet ingelogd." };
  }

  const { error } = await supabase.from("entries").delete().eq("id", entryId);

  if (error) {
    return { error: getEntryErrorMessage(error.message) };
  }

  revalidatePath("/entries");
  revalidatePath("/vandaag");

  return { ok: true };
}
