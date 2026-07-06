import { BewaardView } from "@/components/bookmarks/BewaardView";
import { getBookmarkedItems } from "@/lib/bookmarks/get-bookmarked-items";

export default async function BewaardPage() {
  const items = await getBookmarkedItems();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-foreground">Bewaard</h1>
      <BewaardView items={items} />
    </div>
  );
}
