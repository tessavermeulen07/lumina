import type { EntryBlock } from "@/lib/types/entry-blocks";

export function buildEntryThreadContext(blocks: EntryBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "user") {
        return `Gebruiker:\n${block.content.trim()}`;
      }

      return `Lumina (${block.action}):\n${block.content.trim()}`;
    })
    .filter((segment) => segment.split("\n").slice(1).join("\n").trim())
    .join("\n\n---\n\n");
}
