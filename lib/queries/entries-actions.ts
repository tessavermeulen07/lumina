"use server";

import { getBookmarkedItems } from "@/lib/bookmarks/get-bookmarked-items";
import { getEntryWithMeta } from "@/lib/entries/finalize-entry";

export async function fetchEntryWithMeta(entryId: string) {
  return getEntryWithMeta(entryId);
}

export async function fetchBookmarkedItems() {
  return getBookmarkedItems();
}
