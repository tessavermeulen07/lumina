import { WritingArea } from "@/components/journal/WritingArea";
import { getWritingPrompt } from "@/lib/mock/writing";
import type { WritingPromptType } from "@/lib/types/writing";

interface SchrijfPageProps {
  searchParams: Promise<{ prompt?: string }>;
}

const validPromptTypes = new Set<WritingPromptType>([
  "generic",
  "yesterday",
  "earlier_today",
]);

export default async function SchrijfPage({ searchParams }: SchrijfPageProps) {
  const { prompt } = await searchParams;
  const promptType =
    prompt && validPromptTypes.has(prompt as WritingPromptType)
      ? (prompt as WritingPromptType)
      : "yesterday";

  const { hint } = getWritingPrompt(promptType);

  return <WritingArea hint={hint} />;
}
