import type { WritingPrompt } from "@/lib/types/writing";

const firstEntryPrompt: WritingPrompt = {
  type: "first_entry",
  hint: "Schrijf je eerste entry.",
};

export function getWritingPrompt(): WritingPrompt {
  return firstEntryPrompt;
}
