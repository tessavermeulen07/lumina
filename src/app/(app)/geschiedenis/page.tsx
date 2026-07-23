import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { GeschiedenisView } from "@/components/features/history/GeschiedenisView";
import { fetchHistoryByWeek } from "@/lib/queries/dashboard-actions";
import { getQueryClient } from "@/lib/queries/get-query-client";
import { queryKeys } from "@/lib/queries/keys";

export default async function GeschiedenisPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.history.week(undefined),
    queryFn: () => fetchHistoryByWeek(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <h1 className="font-serif text-3xl text-foreground">Geschiedenis</h1>
        <GeschiedenisView />
      </div>
    </HydrationBoundary>
  );
}
