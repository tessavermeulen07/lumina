import { AskLuminaSection } from "@/components/dashboard/AskLuminaSection";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import type { LuminaDashboardQuestion } from "@/lib/ai/lumina-dashboard-question";
import type { Goal, GoalCategoryOption } from "@/lib/types/goal";

interface GoalsAndLuminaRowProps {
  goals: Goal[];
  categories: GoalCategoryOption[];
  questions: LuminaDashboardQuestion[];
}

export function GoalsAndLuminaRow({
  goals,
  categories,
  questions,
}: Readonly<GoalsAndLuminaRowProps>) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
      <GoalsSection categories={categories} initialGoals={goals} />
      <AskLuminaSection questions={questions} />
    </section>
  );
}
