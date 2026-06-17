"use client";

import { useState } from "react";
import { AddGoalModal } from "@/components/dashboard/AddGoalModal";
import { Button } from "@/components/ui/Button";
import { getFrequencyLabel, type Goal } from "@/lib/types/goal";

export function GoalsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);

  function handleAdd(goal: Omit<Goal, "id">) {
    setGoals((current) => [
      ...current,
      { ...goal, id: crypto.randomUUID() },
    ]);
  }

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Intenties</h2>

        <article className="rounded-2xl border border-lumina-500/25 bg-surface p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-muted">
              Wat wil je vandaag bewust aandacht aan geven?
            </p>

            <Button
              className="shrink-0 gap-1.5 px-4"
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

          {goals.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              Voeg een intentie toe.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {goals.map((goal) => (
                <li
                  key={goal.id}
                  className="rounded-xl border border-lumina-500/15 bg-background px-4 py-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-medium text-foreground">{goal.name}</p>
                    <span className="shrink-0 text-xs text-muted">
                      {getFrequencyLabel(goal.frequency)}
                    </span>
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
        isOpen={isModalOpen}
        onAdd={handleAdd}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
