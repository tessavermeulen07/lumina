"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

type CompleteOnboardingResult = { ok: true } | { error: string };

function validateAnswers(answers: OnboardingAnswers): string | null {
  if (!answers.mainGoal) {
    return "Kies een hoofddoel.";
  }

  if (answers.priorities.length === 0) {
    return "Kies minimaal één prioriteit.";
  }

  if (!answers.experience) {
    return "Kies je journalervaring.";
  }

  if (!answers.coachStyle) {
    return "Kies een AI-coach.";
  }

  return null;
}

export async function completeOnboarding(
  answers: OnboardingAnswers,
): Promise<CompleteOnboardingResult> {
  const validationError = validateAnswers(answers);

  if (validationError) {
    return { error: validationError };
  }

  const profile = await getProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      ai_persona_preference: answers.coachStyle,
      onboarding_main_goal: answers.mainGoal,
      onboarding_priorities: answers.priorities,
      onboarding_experience: answers.experience,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (error) {
    return { error: "Onboarding kon niet worden opgeslagen." };
  }

  revalidatePath("/vandaag");
  revalidatePath("/instellingen");
  revalidatePath("/schrijf");
  revalidatePath("/onboarding");

  return { ok: true };
}
