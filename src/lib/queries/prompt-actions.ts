"use server";

import { toggleBookmarkPrompt } from "@/lib/dashboard/reflection-prompt-actions";

export async function togglePromptBookmark(promptId: string) {
  return toggleBookmarkPrompt(promptId);
}
