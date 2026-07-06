"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { logIntentionCheckin } from "@/lib/habits/log-intention-checkin";
import type { GoalCheckInData } from "@/lib/types/intention-checkin";

interface GoalCheckInCardProps {
  data: GoalCheckInData;
}

export function GoalCheckInCard({ data }: Readonly<GoalCheckInCardProps>) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isHidden, setIsHidden] = useState(false);

  async function handleCheckin(status: "completed" | "skipped") {
    setError(null);

    const result = await logIntentionCheckin({
      habitId: data.id,
      status,
      aiCheckinPrompt: data.aiCheckinPrompt,
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setIsHidden(true);
    startTransition(() => {
      router.refresh();
    });
  }

  if (isHidden) {
    return null;
  }

  return (
    <article className="relative flex w-full flex-col items-center rounded-2xl border border-lumina-500/25 bg-surface p-6">
      <div className="mb-3 flex w-full items-center justify-between gap-2">
        <span className="rounded-full bg-lumina-500/10 px-2.5 py-0.5 text-xs font-medium text-lumina-500">
          {data.categoryLabel}
        </span>
      </div>

      <p className="w-full text-left text-xl font-semibold text-lumina-500">
        {data.name}
      </p>
      <p className="mt-2 w-full whitespace-pre-line text-left text-lg leading-relaxed text-foreground">
        {data.aiCheckinPrompt}
      </p>

      {error ? (
        <p className="mt-3 w-full text-left text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex w-full flex-wrap justify-center gap-2">
        <Button
          disabled={isPending}
          onClick={() => {
            void handleCheckin("completed");
          }}
          type="button"
          variant="primary"
        >
          Gedaan
        </Button>
        <Button
          disabled={isPending}
          onClick={() => {
            void handleCheckin("skipped");
          }}
          type="button"
          variant="outline"
        >
          Overgeslagen
        </Button>
        <Button disabled={isPending} href={data.href} variant="outline">
          Schrijf erover
        </Button>
      </div>
    </article>
  );
}

/** @deprecated Use GoalCheckInCard */
export const IntentionCheckInCard = GoalCheckInCard;
