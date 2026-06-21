"use server";

import { revalidatePath } from "next/cache";
import { getEntryErrorMessage } from "@/lib/entries/errors";
import { createClient } from "@/lib/supabase/server";

type SaveEntryResult = { id: string } | { error: string };

export async function saveEntry(
  content: string,
  entryId?: string,
): Promise<SaveEntryResult> {
  const trimmed = content.trim();

  if (!trimmed) {
    return { error: "Schrijf iets voordat je opslaat." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Je bent niet ingelogd." };
  }

  if (entryId) {
    const { data, error } = await supabase
      .from("entries")
      .update({ content: trimmed })
      .eq("id", entryId)
      .select("id")
      .single();

    if (error) {
      return { error: getEntryErrorMessage(error.message) };
    }

    revalidatePath("/entries");
    revalidatePath("/vandaag");

    return { id: data.id };
  }

  const { data, error } = await supabase
    .from("entries")
    .insert({ user_id: user.id, content: trimmed })
    .select("id")
    .single();

  if (error) {
    return { error: getEntryErrorMessage(error.message) };
  }

  revalidatePath("/entries");
  revalidatePath("/vandaag");

  return { id: data.id };
}
