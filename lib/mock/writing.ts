import type { WritingPrompt, WritingPromptType } from "@/lib/types/writing";

const writingPrompts: Record<WritingPromptType, WritingPrompt> = {
  generic: {
    type: "generic",
    hint: "Waar denk je vandaag aan?",
  },
  yesterday: {
    type: "yesterday",
    hint:
      "Gisteren schreef je over je wandeling in het park. Wat brengt dat vandaag bij je op?",
  },
  earlier_today: {
    type: "earlier_today",
    hint:
      "Vanmorgen noemde je dat je je rustig voelde. Wat is er sindsdien veranderd?",
  },
  first_entry: {
    type: "first_entry",
    hint: "Schrijf je eerste entry.",
  },
};

export function getWritingPrompt(
  type: WritingPromptType = "yesterday",
): WritingPrompt {
  return writingPrompts[type];
}
