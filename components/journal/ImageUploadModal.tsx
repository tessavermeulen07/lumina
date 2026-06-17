"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ImageIcon } from "@/components/journal/WritingToolbarIcons";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImageUploadModal({
  isOpen,
  onClose,
}: Readonly<ImageUploadModalProps>) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Sluit dialoog"
        className="absolute inset-0 bg-foreground/20"
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
            type="button"
          >
            <span className="text-lumina-500">
              <ImageIcon />
            </span>
            <span className="text-sm">
              Sleep een afbeelding hierheen of klik om te kiezen
            </span>
          </button>

          <input
            ref={fileInputRef}
            accept="image/*"
            className="sr-only"
            type="file"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={handleClose} type="button" variant="outline">
              Annuleren
            </Button>
            <Button type="submit" variant="primary">
              Toevoegen
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
