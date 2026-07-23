"use client";

import { useEffect, useState } from "react";
import { AddGoalModal } from "@/components/dashboard/AddGoalModal";
import { Button } from "@/components/ui/Button";
import { useGoalMutations, useGoals } from "@/lib/queries/use-goals";
import { getFrequencyLabel } from "@/lib/types/goal";

function formatDutchDate(dateString: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
}

export function GoalsSection() {
  const { data: goals = [], isLoading, isError } = useGoals();
  const { createGoal, removeGoal, logGoalCheckin, isPending } = useGoalMutations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.hash !== "#doelen") {
      return;
    }

    document.getElementById("doelen")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  async function handleAdd(
    goal: Parameters<typeof createGoal.mutateAsync>[0],
  ) {
    setError(null);
    const result = await createGoal.mutateAsync(goal);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setIsModalOpen(false);
  }

  async function handleDelete(id: string) {
    setError(null);
    const result = await removeGoal.mutateAsync(id);

    if ("error" in result) {
      setError(result.error);
    }
  }

  async function handleGoalCheckin(
    goalId: string,
    status: "completed" | "skipped",
    queueItemId?: string,
  ) {
    setError(null);
    const result = await logGoalCheckin.mutateAsync({
      habitId: goalId,
      queueItemId,
      status,
    });

    if ("error" in result) {
      setError(result.error);
    }
  }

  return (
    <>
      <section className="scroll-mt-8 space-y-4" id="doelen">
        <h2 className="text-lg font-semibold text-foreground md:text-xl">Doelen</h2>

        <article className="rounded-2xl border border-lumina-500/25 bg-surface p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-muted">
              Wat wil je vandaag bewust aandacht aan geven?
            </p>

            <Button
              className="shrink-0 gap-1.5 px-4"
              disabled={isPending}
              onClick={() => setIsModalOpen(true)}
              type="button"
              variant="outline"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
              Voeg toe
            </Button>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {isError ? (
            <p className="mt-6 text-sm text-red-600" role="alert">
              Doelen konden niet worden geladen.
            </p>
          ) : isLoading ? (
            <p className="mt-6 text-sm text-muted">Doelen laden…</p>
          ) : goals.length === 0 ? (
            <p className="mt-6 text-sm text-muted">Voeg een doel toe.</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {goals.map((goal) => (
                <li
                  key={goal.id}
                  className="rounded-xl border border-lumina-500/15 bg-background px-4 py-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-medium text-foreground">{goal.name}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted">
                        {goal.categoryLabel}
                      </span>
                      <span className="text-xs text-muted">
                        {getFrequencyLabel(goal.frequency)}
                      </span>
                    </div>
                  </div>
                  {goal.description ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {goal.description}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted">
                    Einddatum: {formatDutchDate(goal.windowEndDate)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-end gap-1.5">
                    <button
                      className="inline-flex h-[18px] items-center justify-center rounded-full border border-lumina-500/25 px-2 text-[11px] leading-none text-foreground transition-colors hover:border-lumina-500 hover:bg-lumina-300/15 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isPending}
                      onClick={() => {
                        void handleGoalCheckin(
                          goal.id,
                          "completed",
                          goal.queueItemId,
                        );
                      }}
                      type="button"
                    >
                      Gedaan
                    </button>
                    <button
                      className="inline-flex h-[18px] items-center justify-center rounded-full border border-lumina-500/25 px-2 text-[11px] leading-none text-foreground transition-colors hover:border-lumina-500 hover:bg-lumina-300/15 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isPending}
                      onClick={() => {
                        void handleGoalCheckin(
                          goal.id,
                          "skipped",
                          goal.queueItemId,
                        );
                      }}
                      type="button"
                    >
                      Overgeslagen
                    </button>
                    <button
                      className="inline-flex h-[18px] items-center justify-center rounded-full border border-lumina-500/25 px-2 text-[11px] leading-none text-foreground transition-colors hover:border-lumina-500 hover:bg-lumina-300/15 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isPending}
                      onClick={() => {
                        void handleDelete(goal.id);
                      }}
                      type="button"
                    >
                      Verwijder
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <AddGoalModal
        isOpen={isModalOpen}
        onAdd={(goal) => {
          void handleAdd(goal);
        }}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
