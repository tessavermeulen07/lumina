export type BookmarkedEntryItem = {
  kind: "entry";
  id: string;
  title: string | null;
  summary: string | null;
  bookmarkedAt: string;
  isPrivate: boolean;
  isUnlocked: boolean;
};

export type BookmarkedPromptItem = {
  kind: "prompt";
  id: string;
  title: string;
  summary: string;
  bookmarkedAt: string;
};

export type BookmarkedItem = BookmarkedEntryItem | BookmarkedPromptItem;
