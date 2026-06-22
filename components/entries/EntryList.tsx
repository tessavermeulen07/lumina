import { EntryCard } from "@/components/entries/EntryCard";
import type { EntryListItem } from "@/lib/entries/list-entries";

interface EntryListProps {
  entries: EntryListItem[];
}

export function EntryList({ entries }: Readonly<EntryListProps>) {
  if (entries.length === 0) {
    return (
      <p className="max-w-prose leading-relaxed text-muted">
        Je eerdere reflecties verschijnen hier. Begin met schrijven om je eerste
        entry toe te voegen.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry) => (
        <li key={entry.id}>
          <EntryCard entry={entry} />
        </li>
      ))}
    </ul>
  );
}
