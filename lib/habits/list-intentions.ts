import { resolveGoalCategoryLabel } from "@/lib/goals/category-labels";
import { getTodayDateString } from "@/lib/dashboard/reflection-entries";
import { listCustomGoalCategories } from "@/lib/habits/list-goal-categories";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { HabitAndIntention } from "@/lib/types/database";
import type { Goal } from "@/lib/types/goal";

function toGoal(
  row: HabitAndIntention,
  customCategories: { id: string; name: string }[],
  queueItemId?: string,
): Goal {
  return {
    id: row.id,
    queueItemId,
    name: row.title,
    category: row.category,
    categoryLabel: resolveGoalCategoryLabel(row.category, customCategories),
    frequency: row.frequency,
    description: row.description ?? "",
    windowStartDate: row.window_start_date,
    windowEndDate: row.window_end_date,
  };
}

export async function listGoals(): Promise<Goal[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const customCategories = await listCustomGoalCategories();
  const today = getTodayDateString();

  const { data, error } = await supabase
    .from("habits_and_intentions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .eq("type", "intention")
    .lte("window_start_date", today)
    .gte("window_end_date", today)
    .order("created_at", { ascending: true });

  const shouldFallback =
    error &&
    (error.code === "42703" ||
      error.message.toLowerCase().includes("window_start_date") ||
      error.message.toLowerCase().includes("window_end_date"));

  if (error && !shouldFallback) {
    throw new Error("Doelen konden niet worden geladen.");
  }

  let rows = data ?? [];
  if (!data && shouldFallback) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("habits_and_intentions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .eq("type", "intention")
      .order("created_at", { ascending: true });

    if (fallbackError) {
      throw new Error("Doelen konden niet worden geladen.");
    }

    rows = fallbackData ?? [];
  }

  const goalRows = rows as HabitAndIntention[];
  const goalIds = goalRows.map((row) => row.id);

  const pendingQueueByGoalId = new Map<string, string>();
  if (goalIds.length > 0) {
    const { data: queueItems } = await supabase
      .from("intention_checkin_queue")
      .select("id, intention_id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .in("intention_id", goalIds)
      .order("due_for_date", { ascending: false })
      .order("created_at", { ascending: false });

    for (const item of queueItems ?? []) {
      if (!pendingQueueByGoalId.has(item.intention_id)) {
        pendingQueueByGoalId.set(item.intention_id, item.id);
      }
    }
  }

  return goalRows.map((row) =>
    toGoal(
      {
        ...row,
        window_start_date: row.window_start_date ?? today,
        window_end_date: row.window_end_date ?? today,
      } as HabitAndIntention,
      customCategories,
      pendingQueueByGoalId.get(row.id),
    ),
  );
}

/** @deprecated Use listGoals */
export async function listIntentions(): Promise<Goal[]> {
  return listGoals();
}
