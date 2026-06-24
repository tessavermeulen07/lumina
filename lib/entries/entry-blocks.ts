"use server";

import { revalidatePath } from "next/cache";
import { getEntryErrorMessage } from "@/lib/entries/errors";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type {
  EntryAiResponse,
  EntryUserBlock,
} from "@/lib/types/database";
import type { AiBlock, EntryBlock, UserBlock } from "@/lib/types/entry-blocks";

function toUserBlock(row: EntryUserBlock): UserBlock {
  return {
    type: "user",
    id: row.id,
    entryId: row.entry_id,
    content: row.content,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function toAiBlock(row: EntryAiResponse): AiBlock {
  return {
    type: "ai",
    id: row.id,
    entryId: row.entry_id,
    action: row.action,
    content: row.response_text,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export async function syncEntryContent(entryId: string): Promise<void> {
  const supabase = await createClient();

  const { data: userBlocks } = await supabase
    .from("entry_user_blocks")
    .select("content")
    .eq("entry_id", entryId)
    .order("sort_order", { ascending: true });

  const content =
    userBlocks
      ?.map((block) => block.content.trim())
      .filter(Boolean)
      .join("\n\n") ?? "";

  await supabase.from("entries").update({ content }).eq("id", entryId);
}

export async function listEntryBlocks(entryId: string): Promise<EntryBlock[]> {
  await getAuthenticatedUser();
  const supabase = await createClient();

  const [userResult, aiResult] = await Promise.all([
    supabase
      .from("entry_user_blocks")
      .select("*")
      .eq("entry_id", entryId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("entry_ai_responses")
      .select("*")
      .eq("entry_id", entryId)
      .order("sort_order", { ascending: true }),
  ]);

  const merged: EntryBlock[] = [
    ...(userResult.data ?? []).map(toUserBlock),
    ...(aiResult.data ?? []).map(toAiBlock),
  ];

  merged.sort((a, b) => a.sortOrder - b.sortOrder);

  return merged;
}

export async function createEntryWithUserBlock(
  content: string,
): Promise<{ entryId: string; block: UserBlock } | { error: string }> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const trimmed = content.trim();

  if (!trimmed) {
    return { error: "Schrijf iets voordat je opslaat." };
  }

  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .insert({ user_id: user.id, content: trimmed })
    .select("id")
    .single();

  if (entryError || !entry) {
    return { error: getEntryErrorMessage(entryError?.message) };
  }

  const { data: block, error: blockError } = await supabase
    .from("entry_user_blocks")
    .insert({
      entry_id: entry.id,
      content: trimmed,
      sort_order: 0,
    })
    .select("*")
    .single();

  if (blockError || !block) {
    return { error: "Entry kon niet worden opgeslagen." };
  }

  revalidatePath("/geschiedenis");
  revalidatePath("/vandaag");

  return { entryId: entry.id, block: toUserBlock(block) };
}

export async function createUserBlock(
  entryId: string,
  sortOrder: number,
  content = "",
): Promise<{ block: UserBlock } | { error: string }> {
  await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("entry_user_blocks")
    .insert({
      entry_id: entryId,
      content,
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { error: "Schrijfblok kon niet worden aangemaakt." };
  }

  await syncEntryContent(entryId);

  return { block: toUserBlock(data) };
}

export async function saveUserBlock(
  entryId: string,
  blockId: string,
  content: string,
): Promise<{ block: UserBlock } | { error: string }> {
  await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("entry_user_blocks")
    .update({ content })
    .eq("id", blockId)
    .eq("entry_id", entryId)
    .select("*")
    .single();

  if (error || !data) {
    return { error: "Tekst kon niet worden opgeslagen." };
  }

  await syncEntryContent(entryId);

  revalidatePath("/geschiedenis");
  revalidatePath("/vandaag");
  revalidatePath(`/schrijf?id=${entryId}`);

  return { block: toUserBlock(data) };
}

export async function ensureTrailingUserBlock(
  entryId: string,
  blocks: EntryBlock[],
): Promise<EntryBlock[]> {
  if (blocks.length === 0) {
    const created = await createUserBlock(entryId, 0, "");

    if ("error" in created) {
      return blocks;
    }

    return [created.block];
  }

  const lastBlock = blocks[blocks.length - 1];

  if (lastBlock?.type === "ai") {
    const created = await createUserBlock(
      entryId,
      lastBlock.sortOrder + 1,
      "",
    );

    if ("error" in created) {
      return blocks;
    }

    return [...blocks, created.block];
  }

  return blocks;
}
