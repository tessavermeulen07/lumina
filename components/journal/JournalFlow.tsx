"use client";

import { RichTextDisplay } from "@/components/journal/RichTextDisplay";
import { RichTextEditor } from "@/components/journal/RichTextEditor";
import { useEditorBridge } from "@/components/journal/EditorBridge";
import { resolveToolbarActionLabel } from "@/lib/ai/toolbar-actions";
import type { EntryBlock } from "@/lib/types/entry-blocks";
import { isRichTextEmpty } from "@/lib/utils/rich-text";

interface StreamingAiBlock {
  afterBlockId: string;
  action: string;
  content: string;
}

interface JournalFlowProps {
  blocks: EntryBlock[];
  focusBlockId: string | null;
  isAiLoading: boolean;
  aiLoadingAfterBlockId: string | null;
  streamingAiBlock?: StreamingAiBlock | null;
  aiError: string | null;
  aiStatus: "idle" | "loading" | "success" | "unavailable";
  aiStatusMessage: string | null;
  onUserBlockChange?: (blockId: string, content: string) => void;
  readOnly?: boolean;
}

function getActionLabel(action: string): string {
  return resolveToolbarActionLabel(action);
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

function AiResponseBlock({
  action,
  content,
  isStreaming = false,
}: Readonly<{
  action: string;
  content: string;
  isStreaming?: boolean;
}>) {
  return (
    <article className="rounded-xl border-l-2 border-lumina-500 bg-lumina-500/5 px-4 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-lumina-500">Lumina</p>
        <p className="text-xs text-lumina-700 dark:text-lumina-300">
          {getActionLabel(action)}
        </p>
      </div>
      <p className="mt-3 whitespace-pre-wrap font-serif text-lg leading-relaxed text-lumina-700 dark:text-lumina-300">
        {content}
        {isStreaming ? (
          <span
            aria-hidden="true"
            className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-lumina-500 align-text-bottom"
          />
        ) : null}
      </p>
    </article>
  );
}

export function JournalFlow({
  blocks,
  focusBlockId,
  isAiLoading,
  aiLoadingAfterBlockId,
  streamingAiBlock = null,
  aiError,
  aiStatus,
  aiStatusMessage,
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

          const showLegacyLoading =
            isAiLoading &&
            aiLoadingAfterBlockId === block.id &&
            !streamingAiBlock;

          return (
            <div key={block.id}>
              <EditableUserBlock
                autoFocus={block.id === focusBlockId}
                blockId={block.id}
                content={block.content}
                onChange={onUserBlockChange!}
              />
              {showLegacyLoading ? (
                <p className="mt-4 text-sm text-lumina-500">Even nadenken…</p>
              ) : null}
              {streamingAiBlock?.afterBlockId === block.id ? (
                <div className="mt-6">
                  <AiResponseBlock
                    action={streamingAiBlock.action}
                    content={streamingAiBlock.content}
                    isStreaming
                  />
                </div>
              ) : null}
              {aiStatus === "success" &&
              aiStatusMessage &&
              aiLoadingAfterBlockId === block.id ? (
                <p className="mt-4 text-sm text-lumina-700 dark:text-lumina-300">
                  {aiStatusMessage}
                </p>
              ) : null}
              {aiStatus === "unavailable" &&
              aiStatusMessage &&
              aiLoadingAfterBlockId === block.id ? (
                <p className="mt-4 text-sm text-lumina-700 dark:text-lumina-300">
                  {aiStatusMessage}
                </p>
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
          <AiResponseBlock
            action={block.action}
            content={block.content}
            key={block.id}
          />
        );
      })}
    </div>
  );
}
