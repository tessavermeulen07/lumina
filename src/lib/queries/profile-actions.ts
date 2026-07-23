"use server";

import { completeOnboarding } from "@/lib/profile/complete-onboarding";
import { updateProfile } from "@/lib/profile/update-profile";
import type { OnboardingAnswers } from "@/types/onboarding";

export async function saveProfile(
  input: Parameters<typeof updateProfile>[0],
) {
  return updateProfile(input);
}

export async function finishOnboarding(
  answers: OnboardingAnswers,
  timezone?: string,
) {
  return completeOnboarding(answers, timezone);
}
