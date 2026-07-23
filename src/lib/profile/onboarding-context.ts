import {
  experienceOptions,
  mainGoalOptions,
  priorityOptions,
} from "@/lib/constants/onboarding";
import type { Profile } from "@/types/database";
import type {
  JournalExperience,
  OnboardingMainGoal,
  OnboardingPriority,
} from "@/types/onboarding";

function labelForMainGoal(id: OnboardingMainGoal): string {
  return mainGoalOptions.find((option) => option.id === id)?.label ?? id;
}

function labelForPriority(id: OnboardingPriority): string {
  return priorityOptions.find((option) => option.id === id)?.label ?? id;
}

function labelForExperience(id: JournalExperience): string {
  return experienceOptions.find((option) => option.id === id)?.label ?? id;
}

export function isOnboardingComplete(
  profile: Pick<Profile, "onboarding_completed_at">,
): boolean {
  return profile.onboarding_completed_at != null;
}

export function buildOnboardingPromptContext(
  profile: Pick<
    Profile,
    | "onboarding_main_goal"
    | "onboarding_priorities"
    | "onboarding_experience"
  >,
): string | undefined {
  const lines: string[] = [];

  if (profile.onboarding_main_goal) {
    lines.push(`Hoofddoel: ${labelForMainGoal(profile.onboarding_main_goal)}`);
  }

  if (profile.onboarding_priorities.length > 0) {
    const priorityLabels = profile.onboarding_priorities.map(labelForPriority);
    lines.push(`Prioriteiten: ${priorityLabels.join(", ")}`);
  }

  if (profile.onboarding_experience) {
    lines.push(
      `Journalervaring: ${labelForExperience(profile.onboarding_experience)}`,
    );
  }

  if (lines.length === 0) {
    return undefined;
  }

  return `GEBRUIKERSCONTEXT (onboarding):\n${lines.join("\n")}`;
}
