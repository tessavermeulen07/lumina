import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { resolveTimezone } from "@/lib/utils/user-timezone";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/inloggen");
  }

  return user;
}

export async function getProfile(): Promise<Profile & { email: string | undefined }> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    throw new Error("Profiel kon niet worden geladen.");
  }

  return {
    ...profile,
    timezone: resolveTimezone(
      (profile as { timezone?: string | null }).timezone,
    ),
    email: user.email,
  };
}
