"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EntryDetailModal } from "@/components/history/EntryDetailModal";
import { HistoryEntryCard } from "@/components/history/HistoryEntryCard";
import { HistoryWeekHeader } from "@/components/history/HistoryWeekHeader";
import { UnlockPrivateEntryDialog } from "@/components/journal/UnlockPrivateEntryDialog";
import { getEntryWithMeta } from "@/lib/entries/finalize-entry";
import { unlockPrivateEntry } from "@/lib/entries/unlock-private-entry";
import type { HistoryWeekData } from "@/lib/types/history";
import type { Entry, EntryAnalysis } from "@/lib/types/database";
import type { EntryBlock } from "@/lib/types/entry-blocks";

type DetailTab = "invoer" | "analyse";

interface GeschiedenisViewProps {
  weekData: HistoryWeekData;
  selectedEntryId?: string;
  selectedTab?: DetailTab;
}

interface ModalState {
  entry: Entry;
  blocks: EntryBlock[];
  analysis: EntryAnalysis | null;
  tab: DetailTab;
}

export function GeschiedenisView({
  weekData,
  selectedEntryId,
  selectedTab = "invoer",
}: Readonly<GeschiedenisViewProps>) {
  const router = useRouter();
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);
  const [unlockEntryId, setUnlockEntryId] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  function navigateWeek(weekStart: string | null) {
    const params = new URLSearchParams();

    if (weekStart) {
      params.set("week", weekStart);
    }

    const query = params.toString();
    router.push(query ? `/geschiedenis?${query}` : "/geschiedenis");
  }

  function buildWeekUrl(entryId?: string, tab?: DetailTab) {
    const params = new URLSearchParams();
    params.set("week", weekData.weekStart);

    if (entryId) {
      params.set("entry", entryId);
      params.set("tab", tab ?? "invoer");
    }

    return `/geschiedenis?${params.toString()}`;
  }

  async function openEntry(entryId: string, tab: DetailTab = "invoer") {
    const historyEntry = weekData.dayGroups
      .flatMap((group) => group.entries)
      .find((item) => item.id === entryId);

    if (historyEntry?.is_private && !historyEntry.is_unlocked) {
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
      tab,
    });

    router.replace(buildWeekUrl(entryId, tab), { scroll: false });
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
      tab: "invoer",
    });
    router.replace(buildWeekUrl(unlockEntryId, "invoer"), { scroll: false });
    router.refresh();
  }

  function closeModal() {
    setModalState(null);
    router.replace(buildWeekUrl(), { scroll: false });
  }

  useEffect(() => {
    if (selectedEntryId && !modalState && !isLoadingEntry && !unlockEntryId) {
      void openEntry(selectedEntryId, selectedTab);
    }
  }, [selectedEntryId, selectedTab]);

  return (
    <div className="space-y-8">
      <HistoryWeekHeader
        hasNextWeek={weekData.hasNextWeek}
        hasPreviousWeek={weekData.hasPreviousWeek}
        isCurrentWeek={weekData.isCurrentWeek}
        onNextWeek={() => {
          if (weekData.nextWeekStart) {
            navigateWeek(weekData.nextWeekStart);
          }
        }}
        onPreviousWeek={() => {
          if (weekData.previousWeekStart) {
            navigateWeek(weekData.previousWeekStart);
          }
        }}
        weekLabel={weekData.weekLabel}
      />

      {weekData.dayGroups.length === 0 ? (
        <p className="text-muted">Geen entries in deze week.</p>
      ) : (
        weekData.dayGroups.map((group) => (
          <section key={group.dateKey}>
            <h2 className="mb-3 text-sm font-medium text-muted">{group.label}</h2>
            <ul className="space-y-3">
              {group.entries.map((entry) => (
                <li key={entry.id}>
                  <HistoryEntryCard
                    entry={entry}
                    onOpen={(entryId) => {
                      void openEntry(entryId);
                    }}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {modalState ? (
        <EntryDetailModal
          analysis={modalState.analysis}
          blocks={modalState.blocks}
          entry={modalState.entry}
          initialTab={modalState.tab}
          onClose={closeModal}
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
