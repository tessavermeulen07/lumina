"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SetPrivateDialogProps {
  isOpen: boolean;
  isPrivate: boolean;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  onMakePrivate: (password: string, confirmPassword: string) => void;
  onRemovePrivate: (password: string) => void;
}

export function SetPrivateDialog({
  isOpen,
  isPrivate,
  isLoading = false,
  error = null,
  onClose,
  onMakePrivate,
  onRemovePrivate,
}: Readonly<SetPrivateDialogProps>) {
  const titleId = useId();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setConfirmPassword("");
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

    if (isPrivate) {
      onRemovePrivate(password);
      return;
    }

    onMakePrivate(password, confirmPassword);
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
          {isPrivate ? "Niet meer privé" : "Privé maken"}
        </h2>
        <p className="mt-3 text-sm text-muted">
          {isPrivate
            ? "Voer je wachtwoord in om deze entry weer openbaar te maken."
            : "Kies een wachtwoord om deze entry te vergrendelen."}
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <Input
            autoComplete="new-password"
            id="private-password"
            label="Wachtwoord"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />

          {!isPrivate ? (
            <Input
              autoComplete="new-password"
              id="private-password-confirm"
              label="Bevestig wachtwoord"
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              value={confirmPassword}
            />
          ) : null}

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
              {isLoading
                ? "Bezig…"
                : isPrivate
                  ? "Niet meer privé"
                  : "Privé maken"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
