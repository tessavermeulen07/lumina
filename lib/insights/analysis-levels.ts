export const ANALYSIS_LEVEL_THRESHOLDS = [50, 150, 300, 500, 750] as const;

export type AnalysisLevel = 1 | 2 | 3 | 4 | 5;

export const ANALYSIS_LEVEL_LABELS: Record<AnalysisLevel, string> = {
  1: "Basis analyse",
  2: "Lichte analyse",
  3: "Verdiepende analyse",
  4: "Grondige analyse",
  5: "Diepgaande analyse",
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function resolveAnalysisLevel(totalWords: number): AnalysisLevel | null {
  if (totalWords < ANALYSIS_LEVEL_THRESHOLDS[0]) {
    return null;
  }

  for (let index = ANALYSIS_LEVEL_THRESHOLDS.length - 1; index >= 0; index -= 1) {
    if (totalWords >= ANALYSIS_LEVEL_THRESHOLDS[index]) {
      return (index + 1) as AnalysisLevel;
    }
  }

  return null;
}

export function wordsToNextLevel(totalWords: number): {
  remaining: number;
  nextLevel: AnalysisLevel;
} | null {
  const currentLevel = resolveAnalysisLevel(totalWords);

  if (currentLevel === 5) {
    return null;
  }

  const nextLevel = (currentLevel ?? 0) + 1;
  const threshold = ANALYSIS_LEVEL_THRESHOLDS[nextLevel - 1];

  return {
    remaining: Math.max(threshold - totalWords, 0),
    nextLevel: nextLevel as AnalysisLevel,
  };
}

export function getWeekEndSunday(weekStart: Date): Date {
  const sunday = addDays(weekStart, 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

export function isWeekReportUnlocked(weekStart: Date, now = new Date()): boolean {
  const sunday = getWeekEndSunday(weekStart);
  const sundayStart = addDays(weekStart, 6);
  sundayStart.setHours(0, 0, 0, 0);

  return now >= sundayStart;
}

export function daysUntilReportUnlock(weekStart: Date, now = new Date()): number {
  if (isWeekReportUnlocked(weekStart, now)) {
    return 0;
  }

  const sunday = addDays(weekStart, 6);
  sunday.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const diffMs = sunday.getTime() - today.getTime();
  return Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 0);
}

export function formatWeekEndDate(weekStart: Date): string {
  const sunday = addDays(weekStart, 6);

  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(sunday);
}
