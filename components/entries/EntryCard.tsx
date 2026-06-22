import Link from "next/link";
import type { EntryListItem } from "@/lib/entries/list-entries";

interface EntryCardProps {
  entry: EntryListItem;
}

function formatEntryDate(isoDate: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

function previewContent(content: string, maxLength = 120): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

export function EntryCard({ entry }: Readonly<EntryCardProps>) {
  return (
    <article className="rounded-2xl border border-lumina-500/25 bg-surface p-5 transition-colors hover:border-lumina-500/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <time className="text-sm text-muted" dateTime={entry.created_at}>
          {formatEntryDate(entry.created_at)}
        </time>
        {entry.has_ai_responses ? (
          <span className="rounded-full bg-lumina-500/10 px-3 py-1 text-xs font-medium text-lumina-500">
            Lumina heeft gereageerd
          </span>
        ) : null}
      </div>
      <p className="mt-2 leading-relaxed text-foreground">
        {previewContent(entry.content)}
      </p>
      <Link
        className="mt-4 inline-block text-sm font-medium text-lumina-500 transition-colors hover:text-lumina-700"
        href={`/schrijf?id=${entry.id}`}
      >
        Bewerken
      </Link>
    </article>
  );
}
