"use server";

import { getAuthenticatedUser, getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { CheckinPopupType } from "@/types/database";
import {
  getDateStringInTimezone,
  resolveTimezone,
} from "@/lib/utils/user-timezone";

export async function dismissPopup(type: CheckinPopupType): Promise<void> {
  const user = await getAuthenticatedUser();
  const profile = await getProfile();
  const supabase = await createClient();
  const today = getDateStringInTimezone(resolveTimezone(profile.timezone));

  await supabase
    .from("checkin_popup_state")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("popup_type", type)
    .eq("popup_date", today);
}
