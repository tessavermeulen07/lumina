"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { HabitLogStatus } from "@/lib/types/database";

type LogIntentionCheckinInput = {
  habitId: string;
  status: Extract<HabitLogStatus, "completed" | "skipped">;
  aiCheckinPrompt?: string | null;
};

type LogIntentionCheckinResult = { id: string } | { error: string };

export async function logIntentionCheckin(
  input: LogIntentionCheckinInput,
): Promise<LogIntentionCheckinResult> {
  await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("habit_logs")
    .insert({
      habit_id: input.habitId,
      status: input.status,
      ai_checkin_prompt: input.aiCheckinPrompt?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Check-in kon niet worden opgeslagen." };
  }

  revalidatePath("/vandaag");

  return { id: data.id };
}
