import { WritingArea } from "@/components/journal/WritingArea";
import { getCheckInWritingContext } from "@/lib/dashboard/get-check-in-context";
import { isEveningCheckInAvailable } from "@/lib/dashboard/evening-check-in";
import { getReflectionPromptById } from "@/lib/dashboard/get-carousel-prompts";
import { getEntry } from "@/lib/entries/get-entry";
import {
  ensureTrailingUserBlock,
  listEntryBlocks,
} from "@/lib/entries/entry-blocks";
import { getWritingPrompt } from "@/lib/mock/writing";
import type { ReflectionPeriod } from "@/lib/types/database";
import type { WritingPromptType } from "@/lib/types/writing";
import { notFound, redirect } from "next/navigation";

interface SchrijfPageProps {
  searchParams: Promise<{
    prompt?: string;
    id?: string;
    reflectie?: string;
    vervolg?: string;
  }>;
}

const validPromptTypes = new Set<WritingPromptType>([
  "generic",
  "yesterday",
  "earlier_today",
  "first_entry",
]);

const validReflectionPeriods = new Set<ReflectionPeriod>(["ochtend", "avond"]);

export default async function SchrijfPage({ searchParams }: SchrijfPageProps) {
  const { prompt, id, reflectie, vervolg } = await searchParams;

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

  const promptType =
    prompt && validPromptTypes.has(prompt as WritingPromptType)
      ? (prompt as WritingPromptType)
      : "yesterday";

  const { hint } = getWritingPrompt(promptType);

  return <WritingArea hint={hint} />;
}
