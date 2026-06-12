export type WritingPromptType =
  | "generic"
  | "yesterday"
  | "earlier_today"
  | "first_entry";

export interface WritingPrompt {
  type: WritingPromptType;
  hint: string;
}
