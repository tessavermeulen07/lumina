"use client";

import Link from "next/link";
import { formatEntryTime } from "@/lib/insights/history-format";
import type { HistoryEntryItem } from "@/lib/types/history";

interface HistoryEntryCardProps {
  entry: HistoryEntryItem;
  onOpen: (entryId: string) => void;
}

export function HistoryEntryCard({
  entry,
  onOpen,
}: Readonly<HistoryEntryCardProps>) {
  const time = formatEntryTime(entry.created_at);

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
          <time className="shrink-0 text-sm text-lumina-500">{time}</time>
        </div>
        <Link
          className="mt-3 inline-flex text-sm font-medium text-lumina-700 hover:text-lumina-900 dark:text-lumina-300"
          href={`/schrijf?id=${entry.id}`}
        >
          Verder schrijven
        </Link>
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
        <time className="shrink-0 text-sm text-lumina-500">{time}</time>
      </div>
    </button>
  );
}
