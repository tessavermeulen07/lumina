import { AskLuminaSection } from "@/components/dashboard/AskLuminaSection";
import { GoalsSection } from "@/components/dashboard/GoalsSection";

export function GoalsAndLuminaRow() {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
      <GoalsSection />
      <AskLuminaSection />
    </section>
  );
}
