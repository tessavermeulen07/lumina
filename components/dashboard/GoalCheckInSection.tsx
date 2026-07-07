import { GoalCheckInCard } from "@/components/dashboard/GoalCheckInCard";
import type { GoalCheckInData } from "@/lib/types/intention-checkin";

interface GoalCheckInSectionProps {
  checkIns: GoalCheckInData[];
}

export function GoalCheckInSection({
  checkIns,
}: Readonly<GoalCheckInSectionProps>) {
  if (checkIns.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Check-ins voor je doelen
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {checkIns.map((checkIn) => (
          <GoalCheckInCard key={checkIn.queueItemId ?? checkIn.id} data={checkIn} />
        ))}
      </div>
    </section>
  );
}

/** @deprecated Use GoalCheckInSection */
export const IntentionCheckInSection = GoalCheckInSection;
