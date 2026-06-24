import {
  ANALYSIS_LEVEL_LABELS,
  daysUntilReportUnlock,
  formatWeekEndDate,
  isWeekReportUnlocked,
  resolveAnalysisLevel,
  wordsToNextLevel,
} from "@/lib/insights/analysis-levels";
import {
  ensureWeeklyReport,
  fetchWeekAnalyses,
} from "@/lib/insights/ensure-weekly-report";
import { startOfWeek, toLocalDateString } from "@/lib/data/week-utils";
import type { WeeklyReport } from "@/lib/types/database";

export interface WeeklyReportView {
  weekStart: string;
  weekEndLabel: string;
  isCurrentWeek: boolean;
  isUnlocked: boolean;
  daysUntilUnlock: number;
  totalWords: number;
  analysisLevel: number | null;
  wordsToNextLevel: number | null;
  nextLevelLabel: string | null;
  report: WeeklyReport | null;
}

export async function getWeeklyReport(
  weekStartParam?: string,
): Promise<WeeklyReportView> {
  const now = new Date();
  const currentWeekStart = startOfWeek(now);
  const currentWeekStartStr = toLocalDateString(currentWeekStart);
  const weekData = await fetchWeekAnalyses(weekStartParam);
  const isCurrentWeek = weekData.weekStartStr === currentWeekStartStr;
  const isUnlocked = isWeekReportUnlocked(weekData.weekStart, now);
  const analysisLevel = resolveAnalysisLevel(weekData.totalWords);
  const nextLevel = wordsToNextLevel(weekData.totalWords);

  let report: WeeklyReport | null = null;

  if (isUnlocked && analysisLevel) {
    report = await ensureWeeklyReport({
      weekStart: weekData.weekStart,
      weekLabel: weekData.weekLabel,
      totalWords: weekData.totalWords,
      analyses: weekData.analyses,
      feelings: weekData.feelings,
      themes: weekData.themes,
      persons: weekData.persons,
    });
  }

  return {
    weekStart: weekData.weekStartStr,
    weekEndLabel: formatWeekEndDate(weekData.weekStart),
    isCurrentWeek,
    isUnlocked,
    daysUntilUnlock: daysUntilReportUnlock(weekData.weekStart, now),
    totalWords: weekData.totalWords,
    analysisLevel,
    wordsToNextLevel: nextLevel?.remaining ?? null,
    nextLevelLabel: nextLevel
      ? ANALYSIS_LEVEL_LABELS[nextLevel.nextLevel]
      : null,
    report,
  };
}
