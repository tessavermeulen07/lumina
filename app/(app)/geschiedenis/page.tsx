import { GeschiedenisView } from "@/components/history/GeschiedenisView";
import { getHistoryByWeek } from "@/lib/insights/get-history-by-week";

interface GeschiedenisPageProps {
  searchParams: Promise<{
    week?: string;
    entry?: string;
    tab?: "invoer" | "analyse";
  }>;
}

export default async function GeschiedenisPage({
  searchParams,
}: GeschiedenisPageProps) {
  const { week, entry, tab } = await searchParams;
  const weekData = await getHistoryByWeek(week);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-foreground">Geschiedenis</h1>
      <GeschiedenisView
        selectedEntryId={entry}
        selectedTab={tab ?? "invoer"}
        weekData={weekData}
      />
    </div>
  );
}
