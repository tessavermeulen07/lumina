"use server";

import { revalidatePath } from "next/cache";
import { getEntryErrorMessage } from "@/lib/entries/errors";
import { createClient } from "@/lib/supabase/server";
import { ENTRY_IMAGES_BUCKET } from "@/lib/utils/entry-images";

type DeleteEntryResult = { ok: true } | { error: string };

export async function deleteEntry(entryId: string): Promise<DeleteEntryResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Je bent niet ingelogd." };
  }

  const { data: entry } = await supabase
    .from("entries")
    .select("id")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!entry) {
    return { error: "Entry niet gevonden." };
  }

  const storagePrefix = `${user.id}/${entryId}`;
  const { data: files } = await supabase.storage
    .from(ENTRY_IMAGES_BUCKET)
    .list(storagePrefix);

  if (files && files.length > 0) {
    const paths = files.map((file) => `${storagePrefix}/${file.name}`);
    await supabase.storage.from(ENTRY_IMAGES_BUCKET).remove(paths);
  }

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) {
    return { error: getEntryErrorMessage(error.message) };
  }

  revalidatePath("/entries");
  revalidatePath("/geschiedenis");
  revalidatePath("/vandaag");

  return { ok: true };
}
