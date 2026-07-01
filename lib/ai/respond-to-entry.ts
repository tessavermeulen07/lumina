"use server";

import { revalidatePath } from "next/cache";
import { resolveCoachStyle } from "@/lib/ai/agent-prompt";
import { runLuminaAgent } from "@/lib/ai/agent";
import { mapToolbarLabelToAction } from "@/lib/ai/toolbar-actions";
import { getProfile } from "@/lib/auth/get-profile";
import { buildOnboardingPromptContext } from "@/lib/profile/onboarding-context";
import { buildEntryThreadContext } from "@/lib/entries/entry-thread";
import {
  createEntryWithUserBlock,
  createUserBlock,
  listEntryBlocks,
  saveUserBlock,
} from "@/lib/entries/entry-blocks";
import { saveEntryAiResponse } from "@/lib/entries/save-entry-ai-response";
import type { EntryBlock } from "@/lib/types/entry-blocks";
import { isRichTextEmpty, stripRichTextToPlain } from "@/lib/utils/rich-text";

export async function respondToEntryAction(input: {
  actionLabel: string;
  entryId?: string;
  activeUserBlockId?: string;
  activeUserContent: string;
}): Promise<
  | { entryId: string; blocks: EntryBlock[]; focusBlockId: string }
  | { error: string }
> {
  const action = mapToolbarLabelToAction(input.actionLabel);

  if (!action) {
    return { error: "Deze AI-actie is nog niet beschikbaar." };
  }

  const trimmed = input.activeUserContent.trim();
  const plainContent = stripRichTextToPlain(trimmed);

  if (isRichTextEmpty(trimmed)) {
    return { error: "Schrijf eerst iets voordat je AI gebruikt." };
  }

  const profile = await getProfile();
  let entryId = input.entryId;
  let activeBlockId = input.activeUserBlockId;

  if (!entryId || !activeBlockId) {
    const created = await createEntryWithUserBlock(trimmed);

    if ("error" in created) {
      return { error: created.error };
    }

    entryId = created.entryId;
    activeBlockId = created.block.id;
  } else {
    const saved = await saveUserBlock(entryId, activeBlockId, trimmed);

    if ("error" in saved) {
      return { error: saved.error };
    }
  }

  const existingBlocks = await listEntryBlocks(entryId);
  const activeBlock = existingBlocks.find(
    (block) => block.type === "user" && block.id === activeBlockId,
  );

  if (!activeBlock || activeBlock.type !== "user") {
    return { error: "Actief schrijfblok niet gevonden." };
  }

  const threadContext = buildEntryThreadContext(existingBlocks);
  const onboardingContext = buildOnboardingPromptContext(profile);

  const result = await runLuminaAgent({
    userQuestion: `Help me met: ${input.actionLabel}`,
    entryContent: plainContent,
    entryThreadContext: threadContext,
    entryId,
    userId: profile.id,
    interactionMode: "entry_toolbar",
    coachStyle: resolveCoachStyle(profile.ai_persona_preference),
    onboardingContext,
    actionLabel: input.actionLabel,
    toolbarAction: action,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  const aiSortOrder = activeBlock.sortOrder + 1;
  const newUserSortOrder = activeBlock.sortOrder + 2;

  const savedAi = await saveEntryAiResponse({
    entryId,
    action,
    responseText: result.answer,
    sortOrder: aiSortOrder,
  });

  if ("error" in savedAi) {
    return { error: savedAi.error };
  }

  const newUserBlock = await createUserBlock(entryId, newUserSortOrder, "");

  if ("error" in newUserBlock) {
    return { error: newUserBlock.error };
  }

  revalidatePath("/entries");
  revalidatePath(`/schrijf?id=${entryId}`);

  const blocks = await listEntryBlocks(entryId);

  return {
    entryId,
    blocks,
    focusBlockId: newUserBlock.block.id,
  };
}
