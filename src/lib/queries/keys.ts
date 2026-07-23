export const queryKeys = {
  goals: {
    all: ["goals"] as const,
    list: () => [...queryKeys.goals.all, "list"] as const,
  },
  goalCategories: {
    all: ["goalCategories"] as const,
    list: () => [...queryKeys.goalCategories.all, "list"] as const,
  },
  entries: {
    all: ["entries"] as const,
    list: (limit?: number) => [...queryKeys.entries.all, "list", limit] as const,
    detail: (id: string) => [...queryKeys.entries.all, "detail", id] as const,
  },
  history: {
    all: ["history"] as const,
    week: (weekStart?: string) =>
      [...queryKeys.history.all, "week", weekStart ?? "current"] as const,
  },
  bookmarks: {
    all: ["bookmarks"] as const,
    list: () => [...queryKeys.bookmarks.all, "list"] as const,
  },
  prompts: {
    all: ["prompts"] as const,
    followUp: () => [...queryKeys.prompts.all, "followUp"] as const,
  },
};
