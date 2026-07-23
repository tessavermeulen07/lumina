import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLuminaDashboardQuestions } from "@/lib/ai/get-lumina-dashboard-questions";
import { DailyJournalSection } from "@/components/features/dashboard/DailyJournalSection";
import { DashboardGreeting } from "@/components/features/dashboard/DashboardGreeting";
import { DashboardOverview } from "@/components/features/dashboard/DashboardOverview";
import { GoalsAndLuminaRow } from "@/components/features/dashboard/GoalsAndLuminaRow";
import { ensureDailyPrompts } from "@/lib/dashboard/ensure-daily-prompts";
import { getDailyCheckInData } from "@/lib/dashboard/get-check-in-context";
import { getDashboardOverview } from "@/lib/data/get-dashboard-overview";
import { getProfile } from "@/lib/auth/get-profile";
import {
  fetchFollowUpPrompts,
} from "@/lib/queries/dashboard-actions";
import {
  fetchGoalCategoryOptions,
  fetchGoals,
} from "@/lib/queries/goals-actions";
import { getQueryClient } from "@/lib/queries/get-query-client";
import { queryKeys } from "@/lib/queries/keys";

export default async function VandaagPage() {
  await ensureDailyPrompts();

  const queryClient = getQueryClient();

  const [profile, overview, checkInData, luminaQuestions] = await Promise.all([
    getProfile(),
    getDashboardOverview(),
    getDailyCheckInData(),
    getLuminaDashboardQuestions(3),
    queryClient.prefetchQuery({
      queryKey: queryKeys.goals.list(),
      queryFn: () => fetchGoals(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.prompts.followUp(),
      queryFn: () => fetchFollowUpPrompts(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.goalCategories.list(),
      queryFn: () => fetchGoalCategoryOptions(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-10">
        <DashboardGreeting username={profile.username} />
        <DashboardOverview data={overview} />
        <DailyJournalSection checkInData={checkInData} />
        <GoalsAndLuminaRow questions={luminaQuestions} />
      </div>
    </HydrationBoundary>
  );
}
