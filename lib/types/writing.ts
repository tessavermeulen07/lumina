export type WritingPromptType = "generic" | "yesterday" | "earlier_today";

export interface WritingPrompt {
  type: WritingPromptType;
  hint: string;
}
