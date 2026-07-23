"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { respondToEntryAction } from "@/lib/ai/respond-to-entry";
import { deleteIntention } from "@/lib/habits/delete-intention";
import { logIntentionCheckin } from "@/lib/habits/log-intention-checkin";
import { saveGoal } from "@/lib/habits/save-intention";
import { saveGoalCategory } from "@/lib/habits/save-goal-category";
import {
  fetchGoalCategoryOptions,
  fetchGoals,
} from "@/lib/queries/goals-actions";
import { queryKeys } from "@/lib/queries/keys";
import { hasMutationError, invalidateAppData } from "@/lib/queries/utils";
import type { Goal } from "@/types/goal";

type SaveGoalInput = Parameters<typeof saveGoal>[0];
type LogGoalCheckinInput = Parameters<typeof logIntentionCheckin>[0];

export function useGoals() {
  return useQuery({
    queryKey: queryKeys.goals.list(),
    queryFn: () => fetchGoals(),
  });
}

export function useGoalCategoryOptions() {
  return useQuery({
    queryKey: queryKeys.goalCategories.list(),
    queryFn: () => fetchGoalCategoryOptions(),
  });
}

export function useGoalMutations() {
  const queryClient = useQueryClient();

  function invalidateGoals() {
    return invalidateAppData(queryClient);
  }

  const createGoal = useMutation({
    mutationFn: (input: SaveGoalInput) => saveGoal(input),
    onSuccess: (result) => {
      if (hasMutationError(result)) return;
      void invalidateGoals();
    },
  });

  const createGoalCategory = useMutation({
    mutationFn: (name: string) => saveGoalCategory(name),
    onSuccess: (result) => {
      if (hasMutationError(result)) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.goalCategories.all,
      });
      void invalidateGoals();
    },
  });

  const removeGoal = useMutation({
    mutationFn: (id: string) => deleteIntention(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.list() });
      const previousGoals = queryClient.getQueryData<Goal[]>(queryKeys.goals.list());

      queryClient.setQueryData<Goal[]>(queryKeys.goals.list(), (current = []) =>
        current.filter((goal) => goal.id !== id),
      );

      return { previousGoals };
    },
    onError: (_error, _id, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals.list(), context.previousGoals);
      }
    },
    onSuccess: (result, _id, context) => {
      if (hasMutationError(result)) {
        if (context?.previousGoals) {
          queryClient.setQueryData(queryKeys.goals.list(), context.previousGoals);
        }
        return;
      }
      void invalidateGoals();
    },
  });

  const logGoalCheckin = useMutation({
    mutationFn: (input: LogGoalCheckinInput) => logIntentionCheckin(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.list() });
      const previousGoals = queryClient.getQueryData<Goal[]>(queryKeys.goals.list());

      queryClient.setQueryData<Goal[]>(queryKeys.goals.list(), (current = []) =>
        current.filter((goal) => goal.id !== input.habitId),
      );

      return { previousGoals };
    },
    onError: (_error, _input, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals.list(), context.previousGoals);
      }
    },
    onSuccess: (result, _input, context) => {
      if (hasMutationError(result)) {
        if (context?.previousGoals) {
          queryClient.setQueryData(queryKeys.goals.list(), context.previousGoals);
        }
        return;
      }
      void invalidateGoals();
    },
  });

  const isPending =
    createGoal.isPending ||
    createGoalCategory.isPending ||
    removeGoal.isPending ||
    logGoalCheckin.isPending;

  return {
    createGoal,
    createGoalCategory,
    removeGoal,
    logGoalCheckin,
    isPending,
  };
}
