"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { builtinGoalCategories } from "@/lib/goals/category-labels";
import {
  useGoalCategoryOptions,
  useGoalMutations,
} from "@/hooks/use-goals";
import {
  defaultGoalCategory,
  goalFrequencyOptions,
  type GoalFrequency,
} from "@/types/goal";

const newCategoryOptionValue = "__new_category__";

const fieldClassName =
  "w-full rounded-xl border border-lumina-500/25 bg-surface px-4 py-3 text-foreground placeholder:text-muted focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: {
    name: string;
    category: string;
    frequency: GoalFrequency;
    description: string;
  }) => void;
}

const emptyForm: {
  name: string;
  category: string;
  frequency: GoalFrequency;
  description: string;
  newCategoryName: string;
} = {
  name: "",
  category: defaultGoalCategory,
  frequency: "een-keer",
  description: "",
  newCategoryName: "",
};

export function AddGoalModal({
  isOpen,
  onClose,
  onAdd,
}: Readonly<AddGoalModalProps>) {
  const { data: categories = [] } = useGoalCategoryOptions();
  const { createGoalCategory } = useGoalMutations();
  const titleId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(emptyForm);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setForm(emptyForm);
    setShowNewCategory(false);
    setError(null);
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = form.name.trim();
    if (!trimmedName) return;

    let category = form.category;

    if (showNewCategory) {
      const trimmedCategoryName = form.newCategoryName.trim();
      if (!trimmedCategoryName) {
        setError("Geef je nieuwe categorie een naam.");
        return;
      }

      const result = await createGoalCategory.mutateAsync(trimmedCategoryName);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      category = result.id;
    }

    onAdd({
      name: trimmedName,
      category,
      frequency: form.frequency,
      description: form.description.trim(),
    });
    handleClose();
  }

  const builtinCategories =
    categories.filter((category) => !category.isCustom).length > 0
      ? categories.filter((category) => !category.isCustom)
      : builtinGoalCategories.map((category) => ({
          value: category.value,
          label: category.label,
          isCustom: false,
        }));
  const customCategories = categories.filter((category) => category.isCustom);

  function handleCategoryChange(value: string) {
    if (value === newCategoryOptionValue) {
      setShowNewCategory(true);
      return;
    }

    setForm((current) => ({
      ...current,
      category: value,
    }));
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
          Doel toevoegen
        </h2>

        <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
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
              placeholder="Wat wil je bereiken?"
              type="text"
              value={form.name}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-foreground"
              htmlFor="goal-category"
            >
              Categorie
            </label>
            {!showNewCategory ? (
              <select
                className={fieldClassName}
                id="goal-category"
                onChange={(event) => handleCategoryChange(event.target.value)}
                value={form.category}
              >
                <optgroup label="Standaard">
                  {builtinCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </optgroup>
                {customCategories.length > 0 ? (
                  <optgroup label="Eigen categorieën">
                    {customCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                <optgroup label="Meer">
                  <option value={newCategoryOptionValue}>
                    + Nieuwe categorie…
                  </option>
                </optgroup>
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  className={fieldClassName}
                  id="goal-new-category"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      newCategoryName: event.target.value,
                    }))
                  }
                  placeholder="Naam van je categorie"
                  type="text"
                  value={form.newCategoryName}
                />
                <button
                  className="text-sm text-muted transition-colors hover:text-foreground"
                  onClick={() => {
                    setShowNewCategory(false);
                    setForm((current) => ({ ...current, newCategoryName: "" }));
                  }}
                  type="button"
                >
                  Bestaande categorie kiezen
                </button>
              </div>
            )}
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

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={handleClose} type="button" variant="outline">
              Annuleren
            </Button>
            <Button disabled={createGoalCategory.isPending} type="submit" variant="primary">
              Toevoegen
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
