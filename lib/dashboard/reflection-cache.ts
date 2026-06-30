import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { DashboardReflectionCache } from "@/lib/types/database";
import { getTodayDateString } from "@/lib/dashboard/reflection-entries";

export type ReflectionCacheKey = "ochtend_context" | "avond_context";

export async function getReflectionCache<T>(
  cacheKey: ReflectionCacheKey,
  referenceDate = new Date(),
): Promise<T | null> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const today = getTodayDateString(referenceDate);

  const { data } = await supabase
    .from("dashboard_reflection_cache")
    .select("payload")
    .eq("user_id", user.id)
    .eq("cache_date", today)
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (!data?.payload) return null;
  return data.payload as T;
}

export async function setReflectionCache(
  cacheKey: ReflectionCacheKey,
  payload: object,
  referenceDate = new Date(),
): Promise<void> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const today = getTodayDateString(referenceDate);

  const row: DashboardReflectionCache = {
    user_id: user.id,
    cache_date: today,
    cache_key: cacheKey,
    payload: payload as Record<string, unknown>,
    generated_at: new Date().toISOString(),
  };

  await supabase.from("dashboard_reflection_cache").upsert(row, {
    onConflict: "user_id,cache_date,cache_key",
  });
}

export async function clearReflectionCacheForToday(
  referenceDate = new Date(),
): Promise<void> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const today = getTodayDateString(referenceDate);

  await supabase
    .from("dashboard_reflection_cache")
    .delete()
    .eq("user_id", user.id)
    .eq("cache_date", today);
}
