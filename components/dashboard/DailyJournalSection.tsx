import { CheckInCard } from "@/components/dashboard/CheckInCard";
import { DailyJournalCarousel } from "@/components/dashboard/DailyJournalCarousel";
import { FollowUpPromptCard } from "@/components/dashboard/FollowUpPromptCard";
import type {
  DailyCheckInData,
  FollowUpPromptCardData,
} from "@/lib/types/dashboard-reflection";

interface DailyJournalSectionProps {
  checkInData: DailyCheckInData;
  followUpPrompts: FollowUpPromptCardData[];
}

export function DailyJournalSection({
  checkInData,
  followUpPrompts,
}: Readonly<DailyJournalSectionProps>) {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Dagelijkse reflectie
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CheckInCard data={checkInData.ochtend} />
          <CheckInCard data={checkInData.avond} />
        </div>
      </section>

      <DailyJournalCarousel title="Reflecteer verder">
        {followUpPrompts.length === 0 ? (
          <p className="min-w-[200px] text-sm text-muted">
            Schrijf je eerste reflectie om persoonlijke vervolgvragen te
            ontvangen.
          </p>
        ) : (
          followUpPrompts.map((prompt) => (
            <FollowUpPromptCard key={prompt.id} prompt={prompt} />
          ))
        )}
      </DailyJournalCarousel>
    </div>
  );
}
