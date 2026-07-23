"use server";

import { listGoals } from "@/lib/habits/list-intentions";
import { listGoalCategoryOptions } from "@/lib/habits/list-goal-categories";

export async function fetchGoals() {
  return listGoals();
}

export async function fetchGoalCategoryOptions() {
  return listGoalCategoryOptions();
}
