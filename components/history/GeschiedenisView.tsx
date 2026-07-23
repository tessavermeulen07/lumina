"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { EntryDetailModal } from "@/components/history/EntryDetailModal";
import { HistoryEntryCard } from "@/components/history/HistoryEntryCard";
import { HistoryWeekHeader } from "@/components/history/HistoryWeekHeader";
import { UnlockPrivateEntryDialog } from "@/components/journal/UnlockPrivateEntryDialog";
import { useEntryMutations } from "@/lib/queries/use-entries";
import { useHistoryWeek } from "@/lib/queries/use-history";
import type { Entry, EntryAnalysis } from "@/lib/types/database";
import type { EntryBlock } from "@/lib/types/entry-blocks";

type DetailTab = "invoer" | "analyse";

interface ModalState {
  entry: Entry;
  blocks: EntryBlock[];
  analysis: EntryAnalysis | null;
  tab: DetailTab;
}

function GeschiedenisViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekStart = searchParams.get("week") ?? undefined;
  const selectedEntryId = searchParams.get("entry") ?? undefined;
  const selectedTab = (searchParams.get("tab") as DetailTab | null) ?? "invoer";
  const { data: weekData, isLoading, isError } = useHistoryWeek(weekStart);
  const { fetchEntryDetail, unlockPrivate } = useEntryMutations();
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);
  const [unlockEntryId, setUnlockEntryId] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  function navigateWeek(nextWeekStart: string | null) {
    const params = new URLSearchParams();

    if (nextWeekStart) {
      params.set("week", nextWeekStart);
    }

    const query = params.toString();
    router.push(query ? `/geschiedenis?${query}` : "/geschiedenis");
  }

  function buildWeekUrl(entryId?: string, tab?: DetailTab) {
    if (!weekData) {
      return "/geschiedenis";
    }

    const params = new URLSearchParams();
    params.set("week", weekData.weekStart);

    if (entryId) {
      params.set("entry", entryId);
      params.set("tab", tab ?? "invoer");
    }

    return `/geschiedenis?${params.toString()}`;
  }

  async function openEntry(entryId: string, tab: DetailTab = "invoer") {
    if (!weekData) {
      return;
    }

    const historyEntry = weekData.dayGroups
      .flatMap((group) => group.entries)
      .find((item) => item.id === entryId);

    if (historyEntry?.is_private && !historyEntry.is_unlocked) {
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
        tab,
      });

      router.replace(buildWeekUrl(entryId, tab), { scroll: false });
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

    const unlockedEntryId = unlockEntryId;
    setUnlockEntryId(null);
    setModalState({
      entry: result.entry,
      blocks: result.blocks,
      analysis: result.analysis,
      tab: "invoer",
    });
    router.replace(buildWeekUrl(unlockedEntryId, "invoer"), { scroll: false });
  }

  function closeModal() {
    setModalState(null);
    router.replace(buildWeekUrl(), { scroll: false });
  }

  useEffect(() => {
    if (selectedEntryId && !modalState && !isLoadingEntry && !unlockEntryId && weekData) {
      void openEntry(selectedEntryId, selectedTab);
    }
  }, [selectedEntryId, selectedTab, weekData]);

  if (isLoading || !weekData) {
    return <p className="text-muted">Geschiedenis laden…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Geschiedenis kon niet worden geladen.
      </p>
    );
  }

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

export function GeschiedenisView() {
  return (
    <Suspense fallback={<p className="text-muted">Geschiedenis laden…</p>}>
      <GeschiedenisViewContent />
    </Suspense>
  );
}
