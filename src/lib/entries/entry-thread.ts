import type { EntryBlock } from "@/types/entry-blocks";
import { stripRichTextToPlain } from "@/lib/utils/rich-text";

export function buildEntryThreadContext(blocks: EntryBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "user") {
        return `Gebruiker:\n${stripRichTextToPlain(block.content).trim()}`;
      }

      return `Lumina (${block.action}):\n${block.content.trim()}`;
    })
    .filter((segment) => segment.split("\n").slice(1).join("\n").trim())
    .join("\n\n---\n\n");
}
