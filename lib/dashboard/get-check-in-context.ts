import type { ReflectionPeriod } from "@/lib/types/database";
import type {
  CheckInCardData,
  EntryWithAnalysis,
} from "@/lib/types/dashboard-reflection";
import { isEveningCheckInAvailable } from "@/lib/dashboard/evening-check-in";
import {
  entryMatchesDate,
  getFinalizedEntriesWithAnalyses,
  getTodayFinalizedEntries,
  getYesterdayDateString,
  truncateText,
} from "@/lib/dashboard/reflection-entries";
import {
  getReflectionCache,
  setReflectionCache,
} from "@/lib/dashboard/reflection-cache";
import { getReflectionCompletion } from "@/lib/dashboard/get-reflection-completion";

interface CheckInContextPayload {
  prompt: string;
  contextSnippet: string;
  hint: string;
}

const PERIOD_LABELS: Record<ReflectionPeriod, string> = {
  ochtend: "Ochtend check-in",
  avond: "Avond check-in",
};

const PERIOD_PROMPTS: Record<ReflectionPeriod, string> = {
  ochtend: "Hoe wil je deze ochtend beginnen?",
  avond: "Hoe was je dag?",
};

function joinWritingHint(body: string, question: string): string {
  const trimmedBody = body.trim();
  if (!trimmedBody) return question;
  return `${trimmedBody}\n\n${question}`;
}

function buildMorningContext(): CheckInContextPayload {
  const question = PERIOD_PROMPTS.ochtend;
  const body = "Neem een moment om bij jezelf te checken.";
  return {
    prompt: question,
    contextSnippet: body,
    hint: joinWritingHint(body, question),
  };
}

function buildEveningUnavailableContext(): CheckInContextPayload {
  const prompt = "Je avondreflectie wacht op je";
  const body =
    "Vanaf 18:00 kun je terugblikken op je dag en je gedachten vastleggen.";
  return {
    prompt,
    contextSnippet: body,
    hint: joinWritingHint(body, prompt),
  };
}

function buildEveningFallbackContext(): CheckInContextPayload {
  const question = PERIOD_PROMPTS.avond;
  const body =
    "Neem een moment om de dag rustig af te sluiten. Een paar zinnen zijn genoeg.";
  return {
    prompt: question,
    contextSnippet: body,
    hint: joinWritingHint(
      "Wat neem je mee van vandaag? Wat wil je loslaten?",
      question,
    ),
  };
}

function buildEveningContextFromEntries(
  todayEntries: EntryWithAnalysis[],
): CheckInContextPayload {
  if (todayEntries.length === 0) {
    return buildEveningFallbackContext();
  }

  if (todayEntries.length === 1) {
    const entry = todayEntries[0];
    const analysis = entry.analysis;
    if (!analysis) return buildEveningFallbackContext();

    const prefix =
      entry.reflection_period === "ochtend"
        ? "Vanmorgen noemde je"
        : "Je schreef vandaag over";
    const insight = analysis.key_insight || analysis.summary;
    const question = "Wat is er sindsdien veranderd?";
    const body = `${prefix}: ${insight}`;

    return {
      prompt: question,
      contextSnippet: truncateText(body),
      hint: joinWritingHint(body, question),
    };
  }

  const morningEntry = todayEntries.find(
    (entry) => entry.reflection_period === "ochtend",
  );
  const laterEntries = todayEntries.filter(
    (entry) => entry.reflection_period !== "ochtend",
  );

  const titles = todayEntries
    .map((entry) => entry.analysis?.title)
    .filter((title): title is string => Boolean(title));

  let contextSnippet: string;
  let summaryBody: string;

  if (morningEntry?.analysis && laterEntries.length > 0) {
    const laterTitles = laterEntries
      .map((entry) => entry.analysis?.title?.toLowerCase())
      .filter((title): title is string => Boolean(title));

    summaryBody = `Vanmorgen startte je met ${morningEntry.analysis.title.toLowerCase()}. Later schreef je ook over ${laterTitles.join(" en ")}.`;
    contextSnippet = truncateText(summaryBody);
  } else if (titles.length >= 2) {
    const lastTitle = titles[titles.length - 1]!.toLowerCase();
    const earlierTitles = titles
      .slice(0, -1)
      .map((title) => title.toLowerCase())
      .join(", ");
    summaryBody = `Vandaag reflecteerde je op ${earlierTitles} en ${lastTitle}.`;
    contextSnippet = truncateText(summaryBody);
  } else {
    const insight =
      todayEntries[todayEntries.length - 1]?.analysis?.key_insight ??
      todayEntries[todayEntries.length - 1]?.analysis?.summary ??
      "";
    summaryBody = `Vandaag schreef je: ${insight}`;
    contextSnippet = truncateText(summaryBody);
  }

  const hintLines = todayEntries
    .map((entry) => {
      const analysis = entry.analysis;
      if (!analysis) return null;
      return `• ${analysis.title}: ${analysis.key_insight || analysis.summary}`;
    })
    .filter((line): line is string => Boolean(line));

  const question = "Hoe kijk je terug op je dag?";
  const body = `Terugblik op je dag:\n${hintLines.join("\n")}`;

  return {
    prompt: question,
    contextSnippet,
    hint: joinWritingHint(body, question),
  };
}

async function buildMorningWritingContext(
  referenceDate: Date,
): Promise<CheckInContextPayload> {
  const entries = await getFinalizedEntriesWithAnalyses(10);
  const yesterday = getYesterdayDateString(referenceDate);
  const yesterdayEntry = entries.find((entry) =>
    entryMatchesDate(entry.created_at, yesterday),
  );

  if (!yesterdayEntry?.analysis) {
    return buildMorningContext();
  }

  const title = yesterdayEntry.analysis.title;
  const insight =
    yesterdayEntry.analysis.key_insight || yesterdayEntry.analysis.summary;
  const body = `Gisteren schreef je over ${title.toLowerCase()}. ${insight}`;
  const question = "Wat brengt gisteren vandaag bij je op?";

  return {
    prompt: question,
    contextSnippet: truncateText(body),
    hint: joinWritingHint(body, question),
  };
}

async function buildEveningWritingContext(
  referenceDate: Date,
): Promise<CheckInContextPayload> {
  const todayEntries = await getTodayFinalizedEntries(referenceDate);
  return buildEveningContextFromEntries(todayEntries);
}

async function resolveMorningContext(
  referenceDate: Date,
): Promise<CheckInContextPayload> {
  const cached = await getReflectionCache<CheckInContextPayload>(
    "ochtend_context",
    referenceDate,
  );
  if (cached) return cached;

  const entries = await getFinalizedEntriesWithAnalyses(10);
  const yesterday = getYesterdayDateString(referenceDate);
  const yesterdayEntry = entries.find((entry) =>
    entryMatchesDate(entry.created_at, yesterday),
  );

  if (!yesterdayEntry?.analysis) {
    const fallback = buildMorningContext();
    await setReflectionCache("ochtend_context", fallback, referenceDate);
    return fallback;
  }

  const title = yesterdayEntry.analysis.title;
  const insight =
    yesterdayEntry.analysis.key_insight || yesterdayEntry.analysis.summary;

  const body = `Gisteren schreef je over ${title.toLowerCase()}. ${insight}`;
  const question = "Wat brengt gisteren vandaag bij je op?";

  const result: CheckInContextPayload = {
    prompt: question,
    contextSnippet: truncateText(body),
    hint: joinWritingHint(body, question),
  };

  await setReflectionCache("ochtend_context", result, referenceDate);
  return result;
}

async function resolveEveningContext(
  referenceDate: Date,
): Promise<CheckInContextPayload> {
  if (!isEveningCheckInAvailable(referenceDate)) {
    return buildEveningUnavailableContext();
  }

  const cached = await getReflectionCache<CheckInContextPayload>(
    "avond_context",
    referenceDate,
  );
  if (cached) return cached;

  const todayEntries = await getTodayFinalizedEntries(referenceDate);
  const result = buildEveningContextFromEntries(todayEntries);

  await setReflectionCache("avond_context", result, referenceDate);
  return result;
}

async function resolveContextForPeriod(
  period: ReflectionPeriod,
  referenceDate: Date,
): Promise<CheckInContextPayload> {
  if (period === "ochtend") {
    return resolveMorningContext(referenceDate);
  }
  return resolveEveningContext(referenceDate);
}

export async function getCheckInCardData(
  period: ReflectionPeriod,
  referenceDate = new Date(),
): Promise<CheckInCardData> {
  const completion = await getReflectionCompletion(referenceDate);
  const isAvailable =
    period === "ochtend" || isEveningCheckInAvailable(referenceDate);

  let context: CheckInContextPayload;

  if (period === "ochtend") {
    context = await buildMorningWritingContext(referenceDate);
  } else if (!isAvailable) {
    context = buildEveningUnavailableContext();
  } else {
    context = await buildEveningWritingContext(referenceDate);
  }

  return {
    period,
    label: PERIOD_LABELS[period],
    prompt: context.prompt,
    contextSnippet: context.contextSnippet,
    hint: context.hint,
    isCompleted: completion[period],
    isAvailable,
    href: `/schrijf?reflectie=${period}`,
  };
}

export async function getCheckInWritingContext(
  period: ReflectionPeriod,
  referenceDate = new Date(),
): Promise<CheckInContextPayload | null> {
  if (period === "avond" && !isEveningCheckInAvailable(referenceDate)) {
    return null;
  }

  if (period === "ochtend") {
    return buildMorningWritingContext(referenceDate);
  }

  return buildEveningWritingContext(referenceDate);
}

export async function getDailyCheckInData(
  referenceDate = new Date(),
): Promise<{ ochtend: CheckInCardData; avond: CheckInCardData }> {
  const [ochtend, avond] = await Promise.all([
    getCheckInCardData("ochtend", referenceDate),
    getCheckInCardData("avond", referenceDate),
  ]);

  return { ochtend, avond };
}
