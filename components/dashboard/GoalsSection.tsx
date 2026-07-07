"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AddGoalModal } from "@/components/dashboard/AddGoalModal";
import { Button } from "@/components/ui/Button";
import { deleteIntention } from "@/lib/habits/delete-intention";
import { saveGoal } from "@/lib/habits/save-intention";
import {
  getFrequencyLabel,
  type Goal,
  type GoalCategoryOption,
} from "@/lib/types/goal";

interface GoalsSectionProps {
  initialGoals: Goal[];
  categories: GoalCategoryOption[];
}

export function GoalsSection({
  initialGoals,
  categories,
}: Readonly<GoalsSectionProps>) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goals, setGoals] = useState(initialGoals);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setGoals(initialGoals);
  }, [initialGoals]);

  async function handleAdd(goal: Omit<Goal, "id" | "categoryLabel">) {
    setError(null);
    const result = await saveGoal(goal);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    const categoryLabel =
      categories.find((category) => category.value === goal.category)?.label ??
      "Overig";

    setGoals((current) => [
      ...current,
      { ...goal, id: result.id, categoryLabel },
    ]);
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDelete(id: string) {
    setError(null);
    const result = await deleteIntention(id);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setGoals((current) => current.filter((goal) => goal.id !== id));
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <>
      <section className="space-y-4">
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

          {goals.length === 0 ? (
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
                      <button
                        aria-label={`Verwijder doel ${goal.name}`}
                        className="text-xs text-muted transition-colors hover:text-foreground"
                        disabled={isPending}
                        onClick={() => {
                          void handleDelete(goal.id);
                        }}
                        type="button"
                      >
                        Verwijder
                      </button>
                    </div>
                  </div>
                  {goal.description ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {goal.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <AddGoalModal
        categories={categories}
        isOpen={isModalOpen}
        onAdd={(goal) => {
          void handleAdd(goal);
        }}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
