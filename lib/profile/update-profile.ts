"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { AiCoachStyle } from "@/lib/types/onboarding";

type UpdateProfileInput = {
  username: string;
  aiPersonaPreference: AiCoachStyle | null;
  goalsCheckinTime: string;
  morningReflectionTime: string;
  eveningReflectionTime: string;
};

type UpdateProfileResult = { ok: true } | { error: string };

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const trimmedUsername = input.username.trim();

  if (!trimmedUsername) {
    return { error: "Vul een naam in." };
  }

  if (!input.goalsCheckinTime || !input.morningReflectionTime || !input.eveningReflectionTime) {
    return { error: "Vul alle herinneringstijden in." };
  }

  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const payload = {
    username: trimmedUsername,
    ai_persona_preference: input.aiPersonaPreference,
    goals_checkin_time: input.goalsCheckinTime,
    morning_reflection_time: input.morningReflectionTime,
    evening_reflection_time: input.eveningReflectionTime,
  };

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) {
    const missingColumns =
      error.code === "42703" ||
      error.message.toLowerCase().includes("goals_checkin_time") ||
      error.message.toLowerCase().includes("morning_reflection_time") ||
      error.message.toLowerCase().includes("evening_reflection_time");

    if (!missingColumns) {
      return { error: "Profiel kon niet worden bijgewerkt." };
    }

    // Fallback for environments where popup-time migration is not applied yet.
    const { error: fallbackError } = await supabase
      .from("profiles")
      .update({
        username: trimmedUsername,
        ai_persona_preference: input.aiPersonaPreference,
      })
      .eq("id", user.id);

    if (fallbackError) {
      return { error: "Profiel kon niet worden bijgewerkt." };
    }

    return {
      error:
        "Je profiel is deels opgeslagen. Draai nog de migratie voor herinneringstijden om deze tijden op te slaan.",
    };
  }

  revalidatePath("/vandaag");
  revalidatePath("/instellingen");

  return { ok: true };
}
