"use server";

import { getAuthenticatedUser, getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { CheckinPopupType } from "@/types/database";
import {
  getDateStringInTimezone,
  resolveTimezone,
} from "@/lib/utils/user-timezone";

export async function markPopupShown(type: CheckinPopupType): Promise<void> {
  const user = await getAuthenticatedUser();
  const profile = await getProfile();
  const supabase = await createClient();
  const today = getDateStringInTimezone(resolveTimezone(profile.timezone));

  await supabase.from("checkin_popup_state").upsert(
    {
      user_id: user.id,
      popup_type: type,
      popup_date: today,
    },
    { onConflict: "user_id,popup_type,popup_date" },
  );
}
