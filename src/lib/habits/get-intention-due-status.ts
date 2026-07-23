import { getTodayDateString } from "@/lib/dashboard/reflection-entries";
import { startOfWeek, toLocalDateString } from "@/lib/data/week-utils";
import type { HabitLog } from "@/types/database";
import type { GoalFrequency } from "@/types/goal";

function sortLogsNewestFirst(logs: HabitLog[]): HabitLog[] {
  return [...logs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
  );
}

export function isIntentionDue(
  frequency: GoalFrequency,
  logs: HabitLog[],
  referenceDate = new Date(),
): boolean {
  if (frequency === "altijd") {
    return false;
  }

  const sortedLogs = sortLogsNewestFirst(logs);

  if (frequency === "een-keer") {
    return !sortedLogs.some((log) => log.status === "completed");
  }

  const latestLog = sortedLogs[0];
  if (!latestLog) {
    return true;
  }

  const loggedAt = new Date(latestLog.logged_at);

  switch (frequency) {
    case "dagelijks":
      return toLocalDateString(loggedAt) !== getTodayDateString(referenceDate);
    case "wekelijks":
      return (
        startOfWeek(loggedAt).getTime() <
        startOfWeek(referenceDate).getTime()
      );
    case "maandelijks":
      return (
        loggedAt.getFullYear() !== referenceDate.getFullYear() ||
        loggedAt.getMonth() !== referenceDate.getMonth()
      );
    default:
      return false;
  }
}
