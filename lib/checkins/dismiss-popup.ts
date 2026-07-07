"use server";

import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { CheckinPopupType } from "@/lib/types/database";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-time";

export async function dismissPopup(type: CheckinPopupType): Promise<void> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const today = getAmsterdamDateString();

  await supabase
    .from("checkin_popup_state")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("popup_type", type)
    .eq("popup_date", today);
}
