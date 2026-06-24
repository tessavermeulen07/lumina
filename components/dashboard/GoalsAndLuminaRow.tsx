import { AskLuminaSection } from "@/components/dashboard/AskLuminaSection";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import type { AiInsight, Question } from "@/lib/types/database";
import type { Goal } from "@/lib/types/goal";

interface GoalsAndLuminaRowProps {
  goals: Goal[];
  luminaQuestions: Question[];
  recentInsights: AiInsight[];
}

export function GoalsAndLuminaRow({
  goals,
  luminaQuestions,
  recentInsights,
}: Readonly<GoalsAndLuminaRowProps>) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
      <GoalsSection initialGoals={goals} />
      <AskLuminaSection
        questions={luminaQuestions}
        recentInsights={recentInsights}
      />
    </section>
  );
}
