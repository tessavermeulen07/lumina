export interface UserBlock {
  type: "user";
  id: string;
  entryId: string;
  content: string;
  sortOrder: number;
  createdAt: string;
}

export interface AiBlock {
  type: "ai";
  id: string;
  entryId: string;
  action: string;
  content: string;
  sortOrder: number;
  createdAt: string;
}

export type EntryBlock = UserBlock | AiBlock;

export function createLocalUserBlock(content = ""): UserBlock {
  return {
    type: "user",
    id: crypto.randomUUID(),
    entryId: "",
    content,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
  };
}

export function getActiveUserBlock(blocks: EntryBlock[]): UserBlock | null {
  const userBlocks = blocks.filter(
    (block): block is UserBlock => block.type === "user",
  );

  if (userBlocks.length === 0) {
    return null;
  }

  return userBlocks[userBlocks.length - 1] ?? null;
}

export function hasUserText(blocks: EntryBlock[]): boolean {
  return blocks.some(
    (block) => block.type === "user" && block.content.trim().length > 0,
  );
}
