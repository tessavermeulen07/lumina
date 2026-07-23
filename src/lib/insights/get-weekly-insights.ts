import {
  groupFeelingsByColumn,
  mergeFeelingsByColumn,
  type EmotionColumnId,
} from "@/lib/ai/emotion-scores";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { startOfWeek, toLocalDateString } from "@/lib/data/week-utils";
import { averageEmotionScores } from "@/lib/insights/emotion-analysis-utils";
import {
  getWeekStartsWithEntries,
  resolveWeekNavigation,
} from "@/lib/insights/week-navigation";
import { createClient } from "@/lib/supabase/server";
import type { EntryAnalysis, EmotionScores } from "@/types/database";
import type { EntryFeeling, EntryPerson } from "@/types/entry-analysis";
import { getEntryThemeLabel } from "@/types/entry-analysis";

export interface WordsPerDay {
  date: string;
  label: string;
  wordCount: number;
}

export interface ThemeWithCount {
  name: string;
  count: number;
}

export interface WeeklyInsights {
  weekStart: string;
  weekLabel: string;
  isCurrentWeek: boolean;
  hasPreviousWeek: boolean;
  hasNextWeek: boolean;
  previousWeekStart: string | null;
  nextWeekStart: string | null;
  entryCount: number;
  totalWords: number;
  wordsPerDay: WordsPerDay[];
  emotionAverages: EmotionScores;
  feelings: EntryFeeling[];
  feelingsByColumn: Record<EmotionColumnId, EntryFeeling[]>;
  primaryTheme: ThemeWithCount | null;
  subThemes: ThemeWithCount[];
  persons: EntryPerson[];
}

const dayLabels = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatWeekLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const formatter = new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${weekStart.getDate()} – ${formatter.format(weekEnd)}`;
  }

  const startPart = new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
  }).format(weekStart);

  return `${startPart} – ${formatter.format(weekEnd)}`;
}

function aggregateFeelings(analyses: EntryAnalysis[]): EntryFeeling[] {
  const map = new Map<string, EntryFeeling>();

  for (const analysis of analyses) {
    for (const feeling of analysis.feelings) {
      const existing = map.get(feeling.key);
      const nextIntensity = feeling.intensity ?? 0;
      const existingIntensity = existing?.intensity ?? 0;

      if (!existing || nextIntensity > existingIntensity) {
        map.set(feeling.key, { ...feeling });
      }
    }
  }

  return [...map.values()];
}

function aggregateThemes(analyses: EntryAnalysis[]): {
  primaryTheme: ThemeWithCount | null;
  subThemes: ThemeWithCount[];
} {
  const map = new Map<string, ThemeWithCount>();

  for (const analysis of analyses) {
    for (const theme of analysis.themes) {
      const label = getEntryThemeLabel(theme);

      if (!label || label === "Thema") {
        continue;
      }

      const key = label.toLowerCase();
      const existing = map.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { name: label, count: 1 });
      }
    }
  }

  const sorted = [...map.values()].sort((a, b) => b.count - a.count);

  return {
    primaryTheme: sorted[0] ?? null,
    subThemes: sorted.slice(1),
  };
}

function aggregatePersons(analyses: EntryAnalysis[]): EntryPerson[] {
  const map = new Map<string, EntryPerson>();

  for (const analysis of analyses) {
    for (const person of analysis.persons) {
      const key = person.name.toLowerCase();
      const existing = map.get(key);

      if (existing) {
        existing.mention_count += person.mention_count;
      } else {
        map.set(key, { ...person });
      }
    }
  }

  return [...map.values()].sort(
    (a, b) => b.mention_count - a.mention_count,
  );
}

export async function getWeeklyInsights(
  weekStartParam?: string,
): Promise<WeeklyInsights> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const now = new Date();
  const currentWeekStart = startOfWeek(now);
  const currentWeekStartStr = toLocalDateString(currentWeekStart);
  const selectedWeekStart = weekStartParam
    ? startOfWeek(new Date(`${weekStartParam}T12:00:00`))
    : currentWeekStart;
  const selectedWeekStartStr = toLocalDateString(selectedWeekStart);
  const weekStarts = await getWeekStartsWithEntries(user.id);
  const weekEnd = addDays(selectedWeekStart, 6);
  weekEnd.setHours(23, 59, 59, 999);

  const { data: entries } = await supabase
    .from("entries")
    .select("id, created_at, is_private")
    .eq("user_id", user.id)
    .gte("created_at", selectedWeekStart.toISOString())
    .lte("created_at", weekEnd.toISOString());

  const publicEntryIds = (entries ?? [])
    .filter((entry) => !entry.is_private)
    .map((entry) => entry.id);
  let analyses: EntryAnalysis[] = [];

  if (publicEntryIds.length > 0) {
    const { data } = await supabase
      .from("entry_analyses")
      .select("*")
      .in("entry_id", publicEntryIds);

    analyses = (data ?? []) as EntryAnalysis[];
  }

  const wordsByDate = new Map<string, number>();

  for (let index = 0; index < 7; index += 1) {
    const date = addDays(selectedWeekStart, index);
    wordsByDate.set(toLocalDateString(date), 0);
  }

  for (const analysis of analyses) {
    const entry = entries?.find(
      (item) => item.id === analysis.entry_id && !item.is_private,
    );

    if (!entry) continue;

    const dateKey = toLocalDateString(new Date(entry.created_at));
    wordsByDate.set(
      dateKey,
      (wordsByDate.get(dateKey) ?? 0) + analysis.word_count,
    );
  }

  const wordsPerDay: WordsPerDay[] = dayLabels.map((label, index) => {
    const date = addDays(selectedWeekStart, index);
    const dateKey = toLocalDateString(date);

    return {
      date: dateKey,
      label,
      wordCount: wordsByDate.get(dateKey) ?? 0,
    };
  });

  const totalWords = analyses.reduce(
    (sum, analysis) => sum + analysis.word_count,
    0,
  );

  const themes = aggregateThemes(analyses);
  const feelings = aggregateFeelings(analyses);
  const feelingsByColumn = mergeFeelingsByColumn(
    analyses.map((analysis) =>
      groupFeelingsByColumn(analysis.feelings as EntryFeeling[]),
    ),
  );

  const navigation = resolveWeekNavigation(
    weekStarts,
    selectedWeekStartStr,
    currentWeekStartStr,
  );

  return {
    weekStart: selectedWeekStartStr,
    weekLabel: formatWeekLabel(selectedWeekStart),
    ...navigation,
    entryCount: analyses.length,
    totalWords,
    wordsPerDay,
    emotionAverages: averageEmotionScores(analyses),
    feelings,
    feelingsByColumn,
    primaryTheme: themes.primaryTheme,
    subThemes: themes.subThemes,
    persons: aggregatePersons(analyses),
  };
}
