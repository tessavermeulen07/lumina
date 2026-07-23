export type OnboardingMainGoal =
  | "mental-health"
  | "gratitude"
  | "patterns-triggers"
  | "life-events"
  | "self-expression"
  | "personal-growth";

export type OnboardingPriority =
  | "creativity"
  | "relationships"
  | "balance-goals"
  | "work-career"
  | "personal-development"
  | "health-wellbeing";

export type JournalExperience = "first-time" | "some" | "experienced";

export type AiCoachStyle = "empathetic" | "direct";

export interface OnboardingAnswers {
  mainGoal: OnboardingMainGoal | null;
  priorities: OnboardingPriority[];
  experience: JournalExperience | null;
  coachStyle: AiCoachStyle | null;
}

export interface OnboardingOption<T extends string = string> {
  id: T;
  label: string;
  description?: string;
}
