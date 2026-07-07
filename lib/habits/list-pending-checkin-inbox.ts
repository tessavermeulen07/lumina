import { generateGoalCheckin } from "@/lib/ai/generate-intention-checkin";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { resolveGoalCategoryLabel } from "@/lib/goals/category-labels";
import { resolveIntentionPrompt } from "@/lib/habits/intention-prompt-cache";
import { listCustomGoalCategories } from "@/lib/habits/list-goal-categories";
import { createClient } from "@/lib/supabase/server";
import type { HabitAndIntention, IntentionCheckinQueueItem } from "@/lib/types/database";
import type { GoalCheckInData } from "@/lib/types/intention-checkin";

export async function listPendingCheckinInbox(): Promise<GoalCheckInData[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const customCategories = await listCustomGoalCategories();

  const { data: queueItems, error: queueError } = await supabase
    .from("intention_checkin_queue")
    .select("id, intention_id, due_for_date")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("due_for_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (queueError || !queueItems?.length) {
    return [];
  }

  const typedQueueItems = queueItems as Pick<
    IntentionCheckinQueueItem,
    "id" | "intention_id" | "due_for_date"
  >[];
  const intentionIds = typedQueueItems.map((item) => item.intention_id);

  const { data: habits, error: habitsError } = await supabase
    .from("habits_and_intentions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .in("id", intentionIds);

  if (habitsError || !habits?.length) {
    return [];
  }

  const habitById = new Map(
    (habits as HabitAndIntention[]).map((habit) => [habit.id, habit]),
  );

  const inboxItems = await Promise.all(
    typedQueueItems.map(async (queueItem) => {
      const habit = habitById.get(queueItem.intention_id);
      if (!habit) {
        return null;
      }

      const categoryLabel = resolveGoalCategoryLabel(
        habit.category,
        customCategories,
      );

      const aiCheckinPrompt = await resolveIntentionPrompt(habit.id, () =>
        generateGoalCheckin({
          title: habit.title,
          description: habit.description,
          categoryLabel,
        }),
      );

      return {
        id: habit.id,
        queueItemId: queueItem.id,
        name: habit.title,
        categoryLabel,
        frequency: habit.frequency,
        aiCheckinPrompt,
        href: `/schrijf?doel=${habit.id}`,
      } satisfies GoalCheckInData;
    }),
  );

  return inboxItems.filter((item) => item !== null);
}
