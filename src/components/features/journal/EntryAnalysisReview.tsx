"use client";

import { useRouter } from "next/navigation";
import { EntryAnalysisContent } from "@/components/features/history/EntryAnalysisContent";
import { Button } from "@/components/ui/Button";
import type { EntryAnalysis } from "@/types/database";

interface EntryAnalysisReviewProps {
  analysis: EntryAnalysis;
}

export function EntryAnalysisReview({
  analysis,
}: Readonly<EntryAnalysisReviewProps>) {
  const router = useRouter();

  return (
    <section className="mx-auto max-w-prose px-2 py-12">
      <p className="text-sm text-lumina-500">Je entry is opgeslagen</p>
      <h1 className="mt-2 font-serif text-3xl text-foreground">
        Lumina&apos;s analyse
      </h1>
      <p className="mt-2 text-muted">
        Neem even de tijd om je reflectie te lezen voordat je verdergaat.
      </p>

      <div className="mt-10">
        <EntryAnalysisContent analysis={analysis} />
      </div>

      <div className="mt-12 flex justify-end">
        <Button
          onClick={() => router.push("/vandaag")}
          variant="dark"
        >
          Ga verder
        </Button>
      </div>
    </section>
  );
}
