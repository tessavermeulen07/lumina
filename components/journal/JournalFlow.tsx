"use client";

import { RichTextDisplay } from "@/components/journal/RichTextDisplay";
import { RichTextEditor } from "@/components/journal/RichTextEditor";
import { useEditorBridge } from "@/components/journal/EditorBridge";
import { getToolbarActionLabel } from "@/lib/ai/toolbar-actions";
import type { ToolbarAiAction } from "@/lib/ai/question-context";
import type { EntryBlock } from "@/lib/types/entry-blocks";
import { isRichTextEmpty } from "@/lib/utils/rich-text";

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

function EditableUserBlock({
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
  const { registerEditor, setActiveBlockId } = useEditorBridge();

  return (
    <RichTextEditor
      autoFocus={autoFocus}
      blockId={blockId}
      content={content}
      onChange={onChange}
      onEditorReady={registerEditor}
      onFocus={setActiveBlockId}
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
            if (isRichTextEmpty(block.content)) {
              return null;
            }

            return (
              <RichTextDisplay content={block.content} key={block.id} />
            );
          }

          return (
            <div key={block.id}>
              <EditableUserBlock
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
