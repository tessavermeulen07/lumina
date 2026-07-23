import { EmotionalLandscape } from "@/components/features/insights/EmotionalLandscape";
import { insightsSectionHeadingClass } from "@/components/features/insights/insights-styles";
import { InsightsStatisticsSection } from "@/components/features/insights/InsightsStatisticsSection";
import { InsightsWeekHeader } from "@/components/features/insights/InsightsWeekHeader";
import { PersonsCloud } from "@/components/features/insights/PersonsCloud";
import { ThemesGrid } from "@/components/features/insights/ThemesGrid";
import { WeeklyReportSection } from "@/components/features/insights/WeeklyReportSection";
import { getWeeklyInsights } from "@/lib/insights/get-weekly-insights";
import { getWeeklyReport } from "@/lib/insights/get-weekly-report";

interface InzichtenPageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function InzichtenPage({
  searchParams,
}: InzichtenPageProps) {
  const { week } = await searchParams;
  const [insights, weeklyReport] = await Promise.all([
    getWeeklyInsights(week),
    getWeeklyReport(week),
  ]);

  return (
    <div className="space-y-8">
      <InsightsWeekHeader
        hasNextWeek={insights.hasNextWeek}
        hasPreviousWeek={insights.hasPreviousWeek}
        isCurrentWeek={insights.isCurrentWeek}
        nextWeekStart={insights.nextWeekStart}
        previousWeekStart={insights.previousWeekStart}
        weekLabel={insights.weekLabel}
      />

      <WeeklyReportSection view={weeklyReport} />

      <InsightsStatisticsSection
        entryCount={insights.entryCount}
        totalWords={insights.totalWords}
        wordsPerDay={insights.wordsPerDay}
      />

      <section className="space-y-5">
        <h2 className={insightsSectionHeadingClass}>overzicht</h2>

        <EmotionalLandscape
          emotionAverages={insights.emotionAverages}
          feelings={insights.feelings}
        />
        <ThemesGrid
          primaryTheme={insights.primaryTheme}
          subThemes={insights.subThemes}
        />
        <PersonsCloud persons={insights.persons} />
      </section>
    </div>
  );
}
