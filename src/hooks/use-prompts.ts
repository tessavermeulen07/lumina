"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFollowUpPrompts } from "@/lib/queries/dashboard-actions";
import { togglePromptBookmark } from "@/lib/queries/prompt-actions";
import { queryKeys } from "@/lib/queries/keys";
import { hasMutationError, invalidateAppData } from "@/lib/queries/utils";

export function useFollowUpPrompts() {
  return useQuery({
    queryKey: queryKeys.prompts.followUp(),
    queryFn: () => fetchFollowUpPrompts(),
  });
}

export function usePromptMutations() {
  const queryClient = useQueryClient();

  const toggleBookmark = useMutation({
    mutationFn: (promptId: string) => togglePromptBookmark(promptId),
    onMutate: async (promptId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.prompts.followUp() });
      const previousPrompts = queryClient.getQueryData<
        Awaited<ReturnType<typeof fetchFollowUpPrompts>>
      >(queryKeys.prompts.followUp());

      queryClient.setQueryData(
        queryKeys.prompts.followUp(),
        (current: typeof previousPrompts) =>
          current?.map((prompt) =>
            prompt.id === promptId
              ? { ...prompt, isBookmarked: !prompt.isBookmarked }
              : prompt,
          ),
      );

      return { previousPrompts };
    },
    onError: (_error, _promptId, context) => {
      if (context?.previousPrompts) {
        queryClient.setQueryData(
          queryKeys.prompts.followUp(),
          context.previousPrompts,
        );
      }
    },
    onSuccess: (result, _promptId, context) => {
      if (hasMutationError(result)) {
        if (context?.previousPrompts) {
          queryClient.setQueryData(
            queryKeys.prompts.followUp(),
            context.previousPrompts,
          );
        }
        return;
      }

      void invalidateAppData(queryClient);
    },
  });

  return { toggleBookmark };
}
