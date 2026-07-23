import {
  insightsCardClass,
  insightsHeadingClass,
  insightsSectionHeadingClass,
} from "@/components/features/insights/insights-styles";
import { WordsPerDayChart } from "@/components/features/insights/WordsPerDayChart";
import type { WordsPerDay } from "@/lib/insights/get-weekly-insights";

interface InsightsStatisticsSectionProps {
  entryCount: number;
  totalWords: number;
  wordsPerDay: WordsPerDay[];
}

export function InsightsStatisticsSection({
  entryCount,
  totalWords,
  wordsPerDay,
}: Readonly<InsightsStatisticsSectionProps>) {
  return (
    <section className="space-y-5">
      <h2 className={insightsSectionHeadingClass}>statistieken</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className={insightsCardClass}>
          <h3 className={insightsHeadingClass}>Entries</h3>
          <p className="mt-5 text-2xl font-bold text-foreground">{entryCount}</p>
        </section>

        <section className={insightsCardClass}>
          <h3 className={insightsHeadingClass}>Aantal woorden</h3>
          <p className="mt-5 text-2xl font-bold text-foreground">{totalWords}</p>
        </section>
      </div>

      <section className={insightsCardClass}>
        <h3 className={insightsHeadingClass}>Woorden</h3>
        <WordsPerDayChart data={wordsPerDay} />
      </section>
    </section>
  );
}
