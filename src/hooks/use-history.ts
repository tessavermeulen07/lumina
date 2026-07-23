"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchHistoryByWeek } from "@/lib/queries/dashboard-actions";
import { queryKeys } from "@/lib/queries/keys";

export function useHistoryWeek(weekStart?: string) {
  return useQuery({
    queryKey: queryKeys.history.week(weekStart),
    queryFn: () => fetchHistoryByWeek(weekStart),
  });
}
