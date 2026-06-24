"use server";

import { revalidatePath } from "next/cache";
import { resolveCoachStyle } from "@/lib/ai/agent-prompt";
import { runLuminaAgent } from "@/lib/ai/agent";
import { getProfile } from "@/lib/auth/get-profile";
import { buildOnboardingPromptContext } from "@/lib/profile/onboarding-context";

export async function askLumina(
  question: string,
): Promise<{ answer: string } | { error: string }> {
  const trimmed = question.trim();

  if (!trimmed) {
    return { error: "Stel eerst een vraag." };
  }

  const profile = await getProfile();
  const onboardingContext = buildOnboardingPromptContext(profile);
  const result = await runLuminaAgent({
    userQuestion: trimmed,
    userId: profile.id,
    interactionMode: "dashboard",
    coachStyle: resolveCoachStyle(profile.ai_persona_preference),
    onboardingContext,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath("/vandaag");

  return { answer: result.answer };
}
