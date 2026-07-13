import { getNextGoalWindow } from "@/lib/habits/goal-window";
import { createAdminClient } from "@/lib/supabase/admin";
import type { HabitAndIntention } from "@/lib/types/database";
import {
  getDateStringInTimezone,
  resolveTimezone,
} from "@/lib/utils/user-timezone";

type SchedulerStats = {
  processedUsers: number;
  processedIntentions: number;
  createdItems: number;
  duplicatesSkipped: number;
  usersScheduled: number;
};

type QueueInsertRow = {
  user_id: string;
  intention_id: string;
  due_for_date: string;
  status: "pending";
};

type GoalForSchedule = Pick<
  HabitAndIntention,
  "id" | "user_id" | "frequency" | "window_start_date" | "window_end_date"
>;

type UserProfileForSchedule = {
  id: string;
  timezone: string | null;
};

async function loadTimezoneByUserId(
  supabase: ReturnType<typeof createAdminClient>,
  userIds: string[],
): Promise<Map<string, string>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, timezone")
    .in("id", userIds);

  if (error) {
    throw new Error("Profielen konden niet worden geladen voor de scheduler.");
  }

  const timezoneByUserId = new Map<string, string>();
  for (const profile of (profiles ?? []) as UserProfileForSchedule[]) {
    timezoneByUserId.set(profile.id, resolveTimezone(profile.timezone));
  }

  for (const userId of userIds) {
    if (!timezoneByUserId.has(userId)) {
      timezoneByUserId.set(userId, resolveTimezone(null));
    }
  }

  return timezoneByUserId;
}

async function autoSkipExpiredGoalWindows(
  supabase: ReturnType<typeof createAdminClient>,
  goals: GoalForSchedule[],
  timezoneByUserId: Map<string, string>,
  referenceDate: Date,
): Promise<void> {
  for (const goal of goals) {
    const timezone = timezoneByUserId.get(goal.user_id) ?? resolveTimezone(null);
    const localToday = getDateStringInTimezone(timezone, referenceDate);

    if (goal.window_end_date >= localToday) {
      continue;
    }

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

    goal.window_start_date = nextWindow.startDate;
    goal.window_end_date = nextWindow.endDate;
  }
}

export async function scheduleDueCheckinsForToday(
  referenceDate = new Date(),
): Promise<SchedulerStats> {
  const supabase = createAdminClient();

  const { data: habits, error: habitsError } = await supabase
    .from("habits_and_intentions")
    .select("id, user_id, frequency, window_start_date, window_end_date")
    .eq("is_active", true)
    .eq("type", "intention");

  if (habitsError) {
    throw new Error("Doelen konden niet worden geladen voor de scheduler.");
  }

  const typedHabits = (habits ?? []) as GoalForSchedule[];

  if (typedHabits.length === 0) {
    return {
      processedUsers: 0,
      processedIntentions: 0,
      createdItems: 0,
      duplicatesSkipped: 0,
      usersScheduled: 0,
    };
  }

  const uniqueUserIds = [...new Set(typedHabits.map((habit) => habit.user_id))];
  const timezoneByUserId = await loadTimezoneByUserId(supabase, uniqueUserIds);

  await autoSkipExpiredGoalWindows(
    supabase,
    typedHabits,
    timezoneByUserId,
    referenceDate,
  );

  const queueRows: QueueInsertRow[] = [];
  const usersWithQueueRows = new Set<string>();

  for (const habit of typedHabits) {
    const timezone = timezoneByUserId.get(habit.user_id) ?? resolveTimezone(null);
    const localToday = getDateStringInTimezone(timezone, referenceDate);

    if (
      habit.window_start_date > localToday ||
      habit.window_end_date < localToday
    ) {
      continue;
    }

    usersWithQueueRows.add(habit.user_id);
    queueRows.push({
      user_id: habit.user_id,
      intention_id: habit.id,
      due_for_date: localToday,
      status: "pending",
    });
  }

  if (queueRows.length === 0) {
    return {
      processedUsers: uniqueUserIds.length,
      processedIntentions: typedHabits.length,
      createdItems: 0,
      duplicatesSkipped: 0,
      usersScheduled: 0,
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
    processedUsers: uniqueUserIds.length,
    processedIntentions: typedHabits.length,
    createdItems,
    duplicatesSkipped: queueRows.length - createdItems,
    usersScheduled: usersWithQueueRows.size,
  };
}
