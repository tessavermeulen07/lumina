import { WritingArea } from "@/components/journal/WritingArea";
import { getCheckInWritingContext } from "@/lib/dashboard/get-check-in-context";
import { isEveningCheckInAvailable } from "@/lib/dashboard/evening-check-in";
import { getReflectionPromptById } from "@/lib/dashboard/get-carousel-prompts";
import { getEntry } from "@/lib/entries/get-entry";
import { getGoalWritingContext } from "@/lib/habits/get-due-intention-checkins";
import {
  ensureTrailingUserBlock,
  listEntryBlocks,
} from "@/lib/entries/entry-blocks";
import { getWritingPrompt } from "@/lib/mock/writing";
import type { ReflectionPeriod } from "@/lib/types/database";
import { notFound, redirect } from "next/navigation";

const DEFAULT_WRITING_HINT = "Wat wil je vandaag nog meer kwijt?";

interface SchrijfPageProps {
  searchParams: Promise<{
    prompt?: string;
    id?: string;
    reflectie?: string;
    vervolg?: string;
    doel?: string;
    intentie?: string;
  }>;
}

const validReflectionPeriods = new Set<ReflectionPeriod>(["ochtend", "avond"]);

export default async function SchrijfPage({ searchParams }: SchrijfPageProps) {
  const { prompt, id, reflectie, vervolg, doel, intentie } = await searchParams;
  const goalId = doel ?? intentie;

  if (id) {
    const entry = await getEntry(id);

    if (!entry) {
      notFound();
    }

    const blocks = await listEntryBlocks(entry.id);
    const blocksWithTrailing = await ensureTrailingUserBlock(entry.id, blocks);

    return (
      <WritingArea
        hint="Ga verder met schrijven."
        initialBlocks={blocksWithTrailing}
        initialEntryId={entry.id}
        initialIsBookmarked={entry.is_bookmarked}
        initialIsPrivate={entry.is_private}
      />
    );
  }

  if (goalId) {
    const context = await getGoalWritingContext(goalId);

    if (!context) {
      notFound();
    }

    return (
      <WritingArea
        goalId={context.id}
        goalPrompt={context.aiCheckinPrompt}
        hint={context.aiCheckinPrompt}
      />
    );
  }

  if (vervolg) {
    const reflectionPrompt = await getReflectionPromptById(vervolg);

    if (!reflectionPrompt) {
      notFound();
    }

    return (
      <WritingArea
        hint={reflectionPrompt.question}
        reflectionPromptId={reflectionPrompt.id}
      />
    );
  }

  if (reflectie && validReflectionPeriods.has(reflectie as ReflectionPeriod)) {
    const period = reflectie as ReflectionPeriod;

    if (period === "avond" && !isEveningCheckInAvailable()) {
      redirect("/vandaag");
    }

    const context = await getCheckInWritingContext(period);

    if (!context) {
      redirect("/vandaag");
    }

    return (
      <WritingArea hint={context.hint} reflectionPeriod={period} />
    );
  }

  if (prompt === "first_entry") {
    return <WritingArea hint={getWritingPrompt().hint} />;
  }

  return <WritingArea hint={DEFAULT_WRITING_HINT} />;
}
