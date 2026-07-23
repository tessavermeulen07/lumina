import type { GoalFrequency } from "@/types/goal";

export interface GoalCheckInData {
  id: string;
  queueItemId?: string;
  name: string;
  categoryLabel: string;
  frequency: GoalFrequency;
  aiCheckinPrompt: string;
  href: string;
}

/** @deprecated Use GoalCheckInData */
export type IntentionCheckInData = GoalCheckInData;
