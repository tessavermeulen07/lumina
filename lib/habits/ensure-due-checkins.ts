import { scheduleDueCheckinsForToday } from "@/lib/habits/schedule-due-checkins";

export async function ensureDueCheckins(
  referenceDate = new Date(),
): Promise<void> {
  try {
    await scheduleDueCheckinsForToday(referenceDate);
  } catch (error) {
    console.warn("Check-in scheduler overgeslagen:", error);
  }
}
