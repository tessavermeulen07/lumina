import type { GoalFrequency } from "@/lib/types/goal";

export interface GoalCheckInData {
  id: string;
  name: string;
  categoryLabel: string;
  frequency: GoalFrequency;
  aiCheckinPrompt: string;
  href: string;
}

/** @deprecated Use GoalCheckInData */
export type IntentionCheckInData = GoalCheckInData;
