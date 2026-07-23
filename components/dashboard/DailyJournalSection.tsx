"use client";

import { CheckInCard } from "@/components/dashboard/CheckInCard";
import { DailyJournalCarousel } from "@/components/dashboard/DailyJournalCarousel";
import { FollowUpPromptCard } from "@/components/dashboard/FollowUpPromptCard";
import { useFollowUpPrompts } from "@/lib/queries/use-prompts";
import type { DailyCheckInData } from "@/lib/types/dashboard-reflection";

interface DailyJournalSectionProps {
  checkInData: DailyCheckInData;
}

export function DailyJournalSection({
  checkInData,
}: Readonly<DailyJournalSectionProps>) {
  const { data: followUpPrompts = [], isLoading, isError } = useFollowUpPrompts();

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground md:text-xl">
          Dagelijkse reflectie
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CheckInCard data={checkInData.ochtend} />
          <CheckInCard data={checkInData.avond} />
        </div>
      </section>

      <DailyJournalCarousel title="Reflecteer verder">
        {isLoading ? (
          <p className="min-w-[200px] text-sm text-muted">Vervolgvragen laden…</p>
        ) : isError ? (
          <p className="min-w-[200px] text-sm text-red-600" role="alert">
            Vervolgvragen konden niet worden geladen.
          </p>
        ) : followUpPrompts.length === 0 ? (
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
