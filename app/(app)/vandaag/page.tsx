import { DailyJournalSection } from "@/components/dashboard/DailyJournalSection";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { GoalsAndLuminaRow } from "@/components/dashboard/GoalsAndLuminaRow";
import { getDashboardOverview } from "@/lib/mock/dashboard";

export default function VandaagPage() {
  const overview = getDashboardOverview();

  return (
    <div className="space-y-10">
      <DashboardOverview data={overview} />
      <DailyJournalSection />
      <GoalsAndLuminaRow />
    </div>
  );
}
