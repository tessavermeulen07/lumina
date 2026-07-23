import { resolveCoachStyle } from "@/lib/ai/agent-prompt";
import type { AgentInput } from "@/lib/ai/agent";
import { mapToolbarLabelToAction } from "@/lib/ai/toolbar-actions";
import { buildOnboardingPromptContext } from "@/lib/profile/onboarding-context";
import { buildEntryThreadContext } from "@/lib/entries/entry-thread";
import {
  createEntryWithUserBlock,
  listEntryBlocks,
  saveUserBlock,
} from "@/lib/entries/entry-blocks";
import type { Profile } from "@/lib/types/database";
import { isRichTextEmpty, stripRichTextToPlain } from "@/lib/utils/rich-text";

export interface PreparedEntryAiContext {
  agentInput: AgentInput;
  entryId: string;
  activeBlockId: string;
  action: NonNullable<ReturnType<typeof mapToolbarLabelToAction>>;
}

export async function prepareEntryAiContext(input: {
  actionLabel: string;
  entryId?: string;
  activeUserBlockId?: string;
  activeUserContent: string;
  profile: Profile;
}): Promise<PreparedEntryAiContext | { error: string }> {
  const action = mapToolbarLabelToAction(input.actionLabel);

  if (!action) {
    return { error: "Deze AI-actie is nog niet beschikbaar." };
  }

  const trimmed = input.activeUserContent.trim();
  const plainContent = stripRichTextToPlain(trimmed);

  if (isRichTextEmpty(trimmed)) {
    return { error: "Schrijf eerst iets voordat je AI gebruikt." };
  }

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
  const onboardingContext = buildOnboardingPromptContext(input.profile);

  return {
    agentInput: {
      userQuestion: `Help me met: ${input.actionLabel}`,
      entryContent: plainContent,
      entryThreadContext: threadContext,
      entryId,
      userId: input.profile.id,
      interactionMode: "entry_toolbar",
      coachStyle: resolveCoachStyle(input.profile.ai_persona_preference),
      onboardingContext,
      actionLabel: input.actionLabel,
      toolbarAction: action,
    },
    entryId,
    activeBlockId,
    action,
  };
}
