import { getAuthenticatedUser, getProfile } from "@/lib/auth/get-profile";
import { getReflectionCompletion } from "@/lib/dashboard/get-reflection-completion";
import { createClient } from "@/lib/supabase/server";
import type { CheckinPopupType } from "@/lib/types/database";
import {
  getAmsterdamDateString,
  hasPassedAmsterdamTime,
} from "@/lib/utils/amsterdam-time";

export interface PendingPopup {
  type: CheckinPopupType;
  title: string;
  message: string;
  primaryLabel: string;
  href: string;
}

function resolveTimeOrDefault(
  value: string | null | undefined,
  fallback: string,
): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function getPopupConfig(type: CheckinPopupType): Omit<PendingPopup, "type"> {
  if (type === "goals") {
    return {
      title: "Tijd voor je doelen",
      message: "Je hebt open check-ins voor je doelen. Rond ze in een paar tikken af.",
      primaryLabel: "Open doelen",
      href: "/vandaag",
    };
  }

  if (type === "ochtend_reflectie") {
    return {
      title: "Tijd voor je ochtendreflectie",
      message: "Neem een rustig moment om je ochtendreflectie te schrijven.",
      primaryLabel: "Start ochtendreflectie",
      href: "/schrijf?reflectie=ochtend",
    };
  }

  return {
    title: "Tijd voor je avondreflectie",
    message: "Sluit je dag af met een korte avondreflectie.",
    primaryLabel: "Start avondreflectie",
    href: "/schrijf?reflectie=avond",
  };
}

async function hasPopupStateForToday(
  userId: string,
  type: CheckinPopupType,
  today: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("checkin_popup_state")
    .select("id")
    .eq("user_id", userId)
    .eq("popup_type", type)
    .eq("popup_date", today)
    .maybeSingle();
  return Boolean(data);
}

export async function getPendingPopup(): Promise<PendingPopup | null> {
  const user = await getAuthenticatedUser();
  const profile = await getProfile();
  const supabase = await createClient();
  const today = getAmsterdamDateString();
  const completion = await getReflectionCompletion();
  const goalsCheckinTime = resolveTimeOrDefault(profile.goals_checkin_time, "09:00");
  const morningReflectionTime = resolveTimeOrDefault(
    profile.morning_reflection_time,
    "08:00",
  );
  const eveningReflectionTime = resolveTimeOrDefault(
    profile.evening_reflection_time,
    "20:00",
  );

  const { count: pendingGoals } = await supabase
    .from("intention_checkin_queue")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "pending");

  const candidateTypes: CheckinPopupType[] = [];

  if (
    (pendingGoals ?? 0) > 0 &&
    hasPassedAmsterdamTime(goalsCheckinTime)
  ) {
    candidateTypes.push("goals");
  }

  if (!completion.ochtend && hasPassedAmsterdamTime(morningReflectionTime)) {
    candidateTypes.push("ochtend_reflectie");
  }

  if (!completion.avond && hasPassedAmsterdamTime(eveningReflectionTime)) {
    candidateTypes.push("avond_reflectie");
  }

  for (const type of candidateTypes) {
    const alreadyShown = await hasPopupStateForToday(user.id, type, today);
    if (alreadyShown) {
      continue;
    }

    return { type, ...getPopupConfig(type) };
  }

  return null;
}
