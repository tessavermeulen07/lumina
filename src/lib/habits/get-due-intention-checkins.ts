import { generateGoalCheckin } from "@/lib/ai/generate-intention-checkin";
import { resolveGoalCategoryLabel } from "@/lib/goals/category-labels";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { isIntentionDue } from "@/lib/habits/get-intention-due-status";
import { listCustomGoalCategories } from "@/lib/habits/list-goal-categories";
import { resolveIntentionPrompt } from "@/lib/habits/intention-prompt-cache";
import { createClient } from "@/lib/supabase/server";
import type { HabitAndIntention, HabitLog } from "@/types/database";
import type { GoalCheckInData } from "@/types/intention-checkin";

function groupLogsByHabitId(logs: HabitLog[]): Map<string, HabitLog[]> {
  const grouped = new Map<string, HabitLog[]>();

  for (const log of logs) {
    const existing = grouped.get(log.habit_id) ?? [];
    existing.push(log);
    grouped.set(log.habit_id, existing);
  }

  return grouped;
}

export async function getDueGoalCheckIns(): Promise<GoalCheckInData[]> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const customCategories = await listCustomGoalCategories();

  const { data: habits, error } = await supabase
    .from("habits_and_intentions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !habits?.length) {
    return [];
  }

  const habitIds = habits.map((habit) => habit.id);

  const { data: logs } = await supabase
    .from("habit_logs")
    .select("*")
    .in("habit_id", habitIds)
    .order("logged_at", { ascending: false });

  const logsByHabit = groupLogsByHabitId((logs ?? []) as HabitLog[]);

  const dueHabits = (habits as HabitAndIntention[]).filter((habit) =>
    isIntentionDue(habit.frequency, logsByHabit.get(habit.id) ?? []),
  );

  return Promise.all(
    dueHabits.map(async (habit) => {
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
        name: habit.title,
        categoryLabel,
        frequency: habit.frequency,
        aiCheckinPrompt,
        href: `/schrijf?doel=${habit.id}`,
      };
    }),
  );
}

/** @deprecated Use getDueGoalCheckIns */
export async function getDueIntentionCheckIns(): Promise<GoalCheckInData[]> {
  return getDueGoalCheckIns();
}

export async function getDueGoalCount(): Promise<number> {
  const checkIns = await getDueGoalCheckIns();
  return checkIns.length;
}

/** @deprecated Use getDueGoalCount */
export async function getDueIntentionCount(): Promise<number> {
  return getDueGoalCount();
}

export async function getGoalWritingContext(
  goalId: string,
): Promise<GoalCheckInData | null> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const customCategories = await listCustomGoalCategories();

  const { data: habit, error } = await supabase
    .from("habits_and_intentions")
    .select("*")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !habit) {
    return null;
  }

  const typedHabit = habit as HabitAndIntention;
  const categoryLabel = resolveGoalCategoryLabel(
    typedHabit.category,
    customCategories,
  );

  const aiCheckinPrompt = await resolveIntentionPrompt(goalId, () =>
    generateGoalCheckin({
      title: typedHabit.title,
      description: typedHabit.description,
      categoryLabel,
    }),
  );

  return {
    id: typedHabit.id,
    name: typedHabit.title,
    categoryLabel,
    frequency: typedHabit.frequency,
    aiCheckinPrompt,
    href: `/schrijf?doel=${goalId}`,
  };
}

/** @deprecated Use getGoalWritingContext */
export async function getIntentionWritingContext(
  goalId: string,
): Promise<GoalCheckInData | null> {
  return getGoalWritingContext(goalId);
}
