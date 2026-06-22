import { EmotionalLandscape } from "@/components/insights/EmotionalLandscape";
import { insightsSectionHeadingClass } from "@/components/insights/insights-styles";
import { InsightsStatisticsSection } from "@/components/insights/InsightsStatisticsSection";
import { InsightsWeekHeader } from "@/components/insights/InsightsWeekHeader";
import { PersonsCloud } from "@/components/insights/PersonsCloud";
import { ThemesGrid } from "@/components/insights/ThemesGrid";
import { getWeeklyInsights } from "@/lib/insights/get-weekly-insights";

export default async function InzichtenPage() {
  const insights = await getWeeklyInsights();

  return (
    <div className="space-y-8">
      <InsightsWeekHeader
        isCurrentWeek={insights.isCurrentWeek}
        weekLabel={insights.weekLabel}
      />

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
