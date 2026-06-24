import { WritingArea } from "@/components/journal/WritingArea";
import { getEntry } from "@/lib/entries/get-entry";
import {
  ensureTrailingUserBlock,
  listEntryBlocks,
} from "@/lib/entries/entry-blocks";
import { getWritingPrompt } from "@/lib/mock/writing";
import type { WritingPromptType } from "@/lib/types/writing";
import { notFound } from "next/navigation";

interface SchrijfPageProps {
  searchParams: Promise<{ prompt?: string; id?: string }>;
}

const validPromptTypes = new Set<WritingPromptType>([
  "generic",
  "yesterday",
  "earlier_today",
  "first_entry",
]);

export default async function SchrijfPage({ searchParams }: SchrijfPageProps) {
  const { prompt, id } = await searchParams;

  if (id) {
    const entry = await getEntry(id);

    if (!entry) {
      notFound();
    }

    const blocks = await listEntryBlocks(entry.id);
    const blocksWithTrailing = await ensureTrailingUserBlock(entry.id, blocks);

    return (
      <WritingArea
        hint="Ga verder met schrijven."
        initialBlocks={blocksWithTrailing}
        initialEntryId={entry.id}
      />
    );
  }

  const promptType =
    prompt && validPromptTypes.has(prompt as WritingPromptType)
      ? (prompt as WritingPromptType)
      : "yesterday";

  const { hint } = getWritingPrompt(promptType);

  return <WritingArea hint={hint} />;
}
