import { scheduleDueCheckinsForToday } from "@/lib/habits/schedule-due-checkins";

export async function ensureDueCheckins(
  referenceDate = new Date(),
): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    await scheduleDueCheckinsForToday(referenceDate);
  } catch (error) {
    console.warn("Dev check-in scheduler overgeslagen:", error);
  }
}
