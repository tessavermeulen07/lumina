import { DailyJournalCarousel } from "@/components/dashboard/DailyJournalCarousel";
import { PromptCard } from "@/components/dashboard/PromptCard";
import { Button } from "@/components/ui/Button";
import { samplePrompts } from "@/lib/mock/dashboard";

export function DailyJournalSection() {
  return (
    <DailyJournalCarousel title="Dagelijkse reflectie">
      <article className="min-w-[280px] max-w-[320px] shrink-0 snap-start rounded-2xl border border-lumina-500/25 bg-surface p-6">
        <p className="text-sm font-medium text-lumina-500">Dagelijkse check-in</p>
        <p className="mt-2 text-lg text-foreground">Hoe voel je je vandaag?</p>
        <p className="mt-2 leading-relaxed text-muted">
          Neem een moment om bij jezelf te checken. Een paar zinnen zijn genoeg.
        </p>
        <div className="mt-4">
          <Button href="/schrijf" variant="outline">
            Schrijf je check-in
          </Button>
        </div>
      </article>

      {samplePrompts.map((prompt) => (
        <PromptCard key={prompt.id} text={prompt.text} />
      ))}
    </DailyJournalCarousel>
  );
}
