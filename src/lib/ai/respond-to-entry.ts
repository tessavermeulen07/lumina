"use server";

import { resolveCoachStyle } from "@/lib/ai/agent-prompt";
import { runLuminaAgent } from "@/lib/ai/agent";
import { finalizeEntryAiResponse } from "@/lib/ai/finalize-entry-ai-response";
import { prepareEntryAiContext } from "@/lib/ai/prepare-entry-ai-context";
import { getProfile } from "@/lib/auth/get-profile";
import type { ToolbarAiAction } from "@/lib/ai/question-context";
import type { EntryBlock } from "@/types/entry-blocks";

export async function respondToEntryAction(input: {
  actionLabel: string;
  entryId?: string;
  activeUserBlockId?: string;
  activeUserContent: string;
}): Promise<
  | { entryId: string; blocks: EntryBlock[]; focusBlockId: string }
  | { error: string }
> {
  const profile = await getProfile();
  const prepared = await prepareEntryAiContext({
    ...input,
    profile,
  });

  if ("error" in prepared) {
    return prepared;
  }

  const result = await runLuminaAgent(prepared.agentInput);

  if ("error" in result) {
    return { error: result.error };
  }

  return finalizeEntryAiResponse({
    entryId: prepared.entryId,
    activeBlockId: prepared.activeBlockId,
    action: prepared.action,
    responseText: result.answer,
  });
}

export async function finalizeEntryAiStreamAction(input: {
  entryId: string;
  activeBlockId: string;
  action: ToolbarAiAction;
  responseText: string;
}): Promise<
  | { entryId: string; blocks: EntryBlock[]; focusBlockId: string }
  | { error: string }
> {
  await getProfile();

  return finalizeEntryAiResponse(input);
}
