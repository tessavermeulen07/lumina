"use client";

import { useEffect, useRef } from "react";
import { getToolbarActionLabel } from "@/lib/ai/toolbar-actions";
import type { ToolbarAiAction } from "@/lib/ai/question-context";
import type { EntryBlock } from "@/lib/types/entry-blocks";

interface JournalFlowProps {
  blocks: EntryBlock[];
  focusBlockId: string | null;
  isAiLoading: boolean;
  aiLoadingAfterBlockId: string | null;
  aiError: string | null;
  onUserBlockChange?: (blockId: string, content: string) => void;
  readOnly?: boolean;
}

function getActionLabel(action: string): string {
  const knownActions: ToolbarAiAction[] = [
    "vraag",
    "ga_dieper",
    "coach_me",
    "geef_inzicht",
    "eerdere_gedragspatronen",
    "actie_punten",
    "geef_feedback",
  ];

  if (knownActions.includes(action as ToolbarAiAction)) {
    return getToolbarActionLabel(action as ToolbarAiAction);
  }

  return action;
}

function AutoGrowTextarea({
  blockId,
  content,
  autoFocus,
  onChange,
}: Readonly<{
  blockId: string;
  content: string;
  autoFocus?: boolean;
  onChange: (blockId: string, content: string) => void;
}>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;

    if (!element) {
      return;
    }

    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [content]);

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus, blockId]);

  return (
    <textarea
      ref={textareaRef}
      aria-label="Jouw reflectie"
      autoFocus={autoFocus}
      className="w-full resize-none overflow-hidden border-0 bg-transparent font-serif text-lg leading-relaxed text-foreground shadow-none outline-none focus:ring-0"
      onChange={(event) => onChange(blockId, event.target.value)}
      rows={1}
      value={content}
    />
  );
}

export function JournalFlow({
  blocks,
  focusBlockId,
  isAiLoading,
  aiLoadingAfterBlockId,
  aiError,
  onUserBlockChange,
  readOnly = false,
}: Readonly<JournalFlowProps>) {
  return (
    <div aria-live="polite" className="mt-6 space-y-6">
      {blocks.map((block) => {
        if (block.type === "user") {
          if (readOnly) {
            if (!block.content.trim()) {
              return null;
            }

            return (
              <p
                className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-foreground"
                key={block.id}
              >
                {block.content}
              </p>
            );
          }

          return (
            <div key={block.id}>
              <AutoGrowTextarea
                autoFocus={block.id === focusBlockId}
                blockId={block.id}
                content={block.content}
                onChange={onUserBlockChange!}
              />
              {isAiLoading && aiLoadingAfterBlockId === block.id ? (
                <p className="mt-4 text-sm text-lumina-500">Even nadenken…</p>
              ) : null}
              {aiError && aiLoadingAfterBlockId === block.id ? (
                <p className="mt-4 text-sm text-red-600" role="alert">
                  {aiError}
                </p>
              ) : null}
            </div>
          );
        }

        return (
          <article
            className="rounded-xl border-l-2 border-lumina-500 bg-lumina-500/5 px-4 py-4"
            key={block.id}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-lumina-500">Lumina</p>
              <p className="text-xs text-lumina-700 dark:text-lumina-300">
                {getActionLabel(block.action)}
              </p>
            </div>
            <p className="mt-3 whitespace-pre-wrap font-serif text-lg leading-relaxed text-lumina-700 dark:text-lumina-300">
              {block.content}
            </p>
          </article>
        );
      })}
    </div>
  );
}
