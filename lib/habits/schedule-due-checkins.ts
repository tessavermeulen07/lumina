import { getTodayDateString } from "@/lib/dashboard/reflection-entries";
import { getNextGoalWindow } from "@/lib/habits/goal-window";
import { createAdminClient } from "@/lib/supabase/admin";
import type { HabitAndIntention } from "@/lib/types/database";

type SchedulerStats = {
  processedUsers: number;
  processedIntentions: number;
  createdItems: number;
  duplicatesSkipped: number;
};

type QueueInsertRow = {
  user_id: string;
  intention_id: string;
  due_for_date: string;
  status: "pending";
};

async function autoSkipExpiredGoalWindows(
  supabase: ReturnType<typeof createAdminClient>,
  today: string,
): Promise<void> {
  const { data: expiredGoals } = await supabase
    .from("habits_and_intentions")
    .select("id, user_id, frequency, window_end_date, is_active")
    .eq("is_active", true)
    .eq("type", "intention")
    .lt("window_end_date", today);

  for (const goal of expiredGoals ?? []) {
    await supabase.from("habit_logs").insert({
      habit_id: goal.id,
      status: "skipped",
      ai_checkin_prompt: "Automatisch overgeslagen (einddatum bereikt).",
    });

    if (goal.frequency === "een-keer") {
      await supabase
        .from("habits_and_intentions")
        .update({ is_active: false })
        .eq("id", goal.id);
      continue;
    }

    const nextWindow = getNextGoalWindow(goal.frequency, goal.window_end_date);
    await supabase
      .from("habits_and_intentions")
      .update({
        window_start_date: nextWindow.startDate,
        window_end_date: nextWindow.endDate,
      })
      .eq("id", goal.id);
  }
}

export async function scheduleDueCheckinsForToday(
  referenceDate = new Date(),
): Promise<SchedulerStats> {
  const supabase = createAdminClient();
  const dueForDate = getTodayDateString(referenceDate);
  await autoSkipExpiredGoalWindows(supabase, dueForDate);

  const { data: habits, error: habitsError } = await supabase
    .from("habits_and_intentions")
    .select("id, user_id, frequency, window_start_date, window_end_date")
    .eq("is_active", true)
    .eq("type", "intention");

  if (habitsError) {
    throw new Error("Doelen konden niet worden geladen voor de scheduler.");
  }

  const typedHabits = (habits ?? []) as Pick<
    HabitAndIntention,
    "id" | "user_id" | "frequency" | "window_start_date" | "window_end_date"
  >[];

  if (typedHabits.length === 0) {
    return {
      processedUsers: 0,
      processedIntentions: 0,
      createdItems: 0,
      duplicatesSkipped: 0,
    };
  }

  const visibleHabits = typedHabits.filter(
    (habit) =>
      habit.window_start_date <= dueForDate && habit.window_end_date >= dueForDate,
  );
  const uniqueUsers = new Set(typedHabits.map((habit) => habit.user_id));
  const queueRows: QueueInsertRow[] = visibleHabits.map((habit) => ({
    user_id: habit.user_id,
    intention_id: habit.id,
    due_for_date: dueForDate,
    status: "pending",
  }));

  if (queueRows.length === 0) {
    return {
      processedUsers: uniqueUsers.size,
      processedIntentions: typedHabits.length,
      createdItems: 0,
      duplicatesSkipped: 0,
    };
  }

  const { data: createdRows, error: queueError } = await supabase
    .from("intention_checkin_queue")
    .upsert(queueRows, {
      onConflict: "user_id,intention_id,due_for_date",
      ignoreDuplicates: true,
    })
    .select("id");

  if (queueError) {
    throw new Error("Queue-items konden niet worden aangemaakt.");
  }

  const createdItems = createdRows?.length ?? 0;

  return {
    processedUsers: uniqueUsers.size,
    processedIntentions: typedHabits.length,
    createdItems,
    duplicatesSkipped: queueRows.length - createdItems,
  };
}
