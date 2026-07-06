"use server";

import { revalidatePath } from "next/cache";
import {
  analyzeEntry,
  toEntryAnalysisRow,
} from "@/lib/ai/analyze-entry";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import {
  createEntryWithUserBlock,
  listEntryBlocks,
  saveUserBlock,
  syncEntryContent,
} from "@/lib/entries/entry-blocks";
import { createClient } from "@/lib/supabase/server";
import { linkPromptToEntry } from "@/lib/dashboard/reflection-prompt-actions";
import { clearReflectionCacheForToday } from "@/lib/dashboard/reflection-cache";
import { isEntryUnlockedForUser } from "@/lib/entries/private-entry-access";
import type { EntryAnalysis, ReflectionPeriod } from "@/lib/types/database";
import type { EntryBlock } from "@/lib/types/entry-blocks";

export async function finalizeEntry(input: {
  entryId?: string;
  blocks: EntryBlock[];
  reflectionPeriod?: ReflectionPeriod;
  reflectionPromptId?: string;
}): Promise<{ analysis: EntryAnalysis } | { error: string }> {
  await getAuthenticatedUser();
  let entryId = input.entryId;

  const userBlocks = input.blocks.filter((b) => b.type === "user");

  if (!userBlocks.some((b) => b.content.trim())) {
    return { error: "Schrijf iets voordat je opslaat." };
  }

  if (!entryId) {
    const firstContent = userBlocks.find((b) => b.content.trim())?.content ?? "";

    const created = await createEntryWithUserBlock(firstContent, {
      reflectionPeriod: input.reflectionPeriod,
    });

    if ("error" in created) {
      return { error: created.error };
    }

    entryId = created.entryId;
  }

  for (const block of userBlocks) {
    if (!block.content.trim()) continue;

    const result = await saveUserBlock(entryId, block.id, block.content);

    if ("error" in result) {
      return { error: result.error };
    }
  }

  await syncEntryContent(entryId);

  if (input.reflectionPeriod && input.entryId) {
    const supabaseForPeriod = await createClient();
    await supabaseForPeriod
      .from("entries")
      .update({ reflection_period: input.reflectionPeriod })
      .eq("id", entryId);
  }

  const analysisResult = await analyzeEntry(entryId);

  if ("error" in analysisResult) {
    return { error: analysisResult.error };
  }

  const supabase = await createClient();
  const row = toEntryAnalysisRow(entryId, analysisResult);

  const { data, error } = await supabase
    .from("entry_analyses")
    .upsert(row, { onConflict: "entry_id" })
    .select("*")
    .single();

  if (error || !data) {
    return { error: "Analyse kon niet worden opgeslagen." };
  }

  if (analysisResult.emotion_scores) {
    const dominant = Object.entries(analysisResult.emotion_scores).sort(
      (a, b) => (b[1] ?? 0) - (a[1] ?? 0),
    )[0]?.[0];

    if (dominant) {
      await supabase.from("emotion_analyses").upsert(
        {
          entry_id: entryId,
          scores: analysisResult.emotion_scores,
          dominant_emotion: dominant,
        },
        { onConflict: "entry_id" },
      );
    }
  }

  if (input.reflectionPromptId) {
    await linkPromptToEntry(input.reflectionPromptId, entryId);
  }

  if (input.reflectionPeriod) {
    await clearReflectionCacheForToday();
  }

  revalidatePath("/vandaag");
  revalidatePath("/geschiedenis");
  revalidatePath("/inzichten");
  revalidatePath("/bewaard");

  return { analysis: data as EntryAnalysis };
}

export async function getEntryAnalysis(
  entryId: string,
): Promise<EntryAnalysis | null> {
  await getAuthenticatedUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("entry_analyses")
    .select("*")
    .eq("entry_id", entryId)
    .single();

  return data as EntryAnalysis | null;
}

export async function getEntryWithMeta(
  entryId: string,
  options?: { ownerBypass?: boolean },
) {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const [entryResult, blocks, analysis] = await Promise.all([
    supabase.from("entries").select("*").eq("id", entryId).single(),
    listEntryBlocks(entryId),
    getEntryAnalysis(entryId),
  ]);

  if (entryResult.error || !entryResult.data) {
    return null;
  }

  const entry = entryResult.data;

  if (entry.user_id !== user.id) {
    return null;
  }

  if (
    entry.is_private &&
    !options?.ownerBypass &&
    !(await isEntryUnlockedForUser(entryId, user.id))
  ) {
    return null;
  }

  return {
    entry,
    blocks,
    analysis,
  };
}
