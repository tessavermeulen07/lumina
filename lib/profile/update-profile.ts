"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { AiCoachStyle } from "@/lib/types/onboarding";

type UpdateProfileInput = {
  username: string;
  aiPersonaPreference: AiCoachStyle | null;
};

type UpdateProfileResult = { ok: true } | { error: string };

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const trimmedUsername = input.username.trim();

  if (!trimmedUsername) {
    return { error: "Vul een naam in." };
  }

  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      username: trimmedUsername,
      ai_persona_preference: input.aiPersonaPreference,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Profiel kon niet worden bijgewerkt." };
  }

  revalidatePath("/vandaag");
  revalidatePath("/instellingen");

  return { ok: true };
}
