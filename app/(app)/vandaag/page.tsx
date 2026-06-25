import { getRecentInsights } from "@/lib/ai/get-recent-insights";
import { getQuestionsForUseCase } from "@/lib/ai/question-context";
import { DailyJournalSection } from "@/components/dashboard/DailyJournalSection";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { GoalsAndLuminaRow } from "@/components/dashboard/GoalsAndLuminaRow";
import { ensureDailyPrompts } from "@/lib/dashboard/ensure-daily-prompts";
import { getCarouselPrompts } from "@/lib/dashboard/get-carousel-prompts";
import { getDailyCheckInData } from "@/lib/dashboard/get-check-in-context";
import { getDashboardOverview } from "@/lib/data/get-dashboard-overview";
import { getProfile } from "@/lib/auth/get-profile";
import { listIntentions } from "@/lib/habits/list-intentions";

export default async function VandaagPage() {
  await ensureDailyPrompts();

  const [
    profile,
    overview,
    checkInData,
    followUpPrompts,
    goals,
    luminaQuestions,
    recentInsights,
  ] = await Promise.all([
    getProfile(),
    getDashboardOverview(),
    getDailyCheckInData(),
    getCarouselPrompts(),
    listIntentions(),
    getQuestionsForUseCase("patronen", 3),
    getRecentInsights(3),
  ]);

  return (
    <div className="space-y-10">
      <DashboardGreeting username={profile.username} />
      <DashboardOverview data={overview} />
      <DailyJournalSection
        checkInData={checkInData}
        followUpPrompts={followUpPrompts}
      />
      <GoalsAndLuminaRow
        goals={goals}
        luminaQuestions={luminaQuestions}
        recentInsights={recentInsights}
      />
    </div>
  );
}
