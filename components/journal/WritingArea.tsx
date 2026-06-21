"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUploadModal } from "@/components/journal/ImageUploadModal";
import { WritingToolbar } from "@/components/journal/WritingToolbar";
import { deleteEntry } from "@/lib/entries/delete-entry";
import { saveEntry } from "@/lib/entries/save-entry";

const AUTO_SAVE_DELAY_MS = 1500;
const SAVED_STATUS_RESET_MS = 2000;

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface WritingAreaProps {
  hint: string;
}

export function WritingArea({ hint }: Readonly<WritingAreaProps>) {
  const [content, setContent] = useState("");
  const [entryId, setEntryId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const lastSavedContentRef = useRef("");
  const entryIdRef = useRef<string | null>(null);
  const isSavingRef = useRef(false);
  const savedStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const showToolbar = content.trim().length > 0;
  const canSave = content.trim().length > 0;
  const isSaving = saveStatus === "saving";

  const persistEntry = useCallback(async (text: string) => {
    const trimmed = text.trim();

    if (!trimmed || trimmed === lastSavedContentRef.current || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");
    setSaveError(null);

    try {
      const result = await saveEntry(trimmed, entryIdRef.current ?? undefined);

      if ("error" in result) {
        setSaveStatus("error");
        setSaveError(result.error);
        return;
      }

      entryIdRef.current = result.id;
      setEntryId(result.id);
      lastSavedContentRef.current = trimmed;
      setSaveStatus("saved");

      if (savedStatusTimeoutRef.current) {
        clearTimeout(savedStatusTimeoutRef.current);
      }

      savedStatusTimeoutRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, SAVED_STATUS_RESET_MS);
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  useEffect(() => {
    entryIdRef.current = entryId;
  }, [entryId]);

  useEffect(() => {
    if (!content.trim()) {
      return;
    }

    if (content.trim() === lastSavedContentRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      void persistEntry(content);
    }, AUTO_SAVE_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [content, persistEntry]);

  useEffect(() => {
    return () => {
      if (savedStatusTimeoutRef.current) {
        clearTimeout(savedStatusTimeoutRef.current);
      }
    };
  }, []);

  function handleManualSave() {
    void persistEntry(content);
  }

  async function handleDeleteEntry() {
    if (entryIdRef.current) {
      const result = await deleteEntry(entryIdRef.current);

      if ("error" in result) {
        setSaveStatus("error");
        setSaveError(result.error);
        return;
      }
    }

    setContent("");
    setEntryId(null);
    entryIdRef.current = null;
    lastSavedContentRef.current = "";
    setSaveStatus("idle");
    setSaveError(null);
    setIsBookmarked(false);
    setIsPrivate(false);
  }

  function getSaveStatusMessage(): string | null {
    if (saveStatus === "saving") {
      return "Opslaan…";
    }

    if (saveStatus === "saved") {
      return "Opgeslagen";
    }

    if (saveStatus === "error" && saveError) {
      return saveError;
    }

    return null;
  }

  const saveStatusMessage = getSaveStatusMessage();

  return (
    <>
      <section className="mx-auto flex min-h-[70vh] max-w-prose flex-col justify-center px-2 pb-24">
        <p className="font-serif text-lg leading-relaxed text-muted">{hint}</p>
        {saveStatusMessage ? (
          <p
            aria-live="polite"
            className={`mt-2 text-sm ${
              saveStatus === "error" ? "text-red-600" : "text-muted"
            }`}
          >
            {saveStatusMessage}
          </p>
        ) : null}
        <textarea
          aria-label="Jouw reflectie"
          autoFocus
          className="mt-6 min-h-[50vh] w-full resize-none border-0 bg-transparent font-serif text-lg leading-relaxed text-foreground shadow-none outline-none focus:ring-0"
          onChange={(event) => setContent(event.target.value)}
          value={content}
        />
      </section>

      <WritingToolbar
        canSave={canSave}
        isBookmarked={isBookmarked}
        isPrivate={isPrivate}
        isSaving={isSaving}
        onDeleteEntry={() => {
          void handleDeleteEntry();
        }}
        onOpenImageModal={() => setIsImageModalOpen(true)}
        onSave={handleManualSave}
        onToggleBookmark={() => setIsBookmarked((current) => !current)}
        onTogglePrivate={() => setIsPrivate((current) => !current)}
        visible={showToolbar}
      />

      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />
    </>
  );
}
