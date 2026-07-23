"use server";

import { dismissPopup } from "@/lib/checkins/dismiss-popup";
import { markPopupShown } from "@/lib/checkins/mark-popup-shown";
import type { CheckinPopupType } from "@/lib/types/database";

export async function dismissCheckinPopup(type: CheckinPopupType) {
  return dismissPopup(type);
}

export async function markCheckinPopupShown(type: CheckinPopupType) {
  return markPopupShown(type);
}
