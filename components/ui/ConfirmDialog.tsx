"use client";

import { useEffect, useId } from "react";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  confirmVariant?: "primary" | "outline" | "dark";
  confirmClassName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = "Annuleren",
  isLoading = false,
  confirmVariant = "dark",
  confirmClassName = "",
  onConfirm,
  onCancel,
}: Readonly<ConfirmDialogProps>) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isLoading, isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Sluit dialoog"
        className="absolute inset-0 bg-foreground/20"
        disabled={isLoading}
        onClick={onCancel}
        type="button"
      />

      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-lumina-500/25 bg-surface p-6 shadow-sm"
        role="dialog"
      >
        <h2 className="text-lg font-semibold text-foreground" id={titleId}>
          {title}
        </h2>
        <p className="mt-3 text-sm text-muted">{message}</p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button disabled={isLoading} onClick={onCancel} variant="outline">
            {cancelLabel}
          </Button>
          <Button
            className={confirmClassName}
            disabled={isLoading}
            onClick={onConfirm}
            variant={confirmVariant}
          >
            {isLoading ? "Bezig…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
