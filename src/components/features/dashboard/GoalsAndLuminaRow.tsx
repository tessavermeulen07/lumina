import { AskLuminaSection } from "@/components/features/dashboard/AskLuminaSection";
import { GoalsSection } from "@/components/features/dashboard/GoalsSection";
import type { LuminaDashboardQuestion } from "@/lib/ai/lumina-dashboard-question";

interface GoalsAndLuminaRowProps {
  questions: LuminaDashboardQuestion[];
}

export function GoalsAndLuminaRow({
  questions,
}: Readonly<GoalsAndLuminaRowProps>) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
      <GoalsSection />
      <AskLuminaSection questions={questions} />
    </section>
  );
}
