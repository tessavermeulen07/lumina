"use server";

import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { AiCoachStyle } from "@/lib/types/onboarding";

type CompleteOnboardingResult = { ok: true } | { error: string };

export async function completeOnboarding(
  coachStyle: AiCoachStyle,
): Promise<CompleteOnboardingResult> {
  const profile = await getProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ ai_persona_preference: coachStyle })
    .eq("id", profile.id);

  if (error) {
    return { error: "Coachvoorkeur kon niet worden opgeslagen." };
  }

  return { ok: true };
}
