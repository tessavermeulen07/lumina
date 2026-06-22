import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { EmotionScores } from "@/lib/types/database";

export const TWINWORD_SERVICE = "twinword";

export function getCurrentUsageMonth(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getTwinwordMonthlyLimit(): number {
  const configured = process.env.TWINWORD_MONTHLY_LIMIT;

  if (configured) {
    const parsed = Number.parseInt(configured, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 1950;
}

export function isTwinwordEnabled(): boolean {
  if (process.env.TWINWORD_ENABLED === "false") {
    return false;
  }

  return Boolean(process.env.RAPIDAPI_KEY);
}

export async function getTwinwordUsageCount(): Promise<number> {
  const supabase = await createClient();
  const month = getCurrentUsageMonth();

  const { data, error } = await supabase.rpc("get_api_usage_count", {
    p_service: TWINWORD_SERVICE,
    p_month: month,
  });

  if (error) {
    return 0;
  }

  return typeof data === "number" ? data : 0;
}

export async function tryReserveTwinwordUsage(): Promise<{
  reserved: boolean;
  count: number;
  limit: number;
}> {
  const admin = createAdminClient();
  const month = getCurrentUsageMonth();
  const limit = getTwinwordMonthlyLimit();

  const { data, error } = await admin.rpc("try_reserve_api_usage", {
    p_service: TWINWORD_SERVICE,
    p_month: month,
    p_limit: limit,
  });

  if (error || !data || typeof data !== "object") {
    return { reserved: false, count: 0, limit };
  }

  const payload = data as {
    reserved?: boolean;
    count?: number;
    limit?: number;
  };

  return {
    reserved: payload.reserved === true,
    count: payload.count ?? 0,
    limit: payload.limit ?? limit,
  };
}

export async function getCachedTwinwordScores(
  textHash: string,
): Promise<{ scores: EmotionScores; dominantEmotion: string | null } | null> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("twinword_text_cache")
    .select("scores, dominant_emotion")
    .eq("text_hash", textHash)
    .single();

  if (!data?.scores) {
    return null;
  }

  return {
    scores: data.scores as EmotionScores,
    dominantEmotion: data.dominant_emotion,
  };
}

export async function setCachedTwinwordScores(
  textHash: string,
  scores: EmotionScores,
  dominantEmotion: string | null,
): Promise<void> {
  const admin = createAdminClient();

  await admin.from("twinword_text_cache").upsert({
    text_hash: textHash,
    scores,
    dominant_emotion: dominantEmotion,
  });
}

export async function getEntryEmotionScores(
  entryId: string,
): Promise<EmotionScores | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("entry_analyses")
    .select("emotion_scores")
    .eq("entry_id", entryId)
    .single();

  return (data?.emotion_scores as EmotionScores | null) ?? null;
}
