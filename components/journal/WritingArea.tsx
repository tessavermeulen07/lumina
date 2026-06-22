"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EntryAnalysisReview } from "@/components/journal/EntryAnalysisReview";
import { JournalFlow } from "@/components/journal/JournalFlow";
import { ImageUploadModal } from "@/components/journal/ImageUploadModal";
import { WritingToolbar } from "@/components/journal/WritingToolbar";
import { respondToEntryAction } from "@/lib/ai/respond-to-entry";
import {
  createEntryWithUserBlock,
  saveUserBlock,
} from "@/lib/entries/entry-blocks";
import { deleteEntry } from "@/lib/entries/delete-entry";
import { finalizeEntry } from "@/lib/entries/finalize-entry";
import {
  createLocalUserBlock,
  getActiveUserBlock,
  hasUserText,
  type EntryBlock,
} from "@/lib/types/entry-blocks";
import type { EntryAnalysis } from "@/lib/types/database";

const AUTO_SAVE_DELAY_MS = 1500;
const SAVED_STATUS_RESET_MS = 2000;

type DraftStatus = "idle" | "saving" | "saved" | "error";

interface WritingAreaProps {
  hint: string;
  initialEntryId?: string | null;
  initialBlocks?: EntryBlock[];
}

export function WritingArea({
  hint,
  initialEntryId = null,
  initialBlocks,
}: Readonly<WritingAreaProps>) {
  const [blocks, setBlocks] = useState<EntryBlock[]>(
    initialBlocks ?? [createLocalUserBlock()],
  );
  const [entryId, setEntryId] = useState<string | null>(initialEntryId);
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [reviewAnalysis, setReviewAnalysis] = useState<EntryAnalysis | null>(
    null,
  );
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLoadingAfterBlockId, setAiLoadingAfterBlockId] = useState<
    string | null
  >(null);

  const entryIdRef = useRef<string | null>(initialEntryId);
  const isSavingRef = useRef(false);
  const savedStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const saveTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const lastSavedContentRef = useRef<Map<string, string>>(new Map());

  const showToolbar = hasUserText(blocks) && !reviewAnalysis;
  const canSave = hasUserText(blocks) && !isFinalizing;

  useEffect(() => {
    entryIdRef.current = entryId;
  }, [entryId]);

  useEffect(() => {
    for (const block of blocks) {
      if (block.type === "user") {
        lastSavedContentRef.current.set(block.id, block.content.trim());
      }
    }
  }, [initialBlocks]);

  useEffect(() => {
    return () => {
      if (savedStatusTimeoutRef.current) {
        clearTimeout(savedStatusTimeoutRef.current);
      }

      for (const timeout of saveTimeoutsRef.current.values()) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const persistUserBlock = useCallback(
    async (blockId: string, content: string) => {
      const trimmed = content.trim();

      if (!trimmed || isSavingRef.current) {
        return;
      }

      if (lastSavedContentRef.current.get(blockId) === trimmed) {
        return;
      }

      isSavingRef.current = true;
      setDraftStatus("saving");
      setDraftError(null);

      try {
        if (!entryIdRef.current) {
          const result = await createEntryWithUserBlock(trimmed);

          if ("error" in result) {
            setDraftStatus("error");
            setDraftError(result.error);
            return;
          }

          entryIdRef.current = result.entryId;
          setEntryId(result.entryId);
          lastSavedContentRef.current.set(result.block.id, trimmed);

          setBlocks((current) =>
            current.map((block) =>
              block.type === "user" && block.id === blockId
                ? { ...result.block }
                : block,
            ),
          );

          setDraftStatus("saved");
        } else {
          const result = await saveUserBlock(
            entryIdRef.current,
            blockId,
            content,
          );

          if ("error" in result) {
            setDraftStatus("error");
            setDraftError(result.error);
            return;
          }

          lastSavedContentRef.current.set(blockId, trimmed);
          setDraftStatus("saved");
        }

        if (savedStatusTimeoutRef.current) {
          clearTimeout(savedStatusTimeoutRef.current);
        }

        savedStatusTimeoutRef.current = setTimeout(() => {
          setDraftStatus("idle");
        }, SAVED_STATUS_RESET_MS);
      } finally {
        isSavingRef.current = false;
      }
    },
    [],
  );

  async function flushPendingSaves() {
    for (const timeout of saveTimeoutsRef.current.values()) {
      clearTimeout(timeout);
    }
    saveTimeoutsRef.current.clear();

    const userBlocks = blocks.filter((block) => block.type === "user");

    for (const block of userBlocks) {
      if (block.content.trim()) {
        await persistUserBlock(block.id, block.content);
      }
    }
  }

  function handleUserBlockChange(blockId: string, content: string) {
    setBlocks((current) =>
      current.map((block) =>
        block.type === "user" && block.id === blockId
          ? { ...block, content }
          : block,
      ),
    );

    const existingTimeout = saveTimeoutsRef.current.get(blockId);

    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeoutId = setTimeout(() => {
      void persistUserBlock(blockId, content);
    }, AUTO_SAVE_DELAY_MS);

    saveTimeoutsRef.current.set(blockId, timeoutId);
  }

  async function handleFinalize() {
    setIsFinalizing(true);
    setDraftError(null);

    await flushPendingSaves();

    const result = await finalizeEntry({
      entryId: entryIdRef.current ?? undefined,
      blocks,
    });

    setIsFinalizing(false);

    if ("error" in result) {
      setDraftStatus("error");
      setDraftError(result.error);
      return;
    }

    setReviewAnalysis(result.analysis);
  }

  async function handleDeleteEntry() {
    if (entryIdRef.current) {
      const result = await deleteEntry(entryIdRef.current);

      if ("error" in result) {
        setDraftStatus("error");
        setDraftError(result.error);
        return;
      }
    }

    setBlocks([createLocalUserBlock()]);
    setEntryId(null);
    entryIdRef.current = null;
    lastSavedContentRef.current.clear();
    setDraftStatus("idle");
    setDraftError(null);
    setIsBookmarked(false);
    setIsPrivate(false);
    setAiError(null);
    setFocusBlockId(null);
    setReviewAnalysis(null);
  }

  async function handleAiAction(actionLabel: string) {
    const activeBlock = getActiveUserBlock(blocks);
    const activeContent = activeBlock?.content.trim() ?? "";

    if (!activeContent) {
      setAiError("Schrijf eerst iets voordat je AI gebruikt.");
      return;
    }

    setIsAiLoading(true);
    setAiError(null);
    setAiLoadingAfterBlockId(activeBlock?.id ?? null);

    if (activeBlock && entryIdRef.current) {
      await persistUserBlock(activeBlock.id, activeBlock.content);
    }

    const result = await respondToEntryAction({
      actionLabel,
      entryId: entryIdRef.current ?? undefined,
      activeUserBlockId: activeBlock?.id,
      activeUserContent: activeContent,
    });

    setIsAiLoading(false);
    setAiLoadingAfterBlockId(null);

    if ("error" in result) {
      setAiError(result.error);
      return;
    }

    entryIdRef.current = result.entryId;
    setEntryId(result.entryId);
    setBlocks(result.blocks);
    setFocusBlockId(result.focusBlockId);
    setAiError(null);

    for (const block of result.blocks) {
      if (block.type === "user") {
        lastSavedContentRef.current.set(block.id, block.content.trim());
      }
    }
  }

  if (reviewAnalysis) {
    return <EntryAnalysisReview analysis={reviewAnalysis} />;
  }

  return (
    <>
      <section className="mx-auto flex min-h-[70vh] max-w-prose flex-col justify-center px-2">
        <p className="font-serif text-lg leading-relaxed text-muted">{hint}</p>

        <JournalFlow
          aiError={aiError}
          aiLoadingAfterBlockId={aiLoadingAfterBlockId}
          blocks={blocks}
          focusBlockId={focusBlockId}
          isAiLoading={isAiLoading}
          onUserBlockChange={handleUserBlockChange}
        />

        <WritingToolbar
          canSave={canSave}
          draftError={draftError}
          draftStatus={draftStatus}
          isBookmarked={isBookmarked}
          isFinalizing={isFinalizing}
          isPrivate={isPrivate}
          onAiAction={(label) => {
            void handleAiAction(label);
          }}
          onDeleteEntry={() => {
            void handleDeleteEntry();
          }}
          onOpenImageModal={() => setIsImageModalOpen(true)}
          onSave={() => {
            void handleFinalize();
          }}
          onToggleBookmark={() => setIsBookmarked((current) => !current)}
          onTogglePrivate={() => setIsPrivate((current) => !current)}
          visible={showToolbar}
        />
      </section>

      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />
    </>
  );
}
