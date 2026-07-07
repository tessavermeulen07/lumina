import { getLuminaDashboardQuestions } from "@/lib/ai/get-lumina-dashboard-questions";
import { DailyJournalSection } from "@/components/dashboard/DailyJournalSection";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { GoalsAndLuminaRow } from "@/components/dashboard/GoalsAndLuminaRow";
import { ensureDailyPrompts } from "@/lib/dashboard/ensure-daily-prompts";
import { getCarouselPrompts } from "@/lib/dashboard/get-carousel-prompts";
import { getDailyCheckInData } from "@/lib/dashboard/get-check-in-context";
import { getDashboardOverview } from "@/lib/data/get-dashboard-overview";
import { getProfile } from "@/lib/auth/get-profile";
import { listGoalCategoryOptions } from "@/lib/habits/list-goal-categories";
import { listGoals } from "@/lib/habits/list-intentions";

export default async function VandaagPage() {
  await ensureDailyPrompts();

  const [
    profile,
    overview,
    checkInData,
    followUpPrompts,
    goals,
    goalCategories,
    luminaQuestions,
  ] = await Promise.all([
    getProfile(),
    getDashboardOverview(),
    getDailyCheckInData(),
    getCarouselPrompts(),
    listGoals(),
    listGoalCategoryOptions(),
    getLuminaDashboardQuestions(3),
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
        categories={goalCategories}
        goals={goals}
        questions={luminaQuestions}
      />
    </div>
  );
}
