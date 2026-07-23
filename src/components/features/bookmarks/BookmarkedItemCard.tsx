"use client";

import { useRouter } from "next/navigation";
import { LockIcon } from "@/components/features/journal/WritingToolbarIcons";
import type { BookmarkedItem } from "@/types/bookmarks";

interface BookmarkedItemCardProps {
  item: BookmarkedItem;
  onOpenEntry: (entryId: string) => void;
}

export function BookmarkedItemCard({
  item,
  onOpenEntry,
}: Readonly<BookmarkedItemCardProps>) {
  const router = useRouter();
  const kindLabel = item.kind === "entry" ? "Entry" : "Prompt";
  const isLocked = item.kind === "entry" && item.isPrivate && !item.isUnlocked;

  function handleClick() {
    if (item.kind === "prompt") {
      router.push(`/schrijf?vervolg=${item.id}`);
      return;
    }

    onOpenEntry(item.id);
  }

  return (
    <button
      className="w-full rounded-xl border border-lumina-500/20 bg-surface px-4 py-4 text-left transition-colors hover:border-lumina-500/40 hover:bg-lumina-500/5"
      onClick={handleClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isLocked ? (
            <div className="flex items-center gap-2">
              <LockIcon />
              <p className="font-medium text-foreground">Privé entry</p>
            </div>
          ) : item.title ? (
            <p className="font-medium text-foreground">{item.title}</p>
          ) : null}
          <p className="mt-1 line-clamp-3 text-sm text-muted">
            {isLocked
              ? "Voer je wachtwoord in om deze entry te bekijken."
              : item.summary}
          </p>
        </div>
        <span className="shrink-0 text-xs text-lumina-500">{kindLabel}</span>
      </div>
    </button>
  );
}
