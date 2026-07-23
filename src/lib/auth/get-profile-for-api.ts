import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { resolveTimezone } from "@/lib/utils/user-timezone";

export async function getProfileForApi(): Promise<
  (Profile & { email: string | undefined }) | null
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    ...profile,
    timezone: resolveTimezone(
      (profile as { timezone?: string | null }).timezone,
    ),
    email: user.email,
  };
}
