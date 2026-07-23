import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { BewaardView } from "@/components/bookmarks/BewaardView";
import { fetchBookmarkedItems } from "@/lib/queries/entries-actions";
import { getQueryClient } from "@/lib/queries/get-query-client";
import { queryKeys } from "@/lib/queries/keys";

export default async function BewaardPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.bookmarks.list(),
    queryFn: () => fetchBookmarkedItems(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <h1 className="font-serif text-3xl text-foreground">Bewaard</h1>
        <BewaardView />
      </div>
    </HydrationBoundary>
  );
}
