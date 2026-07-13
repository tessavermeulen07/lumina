import {
  DEFAULT_TIMEZONE,
  getDateStringInTimezone,
  hasPassedTimeInTimezone,
} from "@/lib/utils/user-timezone";

/** @deprecated Use getDateStringInTimezone with profile timezone */
export function getAmsterdamDateString(referenceDate = new Date()): string {
  return getDateStringInTimezone(DEFAULT_TIMEZONE, referenceDate);
}

/** @deprecated Use hasPassedTimeInTimezone with profile timezone */
export function hasPassedAmsterdamTime(
  targetTime: string | null | undefined,
  referenceDate = new Date(),
): boolean {
  return hasPassedTimeInTimezone(targetTime, DEFAULT_TIMEZONE, referenceDate);
}
