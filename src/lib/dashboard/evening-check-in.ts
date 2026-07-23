export const EVENING_CHECK_IN_HOUR = 18;

export function isEveningCheckInAvailable(
  referenceDate = new Date(),
): boolean {
  return referenceDate.getHours() >= EVENING_CHECK_IN_HOUR;
}
