"use server";

import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { CheckinPopupType } from "@/lib/types/database";
import { getAmsterdamDateString } from "@/lib/utils/amsterdam-time";

export async function markPopupShown(type: CheckinPopupType): Promise<void> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const today = getAmsterdamDateString();

  await supabase.from("checkin_popup_state").upsert(
    {
      user_id: user.id,
      popup_type: type,
      popup_date: today,
    },
    { onConflict: "user_id,popup_type,popup_date" },
  );
}
