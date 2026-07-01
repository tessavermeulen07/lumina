import { generateWeeklyReport } from "@/lib/ai/generate-weekly-report";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { startOfWeek, toLocalDateString } from "@/lib/data/week-utils";
import {
  isWeekReportUnlocked,
  resolveAnalysisLevel,
  type AnalysisLevel,
} from "@/lib/insights/analysis-levels";
import { createClient } from "@/lib/supabase/server";
import type { EntryAnalysis, WeeklyReport } from "@/lib/types/database";
import type { EntryFeeling, EntryPerson } from "@/lib/types/entry-analysis";
import { getEntryThemeLabel } from "@/lib/types/entry-analysis";

interface EnsureWeeklyReportInput {
  weekStart: Date;
  weekLabel: string;
  totalWords: number;
  analyses: EntryAnalysis[];
  feelings: EntryFeeling[];
  themes: string[];
  persons: EntryPerson[];
}

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

async function fetchExistingReport(
  userId: string,
  weekStartStr: string,
): Promise<WeeklyReport | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", weekStartStr)
    .maybeSingle();

  return (data as WeeklyReport | null) ?? null;
}

export async function ensureWeeklyReport(
  input: EnsureWeeklyReportInput,
): Promise<WeeklyReport | null> {
  const user = await getAuthenticatedUser();
  const weekStartStr = toLocalDateString(input.weekStart);
  const now = new Date();

  if (!isWeekReportUnlocked(input.weekStart, now)) {
    return null;
  }

  const analysisLevel = resolveAnalysisLevel(input.totalWords);

  if (!analysisLevel) {
    return null;
  }

  const existing = await fetchExistingReport(user.id, weekStartStr);

  if (existing) {
    return existing;
  }

  const generated = await generateWeeklyReport({
    weekLabel: input.weekLabel || formatWeekLabel(input.weekStart),
    totalWords: input.totalWords,
    analysisLevel,
    entryCount: input.analyses.length,
    analyses: input.analyses,
    feelings: input.feelings,
    themes: input.themes,
    persons: input.persons,
  });

  if ("error" in generated) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weekly_reports")
    .insert({
      user_id: user.id,
      week_start: weekStartStr,
      analysis_level: analysisLevel,
      headline: generated.headline,
      sections: generated.sections,
      total_words: input.totalWords,
    })
    .select("*")
    .single();

  if (error) {
    const retry = await fetchExistingReport(user.id, weekStartStr);
    return retry;
  }

  return data as WeeklyReport;
}

export async function fetchWeekAnalyses(
  weekStartParam?: string,
): Promise<{
  weekStart: Date;
  weekStartStr: string;
  weekLabel: string;
  analyses: EntryAnalysis[];
  totalWords: number;
  feelings: EntryFeeling[];
  themes: string[];
  persons: EntryPerson[];
}> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const weekStart = weekStartParam
    ? startOfWeek(new Date(`${weekStartParam}T12:00:00`))
    : startOfWeek(new Date());
  const weekStartStr = toLocalDateString(weekStart);
  const weekEnd = addDays(weekStart, 6);
  weekEnd.setHours(23, 59, 59, 999);

  const { data: entries } = await supabase
    .from("entries")
    .select("id, created_at")
    .eq("user_id", user.id)
    .gte("created_at", weekStart.toISOString())
    .lte("created_at", weekEnd.toISOString());

  const entryIds = (entries ?? []).map((entry) => entry.id);
  let analyses: EntryAnalysis[] = [];

  if (entryIds.length > 0) {
    const { data } = await supabase
      .from("entry_analyses")
      .select("*")
      .in("entry_id", entryIds);

    analyses = (data ?? []) as EntryAnalysis[];
  }

  const feelingsMap = new Map<string, EntryFeeling>();
  const themesMap = new Map<string, number>();
  const personsMap = new Map<string, EntryPerson>();

  for (const analysis of analyses) {
    for (const feeling of analysis.feelings) {
      const existing = feelingsMap.get(feeling.key);
      const nextIntensity = feeling.intensity ?? 0;
      const existingIntensity = existing?.intensity ?? 0;

      if (!existing || nextIntensity > existingIntensity) {
        feelingsMap.set(feeling.key, { ...feeling });
      }
    }

    for (const theme of analysis.themes) {
      const label = getEntryThemeLabel(theme);

      if (!label || label === "Thema") {
        continue;
      }

      const key = label.toLowerCase();
      themesMap.set(key, (themesMap.get(key) ?? 0) + 1);
    }

    for (const person of analysis.persons) {
      const key = person.name.toLowerCase();
      const existing = personsMap.get(key);

      if (existing) {
        existing.mention_count += person.mention_count;
      } else {
        personsMap.set(key, { ...person });
      }
    }
  }

  const themes = [...themesMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => {
      const theme = analyses
        .flatMap((a) => a.themes)
        .find((t) => getEntryThemeLabel(t).toLowerCase() === name);
      return theme ? getEntryThemeLabel(theme) : name;
    });

  const persons = [...personsMap.values()].sort(
    (a, b) => b.mention_count - a.mention_count,
  );

  const totalWords = analyses.reduce(
    (sum, analysis) => sum + analysis.word_count,
    0,
  );

  return {
    weekStart,
    weekStartStr,
    weekLabel: formatWeekLabel(weekStart),
    analyses,
    totalWords,
    feelings: [...feelingsMap.values()],
    themes,
    persons,
  };
}

export type { AnalysisLevel };
