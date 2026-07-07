import {
  getDashboardCache,
  setDashboardCache,
} from "@/lib/dashboard/reflection-cache";

function intentionPromptCacheKey(habitId: string): string {
  return `intention_prompt:${habitId}`;
}

export async function getCachedIntentionPrompt(
  habitId: string,
): Promise<string | null> {
  const cached = await getDashboardCache<{ prompt: string }>(
    intentionPromptCacheKey(habitId),
  );
  return cached?.prompt?.trim() || null;
}

export async function setCachedIntentionPrompt(
  habitId: string,
  prompt: string,
): Promise<void> {
  await setDashboardCache(intentionPromptCacheKey(habitId), { prompt });
}

export async function resolveIntentionPrompt(
  habitId: string,
  generate: () => Promise<string>,
): Promise<string> {
  const cached = await getCachedIntentionPrompt(habitId);
  if (cached) {
    return cached;
  }

  const prompt = await generate();
  await setCachedIntentionPrompt(habitId, prompt);
  return prompt;
}
