"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { EntryAnalysisContent } from "@/components/history/EntryAnalysisContent";
import { JournalFlow } from "@/components/journal/JournalFlow";
import { Button } from "@/components/ui/Button";
import { formatEntryDateCompact } from "@/lib/insights/history-format";
import type { Entry, EntryAnalysis } from "@/lib/types/database";
import type { EntryBlock } from "@/lib/types/entry-blocks";

type DetailTab = "invoer" | "analyse";

interface EntryDetailModalProps {
  entry: Entry;
  blocks: EntryBlock[];
  analysis: EntryAnalysis | null;
  initialTab: DetailTab;
  onClose: () => void;
}

function tabClass(isActive: boolean): string {
  const base =
    "border-b-2 pb-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lumina-500";

  return isActive
    ? `${base} border-lumina-500 text-foreground`
    : `${base} border-transparent text-muted hover:text-foreground`;
}

export function EntryDetailModal({
  entry,
  blocks,
  analysis,
  initialTab,
  onClose,
}: Readonly<EntryDetailModalProps>) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  function setTab(tab: DetailTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("entry", entry.id);
    params.set("tab", tab);
    router.replace(`/geschiedenis?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Sluit dialoog"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
        type="button"
      />

      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-lumina-500/25 bg-surface shadow-lg"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-detail-title"
      >
        <div className="border-b border-lumina-500/15 px-6 pt-6">
          <div className="flex items-start justify-between gap-4">
            <nav aria-label="Entry tabs" className="flex gap-6">
              <button
                className={tabClass(activeTab === "invoer")}
                onClick={() => setTab("invoer")}
                type="button"
              >
                Invoer
              </button>
              <button
                className={tabClass(activeTab === "analyse")}
                disabled={!analysis}
                onClick={() => setTab("analyse")}
                type="button"
              >
                Analyse
              </button>
            </nav>
            <button
              aria-label="Sluiten"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-lumina-500/10 hover:text-foreground"
              onClick={handleClose}
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === "invoer" ? (
            <div>
              <div className="flex justify-end">
                <time
                  className="text-sm text-lumina-500 tracking-wide [font-variant:small-caps]"
                  dateTime={entry.created_at}
                >
                  {formatEntryDateCompact(entry.created_at)}
                </time>
              </div>
              <div className="mt-6">
                <JournalFlow
                  aiError={null}
                  aiLoadingAfterBlockId={null}
                  aiStatus="idle"
                  aiStatusMessage={null}
                  blocks={blocks}
                  focusBlockId={null}
                  isAiLoading={false}
                  readOnly
                />
              </div>
            </div>
          ) : analysis ? (
            <EntryAnalysisContent analysis={analysis} frameReflection />
          ) : (
            <p className="text-muted">
              Deze entry heeft nog geen analyse. Rond je entry af via schrijven.
            </p>
          )}
        </div>

        <div className="flex justify-end border-t border-lumina-500/15 px-6 py-4">
          <Button href={`/schrijf?id=${entry.id}`} variant="outline">
            Bewerken
          </Button>
        </div>
      </div>
    </div>
  );
}
