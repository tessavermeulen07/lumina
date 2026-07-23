import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/keys";

export function hasMutationError(result: unknown): result is { error: string } {
  return typeof result === "object" && result !== null && "error" in result;
}

export function invalidateAppData(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.entries.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.history.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.goals.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.prompts.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.goalCategories.all }),
  ]);
}
