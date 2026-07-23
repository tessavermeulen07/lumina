"use client";

import { BookmarkFilledIcon, LockIcon } from "@/components/features/journal/WritingToolbarIcons";
import { formatEntryTime } from "@/lib/insights/history-format";
import type { HistoryEntryItem } from "@/types/history";

interface HistoryEntryCardProps {
  entry: HistoryEntryItem;
  onOpen: (entryId: string) => void;
}

function EntryCardMeta({
  createdAt,
  isBookmarked,
}: Readonly<{ createdAt: string; isBookmarked: boolean }>) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <time className="text-sm text-lumina-500">{formatEntryTime(createdAt)}</time>
      {isBookmarked ? (
        <span
          aria-hidden="true"
          className="inline-flex h-6 w-6 items-center justify-center text-lumina-500"
          title="Gebookmarkt"
        >
          <BookmarkFilledIcon />
        </span>
      ) : null}
    </div>
  );
}

export function HistoryEntryCard({
  entry,
  onOpen,
}: Readonly<HistoryEntryCardProps>) {
  const isLocked = entry.is_private && !entry.is_unlocked;

  if (isLocked) {
    return (
      <button
        className="w-full rounded-xl border border-lumina-500/20 bg-surface px-4 py-4 text-left transition-colors hover:border-lumina-500/40 hover:bg-lumina-500/5"
        onClick={() => onOpen(entry.id)}
        type="button"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <LockIcon />
              <p className="font-medium text-foreground">Privé entry</p>
            </div>
            <p className="mt-1 text-sm text-muted">
              Voer je wachtwoord in om deze entry te bekijken.
            </p>
          </div>
          <EntryCardMeta
            createdAt={entry.created_at}
            isBookmarked={entry.is_bookmarked}
          />
        </div>
      </button>
    );
  }

  if (!entry.analysis) {
    return (
      <div className="rounded-xl border border-lumina-500/20 bg-surface px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-foreground">Concept — nog niet afgerond</p>
            <p className="mt-1 text-sm text-muted">
              Rond je entry af om een analyse te krijgen.
            </p>
          </div>
          <EntryCardMeta
            createdAt={entry.created_at}
            isBookmarked={entry.is_bookmarked}
          />
        </div>
        <a
          className="mt-3 inline-flex text-sm font-medium text-lumina-700 hover:text-lumina-900 dark:text-lumina-300"
          href={`/schrijf?id=${entry.id}`}
        >
          Verder schrijven
        </a>
      </div>
    );
  }

  return (
    <button
      className="w-full rounded-xl border border-lumina-500/20 bg-surface px-4 py-4 text-left transition-colors hover:border-lumina-500/40 hover:bg-lumina-500/5"
      onClick={() => onOpen(entry.id)}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{entry.analysis.title}</p>
          <p className="mt-1 line-clamp-3 text-sm text-muted">
            {entry.analysis.summary}
          </p>
        </div>
        <EntryCardMeta
          createdAt={entry.created_at}
          isBookmarked={entry.is_bookmarked}
        />
      </div>
    </button>
  );
}
