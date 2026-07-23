"use server";

import { revalidatePath } from "next/cache";
import { getEntryErrorMessage } from "@/lib/entries/errors";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { ReflectionPeriod } from "@/types/database";
import type { UserBlock } from "@/types/entry-blocks";

const DRAFT_BLOCK_CONTENT = "<p></p>";

function toUserBlock(row: {
  id: string;
  entry_id: string;
  content: string;
  sort_order: number;
  created_at: string;
}): UserBlock {
  return {
    type: "user",
    id: row.id,
    entryId: row.entry_id,
    content: row.content,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export async function ensureEntryDraft(options?: {
  reflectionPeriod?: ReflectionPeriod;
}): Promise<{ entryId: string; block: UserBlock } | { error: string }> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .insert({
      user_id: user.id,
      content: "",
      reflection_period: options?.reflectionPeriod ?? null,
    })
    .select("id")
    .single();

  if (entryError || !entry) {
    return { error: getEntryErrorMessage(entryError?.message) };
  }

  const { data: block, error: blockError } = await supabase
    .from("entry_user_blocks")
    .insert({
      entry_id: entry.id,
      content: DRAFT_BLOCK_CONTENT,
      sort_order: 0,
    })
    .select("*")
    .single();

  if (blockError || !block) {
    return { error: "Concept kon niet worden aangemaakt." };
  }

  revalidatePath("/geschiedenis");
  revalidatePath("/vandaag");
  revalidatePath(`/schrijf?id=${entry.id}`);

  return { entryId: entry.id, block: toUserBlock(block) };
}
