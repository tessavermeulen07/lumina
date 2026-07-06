"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EntryAnalysisReview } from "@/components/journal/EntryAnalysisReview";
import {
  EditorBridgeProvider,
  useEditorBridge,
} from "@/components/journal/EditorBridge";
import { JournalFlow } from "@/components/journal/JournalFlow";
import { ImageUploadModal } from "@/components/journal/ImageUploadModal";
import { SetPrivateDialog } from "@/components/journal/SetPrivateDialog";
import { WritingToolbar } from "@/components/journal/WritingToolbar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { respondToEntryAction } from "@/lib/ai/respond-to-entry";
import { ensureEntryDraft } from "@/lib/entries/ensure-entry-draft";
import {
  createEntryWithUserBlock,
  saveUserBlock,
} from "@/lib/entries/entry-blocks";
import { deleteEntry } from "@/lib/entries/delete-entry";
import { finalizeEntry } from "@/lib/entries/finalize-entry";
import {
  makeEntryPrivate,
  removeEntryPrivate,
  toggleEntryBookmark,
} from "@/lib/entries/toggle-entry-flags";
import {
  createLocalUserBlock,
  getActiveUserBlock,
  hasUserText,
  type EntryBlock,
} from "@/lib/types/entry-blocks";
import { normalizeEntryImageHtml } from "@/lib/utils/entry-images";
import { isRichTextEmpty } from "@/lib/utils/rich-text";
import type { EntryAnalysis, ReflectionPeriod } from "@/lib/types/database";

const AUTO_SAVE_DELAY_MS = 1500;
const SAVED_STATUS_RESET_MS = 2000;

type DraftStatus = "idle" | "saving" | "saved" | "error";

interface WritingAreaProps {
  hint: string;
  initialEntryId?: string | null;
  initialBlocks?: EntryBlock[];
  initialIsBookmarked?: boolean;
  initialIsPrivate?: boolean;
  reflectionPeriod?: ReflectionPeriod;
  reflectionPromptId?: string;
  goalId?: string;
  goalPrompt?: string;
  /** @deprecated Use goalId */
  intentionId?: string;
  /** @deprecated Use goalPrompt */
  intentionPrompt?: string;
}

function WritingAreaContent({
  hint,
  initialEntryId = null,
  initialBlocks,
  initialIsBookmarked = false,
  initialIsPrivate = false,
  reflectionPeriod,
  reflectionPromptId,
  goalId,
  goalPrompt,
  intentionId,
  intentionPrompt,
}: Readonly<WritingAreaProps>) {
  const resolvedGoalId = goalId ?? intentionId;
  const resolvedGoalPrompt = goalPrompt ?? intentionPrompt;
  const { insertImage } = useEditorBridge();
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
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrivateDialogOpen, setIsPrivateDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrivateLoading, setIsPrivateLoading] = useState(false);
  const [privateError, setPrivateError] = useState<string | null>(null);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
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
  const reflectionPeriodRef = useRef(reflectionPeriod);
  const reflectionPromptIdRef = useRef(reflectionPromptId);
  const goalIdRef = useRef(resolvedGoalId);
  const goalPromptRef = useRef(resolvedGoalPrompt);

  useEffect(() => {
    reflectionPeriodRef.current = reflectionPeriod;
    reflectionPromptIdRef.current = reflectionPromptId;
    goalIdRef.current = resolvedGoalId;
    goalPromptRef.current = resolvedGoalPrompt;
  }, [
    reflectionPeriod,
    reflectionPromptId,
    resolvedGoalId,
    resolvedGoalPrompt,
  ]);

  const showToolbar = !reviewAnalysis;
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
      const normalizedContent = normalizeEntryImageHtml(content);
      const trimmed = normalizedContent.trim();

      if (isRichTextEmpty(trimmed) || isSavingRef.current) {
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
          const result = await createEntryWithUserBlock(trimmed, {
            reflectionPeriod: reflectionPeriodRef.current,
          });

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
            trimmed,
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
      if (!isRichTextEmpty(block.content)) {
        await persistUserBlock(block.id, block.content);
      }
    }
  }

  function handleUserBlockChange(blockId: string, content: string) {
    const normalizedContent = normalizeEntryImageHtml(content);

    setBlocks((current) =>
      current.map((block) =>
        block.type === "user" && block.id === blockId
          ? { ...block, content: normalizedContent }
          : block,
      ),
    );

    const existingTimeout = saveTimeoutsRef.current.get(blockId);

    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeoutId = setTimeout(() => {
      void persistUserBlock(blockId, normalizedContent);
    }, AUTO_SAVE_DELAY_MS);

    saveTimeoutsRef.current.set(blockId, timeoutId);
  }

  async function handleEnsureEntry(): Promise<string> {
    if (entryIdRef.current) {
      return entryIdRef.current;
    }

    const activeBlock = getActiveUserBlock(blocks);
    const result = await ensureEntryDraft({
      reflectionPeriod: reflectionPeriodRef.current,
    });

    if ("error" in result) {
      throw new Error(result.error);
    }

    entryIdRef.current = result.entryId;
    setEntryId(result.entryId);

    if (activeBlock) {
      setBlocks((current) =>
        current.map((block) =>
          block.type === "user" && block.id === activeBlock.id
            ? { ...result.block, content: activeBlock.content }
            : block,
        ),
      );
      lastSavedContentRef.current.set(
        result.block.id,
        activeBlock.content.trim(),
      );
    } else {
      setBlocks([result.block]);
    }

    return result.entryId;
  }

  function handleImageInserted({
    src,
    storagePath,
  }: {
    src: string;
    storagePath: string;
  }) {
    insertImage({ src, storagePath });
  }

  async function handleFinalize() {
    setIsFinalizing(true);
    setDraftError(null);

    await flushPendingSaves();

    const result = await finalizeEntry({
      entryId: entryIdRef.current ?? undefined,
      blocks,
      reflectionPeriod: reflectionPeriodRef.current,
      reflectionPromptId: reflectionPromptIdRef.current,
      goalId: goalIdRef.current,
      goalPrompt: goalPromptRef.current,
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
    setIsDeleting(true);

    if (entryIdRef.current) {
      const result = await deleteEntry(entryIdRef.current);

      if ("error" in result) {
        setDraftStatus("error");
        setDraftError(result.error);
        setIsDeleting(false);
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
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
  }

  async function handleToggleBookmark() {
    if (isBookmarkLoading) {
      return;
    }

    setIsBookmarkLoading(true);
    setDraftError(null);

    try {
      const resolvedEntryId = await handleEnsureEntry();
      const result = await toggleEntryBookmark(resolvedEntryId);

      if ("error" in result) {
        setDraftStatus("error");
        setDraftError(result.error);
        return;
      }

      setIsBookmarked((current) => !current);
    } catch (error) {
      setDraftStatus("error");
      setDraftError(
        error instanceof Error ? error.message : "Bookmark kon niet worden bijgewerkt.",
      );
    } finally {
      setIsBookmarkLoading(false);
    }
  }

  async function handleMakePrivate(password: string, confirmPassword: string) {
    setIsPrivateLoading(true);
    setPrivateError(null);

    try {
      const resolvedEntryId = await handleEnsureEntry();
      const result = await makeEntryPrivate(
        resolvedEntryId,
        password,
        confirmPassword,
      );

      if ("error" in result) {
        setPrivateError(result.error);
        return;
      }

      setIsPrivate(true);
      setIsPrivateDialogOpen(false);
    } catch (error) {
      setPrivateError(
        error instanceof Error
          ? error.message
          : "Privé instellen is mislukt.",
      );
    } finally {
      setIsPrivateLoading(false);
    }
  }

  async function handleRemovePrivate(password: string) {
    if (!entryIdRef.current) {
      return;
    }

    setIsPrivateLoading(true);
    setPrivateError(null);

    const result = await removeEntryPrivate(entryIdRef.current, password);

    setIsPrivateLoading(false);

    if ("error" in result) {
      setPrivateError(result.error);
      return;
    }

    setIsPrivate(false);
    setIsPrivateDialogOpen(false);
  }

  async function handleAiAction(actionLabel: string) {
    const activeBlock = getActiveUserBlock(blocks);
    const activeContent = activeBlock?.content.trim() ?? "";

    if (isRichTextEmpty(activeContent)) {
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
        <p className="whitespace-pre-line font-serif text-lg leading-relaxed text-muted">
          {hint}
        </p>

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
          onDeleteEntry={() => setIsDeleteDialogOpen(true)}
          onOpenImageModal={() => setIsImageModalOpen(true)}
          onOpenPrivateDialog={() => {
            setPrivateError(null);
            setIsPrivateDialogOpen(true);
          }}
          onSave={() => {
            void handleFinalize();
          }}
          onToggleBookmark={() => {
            void handleToggleBookmark();
          }}
          visible={showToolbar}
        />
      </section>

      <ConfirmDialog
        confirmClassName="bg-red-600 text-white hover:bg-red-700"
        confirmLabel="Verwijderen"
        isLoading={isDeleting}
        isOpen={isDeleteDialogOpen}
        message="Weet je zeker dat je deze entry wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          void handleDeleteEntry();
        }}
        title="Entry verwijderen?"
      />

      <SetPrivateDialog
        error={privateError}
        isLoading={isPrivateLoading}
        isOpen={isPrivateDialogOpen}
        isPrivate={isPrivate}
        onClose={() => {
          setPrivateError(null);
          setIsPrivateDialogOpen(false);
        }}
        onMakePrivate={(password, confirmPassword) => {
          void handleMakePrivate(password, confirmPassword);
        }}
        onRemovePrivate={(password) => {
          void handleRemovePrivate(password);
        }}
      />

      <ImageUploadModal
        entryId={entryId}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onEnsureEntry={handleEnsureEntry}
        onImageInserted={handleImageInserted}
      />
    </>
  );
}

export function WritingArea(props: Readonly<WritingAreaProps>) {
  return (
    <EditorBridgeProvider>
      <WritingAreaContent {...props} />
    </EditorBridgeProvider>
  );
}
