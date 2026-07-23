"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { useEffect, useRef } from "react";
import { SmallCaps, Title, EntryImage } from "@/lib/journal/tiptap-extensions";
import { RichTextImageContainer } from "@/components/features/journal/RichTextImageContainer";
import { richTextProseClass } from "@/lib/journal/rich-text-styles";
import { normalizeEditorContent } from "@/lib/utils/rich-text";

interface RichTextEditorProps {
  blockId: string;
  content: string;
  autoFocus?: boolean;
  onChange: (blockId: string, content: string) => void;
  onFocus?: (blockId: string) => void;
  onEditorReady?: (blockId: string, editor: Editor | null) => void;
}

export function RichTextEditor({
  blockId,
  content,
  autoFocus,
  onChange,
  onFocus,
  onEditorReady,
}: Readonly<RichTextEditorProps>) {
  const onChangeRef = useRef(onChange);
  const onFocusRef = useRef(onFocus);
  const onEditorReadyRef = useRef(onEditorReady);
  const blockIdRef = useRef(blockId);
  const isExternalUpdateRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
    onFocusRef.current = onFocus;
    onEditorReadyRef.current = onEditorReady;
    blockIdRef.current = blockId;
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
      }),
      Underline,
      HorizontalRule,
      SmallCaps,
      Title,
      EntryImage.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: normalizeEditorContent(content),
    editorProps: {
      attributes: {
        class: `${richTextProseClass} w-full border-0 bg-transparent shadow-none outline-none focus:outline-none min-h-[1.75rem]`,
        "aria-label": "Jouw reflectie",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (isExternalUpdateRef.current) {
        return;
      }

      onChangeRef.current(blockIdRef.current, currentEditor.getHTML());
    },
    onFocus: () => {
      onFocusRef.current?.(blockIdRef.current);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    onEditorReadyRef.current?.(blockId, editor);

    return () => {
      onEditorReadyRef.current?.(blockId, null);
    };
  }, [blockId, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const normalized = normalizeEditorContent(content);
    const currentHtml = editor.getHTML();

    if (normalized === currentHtml) {
      return;
    }

    isExternalUpdateRef.current = true;
    editor.commands.setContent(normalized || "<p></p>", { emitUpdate: false });
    isExternalUpdateRef.current = false;
  }, [blockId, content, editor]);

  useEffect(() => {
    if (autoFocus && editor) {
      editor.commands.focus("end");
    }
  }, [autoFocus, blockId, editor]);

  return (
    <RichTextImageContainer>
      <EditorContent editor={editor} />
    </RichTextImageContainer>
  );
}
