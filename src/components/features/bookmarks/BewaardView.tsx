"use client";

import { useState } from "react";
import { BookmarkedItemCard } from "@/components/features/bookmarks/BookmarkedItemCard";
import { EntryDetailModal } from "@/components/features/history/EntryDetailModal";
import { UnlockPrivateEntryDialog } from "@/components/features/journal/UnlockPrivateEntryDialog";
import { useBookmarkedItems, useEntryMutations } from "@/hooks/use-entries";
import type { Entry, EntryAnalysis } from "@/types/database";
import type { EntryBlock } from "@/types/entry-blocks";

interface ModalState {
  entry: Entry;
  blocks: EntryBlock[];
  analysis: EntryAnalysis | null;
}

export function BewaardView() {
  const { data: items = [], isLoading, isError } = useBookmarkedItems();
  const { fetchEntryDetail, unlockPrivate } = useEntryMutations();
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [unlockEntryId, setUnlockEntryId] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);
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

    try {
      const data = await fetchEntryDetail(entryId);

      if (!data) {
        return;
      }

      setModalState({
        entry: data.entry,
        blocks: data.blocks,
        analysis: data.analysis,
      });
    } finally {
      setIsLoadingEntry(false);
    }
  }

  async function handleUnlock(password: string) {
    if (!unlockEntryId) {
      return;
    }

    setUnlockError(null);

    const result = await unlockPrivate.mutateAsync({
      entryId: unlockEntryId,
      password,
    });

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

  if (isLoading) {
    return <p className="text-muted">Bewaarde items laden…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Bewaarde items konden niet worden geladen.
      </p>
    );
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
        isLoading={unlockPrivate.isPending}
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
