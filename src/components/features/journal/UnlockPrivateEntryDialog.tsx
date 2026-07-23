"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface UnlockPrivateEntryDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  onUnlock: (password: string) => void;
}

export function UnlockPrivateEntryDialog({
  isOpen,
  isLoading = false,
  error = null,
  onClose,
  onUnlock,
}: Readonly<UnlockPrivateEntryDialogProps>) {
  const titleId = useId();
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isLoading, isOpen, onClose]);

  if (!isOpen) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onUnlock(password);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Sluit dialoog"
        className="absolute inset-0 bg-foreground/20"
        disabled={isLoading}
        onClick={onClose}
        type="button"
      />

      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-lumina-500/25 bg-surface p-6 shadow-sm"
        role="dialog"
      >
        <h2 className="text-lg font-semibold text-foreground" id={titleId}>
          Privé entry
        </h2>
        <p className="mt-3 text-sm text-muted">
          Voer je wachtwoord in om deze entry te bekijken.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <Input
            autoComplete="current-password"
            id="unlock-password"
            label="Wachtwoord"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button disabled={isLoading} onClick={onClose} variant="outline">
              Annuleren
            </Button>
            <Button disabled={isLoading} type="submit" variant="dark">
              {isLoading ? "Bezig…" : "Ontgrendelen"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
