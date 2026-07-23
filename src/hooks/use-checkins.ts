"use client";

import { useMutation } from "@tanstack/react-query";
import {
  dismissCheckinPopup,
  markCheckinPopupShown,
} from "@/lib/queries/checkin-actions";
import type { CheckinPopupType } from "@/types/database";

export function useCheckinPopupMutations() {
  const markShown = useMutation({
    mutationFn: (type: CheckinPopupType) => markCheckinPopupShown(type),
  });

  const dismiss = useMutation({
    mutationFn: (type: CheckinPopupType) => dismissCheckinPopup(type),
  });

  return { markShown, dismiss };
}
