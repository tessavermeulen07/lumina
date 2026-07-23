"use server";

import { ensureEntryDraft } from "@/lib/entries/ensure-entry-draft";
import {
  createEntryWithUserBlock,
  saveUserBlock,
} from "@/lib/entries/entry-blocks";
import type { ReflectionPeriod } from "@/lib/types/database";

export async function createDraftEntry(
  content: string,
  options?: { reflectionPeriod?: ReflectionPeriod },
) {
  return createEntryWithUserBlock(content, options);
}

export async function saveDraftUserBlock(
  entryId: string,
  blockId: string,
  content: string,
) {
  return saveUserBlock(entryId, blockId, content);
}

export async function ensureDraftEntry(options?: {
  reflectionPeriod?: ReflectionPeriod;
}) {
  return ensureEntryDraft(options);
}
