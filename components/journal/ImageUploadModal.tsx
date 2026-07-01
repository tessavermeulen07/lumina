"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ImageIcon } from "@/components/journal/WritingToolbarIcons";
import { uploadEntryImage } from "@/lib/entries/upload-entry-image";
import {
  ALLOWED_ENTRY_IMAGE_TYPES,
  MAX_ENTRY_IMAGE_BYTES,
} from "@/lib/utils/entry-images";

interface ImageUploadModalProps {
  isOpen: boolean;
  entryId: string | null;
  onClose: () => void;
  onEnsureEntry: () => Promise<string>;
  onImageInserted: (input: {
    src: string;
    storagePath: string;
  }) => void;
}

function validateFile(file: File): string | null {
  if (!ALLOWED_ENTRY_IMAGE_TYPES.has(file.type)) {
    return "Alleen afbeeldingen (JPEG, PNG, WebP of GIF) zijn toegestaan.";
  }

  if (file.size > MAX_ENTRY_IMAGE_BYTES) {
    return "Bestand is te groot. Maximaal 5 MB.";
  }

  return null;
}

export function ImageUploadModal({
  isOpen,
  entryId,
  onClose,
  onEnsureEntry,
  onImageInserted,
}: Readonly<ImageUploadModalProps>) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isUploading) {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleClose, isOpen, isUploading]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileSelection(file: File | null) {
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      return;
    }

    const validationError = validateFile(file);

    if (validationError) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    handleFileSelection(file);
  }

  function handleDrop(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;
    handleFileSelection(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Kies eerst een afbeelding.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const resolvedEntryId = entryId ?? (await onEnsureEntry());
      const formData = new FormData();
      formData.append("file", selectedFile);

      const result = await uploadEntryImage(resolvedEntryId, formData);

      if ("error" in result) {
        setError(result.error);
        setIsUploading(false);
        return;
      }

      onImageInserted({
        src: result.serveUrl,
        storagePath: result.storagePath,
      });
      handleClose();
    } catch {
      setError("Afbeelding kon niet worden toegevoegd.");
      setIsUploading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Sluit dialoog"
        className="absolute inset-0 bg-foreground/20"
        disabled={isUploading}
        onClick={handleClose}
        type="button"
      />

      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-lumina-500/25 bg-surface p-6 shadow-sm"
        role="dialog"
      >
        <h2 className="text-lg font-semibold text-foreground" id={titleId}>
          Afbeelding toevoegen
        </h2>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <button
            className="flex w-full flex-col items-center gap-3 rounded-xl border border-dashed border-lumina-500/25 bg-background px-6 py-10 text-muted transition-colors hover:border-lumina-500 hover:text-lumina-700"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            type="button"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Voorbeeld van gekozen afbeelding"
                className="max-h-48 max-w-full rounded-lg object-contain"
                src={previewUrl}
              />
            ) : (
              <>
                <span className="text-lumina-500">
                  <ImageIcon />
                </span>
                <span className="text-sm">
                  Sleep een afbeelding hierheen of klik om te kiezen
                </span>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleInputChange}
            type="file"
          />

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              disabled={isUploading}
              onClick={handleClose}
              type="button"
              variant="outline"
            >
              Annuleren
            </Button>
            <Button disabled={!selectedFile || isUploading} type="submit" variant="primary">
              {isUploading ? "Uploaden…" : "Toevoegen"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
