"use server";

import { getCarouselPrompts } from "@/lib/dashboard/get-carousel-prompts";
import { getHistoryByWeek } from "@/lib/insights/get-history-by-week";

export async function fetchFollowUpPrompts() {
  return getCarouselPrompts();
}

export async function fetchHistoryByWeek(weekStart?: string) {
  return getHistoryByWeek(weekStart);
}
