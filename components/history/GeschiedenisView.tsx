"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EntryDetailModal } from "@/components/history/EntryDetailModal";
import { HistoryEntryCard } from "@/components/history/HistoryEntryCard";
import { HistoryWeekHeader } from "@/components/history/HistoryWeekHeader";
import { getEntryWithMeta } from "@/lib/entries/finalize-entry";
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

  function navigateWeek(weekStart: string | null) {
    const params = new URLSearchParams();

    if (weekStart) {
      params.set("week", weekStart);
    }

    const query = params.toString();
    router.push(query ? `/geschiedenis?${query}` : "/geschiedenis");
  }

  async function openEntry(entryId: string, tab: DetailTab = "invoer") {
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

    const params = new URLSearchParams();
    params.set("week", weekData.weekStart);
    params.set("entry", entryId);
    params.set("tab", tab);
    router.replace(`/geschiedenis?${params.toString()}`, { scroll: false });
  }

  function closeModal() {
    setModalState(null);
    const params = new URLSearchParams();
    params.set("week", weekData.weekStart);
    router.replace(`/geschiedenis?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    if (selectedEntryId && !modalState && !isLoadingEntry) {
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

      {isLoadingEntry ? (
        <p className="text-sm text-muted">Entry laden…</p>
      ) : null}
    </div>
  );
}
