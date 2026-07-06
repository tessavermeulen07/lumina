"use client";

import { useState } from "react";
import { BookmarkedItemCard } from "@/components/bookmarks/BookmarkedItemCard";
import { EntryDetailModal } from "@/components/history/EntryDetailModal";
import { UnlockPrivateEntryDialog } from "@/components/journal/UnlockPrivateEntryDialog";
import { getEntryWithMeta } from "@/lib/entries/finalize-entry";
import { unlockPrivateEntry } from "@/lib/entries/unlock-private-entry";
import type { BookmarkedItem } from "@/lib/types/bookmarks";
import type { Entry, EntryAnalysis } from "@/lib/types/database";
import type { EntryBlock } from "@/lib/types/entry-blocks";

interface BewaardViewProps {
  items: BookmarkedItem[];
}

interface ModalState {
  entry: Entry;
  blocks: EntryBlock[];
  analysis: EntryAnalysis | null;
}

export function BewaardView({ items }: Readonly<BewaardViewProps>) {
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [unlockEntryId, setUnlockEntryId] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);

  async function openEntry(entryId: string) {
    const item = items.find(
      (bookmark) => bookmark.kind === "entry" && bookmark.id === entryId,
    );

    if (
      item?.kind === "entry" &&
      item.isPrivate &&
      !item.isUnlocked
    ) {
      setUnlockEntryId(entryId);
      setUnlockError(null);
      return;
    }

    setIsLoadingEntry(true);
    const data = await getEntryWithMeta(entryId);
    setIsLoadingEntry(false);

    if (!data) {
      return;
    }

    setModalState({
      entry: data.entry,
      blocks: data.blocks,
      analysis: data.analysis,
    });
  }

  async function handleUnlock(password: string) {
    if (!unlockEntryId) {
      return;
    }

    setIsUnlocking(true);
    setUnlockError(null);

    const result = await unlockPrivateEntry(unlockEntryId, password);

    setIsUnlocking(false);

    if ("error" in result) {
      setUnlockError(result.error);
      return;
    }

    setUnlockEntryId(null);
    setModalState({
      entry: result.entry,
      blocks: result.blocks,
      analysis: result.analysis,
    });
  }

  if (items.length === 0) {
    return <p className="text-muted">Je hebt nog niets bewaard.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <BookmarkedItemCard
              item={item}
              onOpenEntry={(entryId) => {
                void openEntry(entryId);
              }}
            />
          </li>
        ))}
      </ul>

      {modalState ? (
        <EntryDetailModal
          analysis={modalState.analysis}
          blocks={modalState.blocks}
          entry={modalState.entry}
          initialTab="invoer"
          onClose={() => setModalState(null)}
        />
      ) : null}

      <UnlockPrivateEntryDialog
        error={unlockError}
        isLoading={isUnlocking}
        isOpen={unlockEntryId !== null}
        onClose={() => {
          setUnlockEntryId(null);
          setUnlockError(null);
        }}
        onUnlock={(password) => {
          void handleUnlock(password);
        }}
      />

      {isLoadingEntry ? (
        <p className="text-sm text-muted">Entry laden…</p>
      ) : null}
    </div>
  );
}
