"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  goalFrequencyOptions,
  type Goal,
  type GoalFrequency,
} from "@/lib/types/goal";

const fieldClassName =
  "w-full rounded-xl border border-lumina-500/25 bg-surface px-4 py-3 text-foreground placeholder:text-muted focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, "id">) => void;
}

const emptyForm = {
  name: "",
  frequency: "een-keer" as GoalFrequency,
  description: "",
};

export function AddGoalModal({
  isOpen,
  onClose,
  onAdd,
}: Readonly<AddGoalModalProps>) {
  const titleId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(emptyForm);

  const handleClose = useCallback(() => {
    setForm(emptyForm);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    nameInputRef.current?.focus();

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
    const trimmedName = form.name.trim();
    if (!trimmedName) return;

    onAdd({
      name: trimmedName,
      frequency: form.frequency,
      description: form.description.trim(),
    });
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
          Intentie toevoegen
        </h2>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-foreground"
              htmlFor="goal-name"
            >
              Naam
            </label>
            <input
              ref={nameInputRef}
              className={fieldClassName}
              id="goal-name"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Een taak, een gewoonte of doel..."
              type="text"
              value={form.name}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-foreground"
              htmlFor="goal-frequency"
            >
              Hoe vaak
            </label>
            <select
              className={fieldClassName}
              id="goal-frequency"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  frequency: event.target.value as GoalFrequency,
                }))
              }
              value={form.frequency}
            >
              {goalFrequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-foreground"
              htmlFor="goal-description"
            >
              Omschrijving
            </label>
            <textarea
              className={`${fieldClassName} min-h-32 resize-y leading-relaxed`}
              id="goal-description"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              value={form.description}
            />
          </div>

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
