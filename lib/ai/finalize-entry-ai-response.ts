import { revalidatePath } from "next/cache";
import {
  createUserBlock,
  listEntryBlocks,
} from "@/lib/entries/entry-blocks";
import { saveEntryAiResponse } from "@/lib/entries/save-entry-ai-response";
import type { EntryBlock } from "@/lib/types/entry-blocks";
import type { ToolbarAiAction } from "@/lib/ai/question-context";

export async function finalizeEntryAiResponse(input: {
  entryId: string;
  activeBlockId: string;
  action: ToolbarAiAction;
  responseText: string;
}): Promise<
  | { entryId: string; blocks: EntryBlock[]; focusBlockId: string }
  | { error: string }
> {
  const existingBlocks = await listEntryBlocks(input.entryId);
  const activeBlock = existingBlocks.find(
    (block) => block.type === "user" && block.id === input.activeBlockId,
  );

  if (!activeBlock || activeBlock.type !== "user") {
    return { error: "Actief schrijfblok niet gevonden." };
  }

  const aiSortOrder = activeBlock.sortOrder + 1;
  const newUserSortOrder = activeBlock.sortOrder + 2;

  const savedAi = await saveEntryAiResponse({
    entryId: input.entryId,
    action: input.action,
    responseText: input.responseText,
    sortOrder: aiSortOrder,
  });

  if ("error" in savedAi) {
    return { error: savedAi.error };
  }

  const newUserBlock = await createUserBlock(
    input.entryId,
    newUserSortOrder,
    "",
  );

  if ("error" in newUserBlock) {
    return { error: newUserBlock.error };
  }

  revalidatePath("/entries");
  revalidatePath(`/schrijf?id=${input.entryId}`);

  const blocks = await listEntryBlocks(input.entryId);

  return {
    entryId: input.entryId,
    blocks,
    focusBlockId: newUserBlock.block.id,
  };
}
