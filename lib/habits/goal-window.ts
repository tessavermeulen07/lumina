import { toLocalDateString } from "@/lib/data/week-utils";
import type { GoalFrequency } from "@/lib/types/goal";

export interface GoalWindow {
  startDate: string;
  endDate: string;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function fromDateString(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getInitialGoalWindow(
  frequency: GoalFrequency,
  referenceDate = new Date(),
): GoalWindow {
  const start = toLocalDateString(referenceDate);

  if (frequency === "wekelijks") {
    return {
      startDate: start,
      endDate: toLocalDateString(addDays(referenceDate, 6)),
    };
  }

  if (frequency === "maandelijks") {
    return {
      startDate: start,
      endDate: toLocalDateString(endOfMonth(referenceDate)),
    };
  }

  return {
    startDate: start,
    endDate: start,
  };
}

export function getNextGoalWindow(
  frequency: GoalFrequency,
  currentEndDate: string,
): GoalWindow {
  const nextStartDate = addDays(fromDateString(currentEndDate), 1);
  return getInitialGoalWindow(frequency, nextStartDate);
}
