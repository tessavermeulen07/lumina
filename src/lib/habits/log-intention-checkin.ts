"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { getNextGoalWindow } from "@/lib/habits/goal-window";
import { createClient } from "@/lib/supabase/server";
import type { HabitAndIntention, HabitLogStatus } from "@/types/database";

type LogIntentionCheckinInput = {
  habitId: string;
  queueItemId?: string;
  status: Extract<HabitLogStatus, "completed" | "skipped">;
  aiCheckinPrompt?: string | null;
};

type LogIntentionCheckinResult = { id: string } | { error: string };

export async function logIntentionCheckin(
  input: LogIntentionCheckinInput,
): Promise<LogIntentionCheckinResult> {
  const user = await getAuthenticatedUser();
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

  const { data: habit } = await supabase
    .from("habits_and_intentions")
    .select("id, user_id, frequency, window_end_date, is_active")
    .eq("id", input.habitId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (habit) {
    const typedHabit = habit as Pick<
      HabitAndIntention,
      "id" | "frequency" | "window_end_date" | "is_active"
    >;

    if (typedHabit.is_active) {
      if (typedHabit.frequency === "een-keer") {
        await supabase
          .from("habits_and_intentions")
          .update({ is_active: false })
          .eq("id", typedHabit.id);
      } else {
        const nextWindow = getNextGoalWindow(
          typedHabit.frequency,
          typedHabit.window_end_date,
        );
        await supabase
          .from("habits_and_intentions")
          .update({
            window_start_date: nextWindow.startDate,
            window_end_date: nextWindow.endDate,
          })
          .eq("id", typedHabit.id);
      }
    }
  }

  if (input.queueItemId) {
    const { error: queueError } = await supabase
      .from("intention_checkin_queue")
      .update({
        status: input.status,
        processed_at: new Date().toISOString(),
      })
      .eq("id", input.queueItemId)
      .eq("user_id", user.id)
      .eq("intention_id", input.habitId);

    if (queueError) {
      return { error: "Check-in is opgeslagen, maar inbox kon niet worden bijgewerkt." };
    }
  } else {
    const { data: pendingItem } = await supabase
      .from("intention_checkin_queue")
      .select("id")
      .eq("user_id", user.id)
      .eq("intention_id", input.habitId)
      .eq("status", "pending")
      .order("due_for_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingItem) {
      await supabase
        .from("intention_checkin_queue")
        .update({
          status: input.status,
          processed_at: new Date().toISOString(),
        })
        .eq("id", pendingItem.id);
    }
  }

  revalidatePath("/vandaag");

  return { id: data.id };
}
