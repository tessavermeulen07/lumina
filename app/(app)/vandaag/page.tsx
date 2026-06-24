import { getProfile } from "@/lib/auth/get-profile";
import { getRecentInsights } from "@/lib/ai/get-recent-insights";
import { getQuestionsForUseCase } from "@/lib/ai/question-context";
import { DailyJournalSection } from "@/components/dashboard/DailyJournalSection";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { GoalsAndLuminaRow } from "@/components/dashboard/GoalsAndLuminaRow";
import { getDashboardOverview } from "@/lib/data/get-dashboard-overview";
import { listIntentions } from "@/lib/habits/list-intentions";

export default async function VandaagPage() {
  const [
    profile,
    overview,
    journalPrompts,
    goals,
    luminaQuestions,
    recentInsights,
  ] = await Promise.all([
    getProfile(),
    getDashboardOverview(),
    getQuestionsForUseCase("dagelijkse_reflectie", 2),
    listIntentions(),
    getQuestionsForUseCase("patronen", 3),
    getRecentInsights(3),
  ]);

  return (
    <div className="space-y-10">
      <DashboardGreeting username={profile.username} />
      <DashboardOverview data={overview} />
      <DailyJournalSection prompts={journalPrompts} />
      <GoalsAndLuminaRow
        goals={goals}
        luminaQuestions={luminaQuestions}
        recentInsights={recentInsights}
      />
    </div>
  );
}
