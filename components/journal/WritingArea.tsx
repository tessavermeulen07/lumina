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
import { finalizeEntryAiStreamAction } from "@/lib/ai/respond-to-entry";
import { useEntryMutations } from "@/lib/queries/use-entries";
import { useLuminaStream } from "@/lib/queries/use-lumina-stream";
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

function formatFinalizeError(message: string): string {
  return `${message} Je tekst is als concept bewaard — probeer opnieuw op te slaan.`;
}

type DraftStatus = "idle" | "saving" | "saved" | "error";
type AiStatus = "idle" | "loading" | "success" | "unavailable";

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
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
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
  const [aiStatus, setAiStatus] = useState<AiStatus>("idle");
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);
  const [aiLoadingAfterBlockId, setAiLoadingAfterBlockId] = useState<
    string | null
  >(null);
  const [streamingAiBlock, setStreamingAiBlock] = useState<{
    afterBlockId: string;
    action: string;
    content: string;
  } | null>(null);

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
  const {
    createDraft,
    saveDraftBlock,
    ensureDraft,
    removeEntry,
    toggleBookmark,
    setPrivate,
    unsetPrivate,
    finalize,
    invalidateAll,
  } = useEntryMutations();
  const { streamLumina, resetStream } = useLuminaStream();
  const aiSuccessTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      if (aiSuccessTimeoutRef.current) {
        clearTimeout(aiSuccessTimeoutRef.current);
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
          const result = await createDraft.mutateAsync({
            content: trimmed,
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
          const result = await saveDraftBlock.mutateAsync({
            entryId: entryIdRef.current,
            blockId,
            content: trimmed,
          });

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
    [createDraft, saveDraftBlock],
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
    const result = await ensureDraft.mutateAsync({
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
    setFinalizeError(null);

    await flushPendingSaves();

    const result = await finalize.mutateAsync({
      entryId: entryIdRef.current ?? undefined,
      blocks,
      reflectionPeriod: reflectionPeriodRef.current,
      reflectionPromptId: reflectionPromptIdRef.current,
      goalId: goalIdRef.current,
      goalPrompt: goalPromptRef.current,
    });

    setIsFinalizing(false);

    if ("error" in result) {
      setFinalizeError(formatFinalizeError(result.error));
      return;
    }

    setFinalizeError(null);
    setReviewAnalysis(result.analysis);
  }

  async function handleDeleteEntry() {
    setIsDeleting(true);

    if (entryIdRef.current) {
      const result = await removeEntry.mutateAsync(entryIdRef.current);

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
      const result = await toggleBookmark.mutateAsync(resolvedEntryId);

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
      const result = await setPrivate.mutateAsync({
        entryId: resolvedEntryId,
        password,
        confirmPassword,
      });

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

    const result = await unsetPrivate.mutateAsync({
      entryId: entryIdRef.current,
      password,
    });

    setIsPrivateLoading(false);

    if ("error" in result) {
      setPrivateError(result.error);
      return;
    }

    setIsPrivate(false);
    setIsPrivateDialogOpen(false);
  }

  async function handleAiAction(actionLabel: string) {
    if (isAiLoading) {
      return;
    }

    const activeBlock = getActiveUserBlock(blocks);
    const activeContent = activeBlock?.content.trim() ?? "";

    if (isRichTextEmpty(activeContent)) {
      setAiError("Schrijf eerst iets voordat je AI gebruikt.");
      setAiStatus("idle");
      setAiStatusMessage(null);
      return;
    }

    setIsAiLoading(true);
    setAiStatus("loading");
    setAiStatusMessage("Bezig met je AI-actie…");
    setAiError(null);
    setAiLoadingAfterBlockId(activeBlock?.id ?? null);
    setStreamingAiBlock(null);
    resetStream();

    if (activeBlock && entryIdRef.current) {
      await persistUserBlock(activeBlock.id, activeBlock.content);
    }

    let streamAfterBlockId = activeBlock?.id ?? "";
    const streamAction = actionLabel;

    const streamOutcome = await streamLumina(
      {
        mode: "entry_toolbar",
        actionLabel,
        entryId: entryIdRef.current ?? undefined,
        activeUserBlockId: activeBlock?.id,
        activeUserContent: activeContent,
      },
      {
        onReady: ({ entryMeta }) => {
          if (entryMeta) {
            streamAfterBlockId = entryMeta.activeBlockId;
            entryIdRef.current = entryMeta.entryId;
            setEntryId(entryMeta.entryId);
          }

          setStreamingAiBlock({
            afterBlockId: streamAfterBlockId,
            action: streamAction,
            content: "",
          });
        },
        onChunk: (text) => {
          setStreamingAiBlock({
            afterBlockId: streamAfterBlockId,
            action: streamAction,
            content: text,
          });
        },
      },
    );

    if (!streamOutcome.ok) {
      if (streamOutcome.cancelled) {
        setIsAiLoading(false);
        setStreamingAiBlock(null);
        setAiStatus("idle");
        setAiStatusMessage(null);
        return;
      }

      const message = streamOutcome.error ?? "AI-actie kon niet worden uitgevoerd.";
      setIsAiLoading(false);
      setAiStatus("unavailable");
      setAiStatusMessage(message);
      setStreamingAiBlock(null);
      setAiError(message);
      return;
    }

    const streamResult = streamOutcome.result;

    const { text, entryMeta } = streamResult;

    if (!entryMeta) {
      setIsAiLoading(false);
      setAiError("Entry kon niet worden bijgewerkt.");
      setAiStatus("unavailable");
      setStreamingAiBlock(null);
      return;
    }

    setStreamingAiBlock({
      afterBlockId: entryMeta.activeBlockId,
      action: actionLabel,
      content: text,
    });

    const result = await finalizeEntryAiStreamAction({
      entryId: entryMeta.entryId,
      activeBlockId: entryMeta.activeBlockId,
      action: entryMeta.action,
      responseText: text,
    });

    setIsAiLoading(false);
    setStreamingAiBlock(null);

    if ("error" in result) {
      setAiError(result.error);
      setAiStatus("unavailable");
      setAiStatusMessage(result.error);
      return;
    }

    if (aiSuccessTimeoutRef.current) {
      clearTimeout(aiSuccessTimeoutRef.current);
    }

    entryIdRef.current = result.entryId;
    setEntryId(result.entryId);
    setBlocks(result.blocks);
    setFocusBlockId(result.focusBlockId);
    setAiLoadingAfterBlockId(result.focusBlockId);
    setAiStatus("success");
    setAiStatusMessage("Gelukt. Je kunt meteen verder schrijven.");
    setAiError(null);

    aiSuccessTimeoutRef.current = setTimeout(() => {
      setAiStatus("idle");
      setAiStatusMessage(null);
      setAiLoadingAfterBlockId(null);
    }, 2500);

    for (const block of result.blocks) {
      if (block.type === "user") {
        lastSavedContentRef.current.set(block.id, block.content.trim());
      }
    }

    void invalidateAll();
  }

  if (reviewAnalysis) {
    return <EntryAnalysisReview analysis={reviewAnalysis} />;
  }

  return (
    <>
      <section className="mx-auto flex min-h-[70vh] max-w-prose flex-col justify-center px-2">
        <p className="whitespace-pre-line font-serif text-base leading-relaxed text-muted md:text-lg">
          {hint}
        </p>

        <JournalFlow
          aiError={aiError}
          aiLoadingAfterBlockId={aiLoadingAfterBlockId}
          aiStatus={aiStatus}
          aiStatusMessage={aiStatusMessage}
          blocks={blocks}
          focusBlockId={focusBlockId}
          isAiLoading={isAiLoading}
          onUserBlockChange={handleUserBlockChange}
          streamingAiBlock={streamingAiBlock}
        />

        <WritingToolbar
          canSave={canSave}
          draftError={draftError}
          draftStatus={draftStatus}
          finalizeError={finalizeError}
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
