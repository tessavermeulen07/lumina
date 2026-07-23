"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Editor } from "@tiptap/react";

export type FormatId =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "heading"
  | "bullet"
  | "numbered"
  | "smallcaps"
  | "title"
  | "divider";

interface EditorBridgeValue {
  registerEditor: (blockId: string, editor: Editor | null) => void;
  setActiveBlockId: (blockId: string) => void;
  applyFormat: (formatId: FormatId) => void;
  undo: () => void;
  redo: () => void;
  isFormatActive: (formatId: FormatId) => boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasActiveEditor: boolean;
  revision: number;
  insertImage: (input: {
    src: string;
    storagePath: string;
    alt?: string;
  }) => void;
}

const EditorBridgeContext = createContext<EditorBridgeValue | null>(null);

function resolveActiveEditor(
  editors: Map<string, Editor>,
  activeBlockId: string | null,
): Editor | null {
  if (activeBlockId) {
    return editors.get(activeBlockId) ?? null;
  }

  return [...editors.values()].at(-1) ?? null;
}

function getFormatActive(editor: Editor | null, formatId: FormatId): boolean {
  if (!editor) {
    return false;
  }

  switch (formatId) {
    case "bold":
      return editor.isActive("bold");
    case "italic":
      return editor.isActive("italic");
    case "underline":
      return editor.isActive("underline");
    case "strikethrough":
      return editor.isActive("strike");
    case "heading":
      return editor.isActive("heading", { level: 2 });
    case "bullet":
      return editor.isActive("bulletList");
    case "numbered":
      return editor.isActive("orderedList");
    case "smallcaps":
      return editor.isActive("smallCaps");
    case "title":
      return editor.isActive("title");
    case "divider":
      return false;
    default:
      return false;
  }
}

export function EditorBridgeProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const editorsRef = useRef<Map<string, Editor>>(new Map());
  const [activeBlockId, setActiveBlockIdState] = useState<string | null>(null);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [revision, setRevision] = useState(0);

  const syncActiveEditor = useCallback((preferredBlockId?: string | null) => {
    const blockId =
      preferredBlockId === undefined ? activeBlockId : preferredBlockId;
    const editor = resolveActiveEditor(editorsRef.current, blockId);
    setActiveEditor(editor);
    setRevision((current) => current + 1);
  }, [activeBlockId]);

  const registerEditor = useCallback(
    (blockId: string, editor: Editor | null) => {
      if (editor) {
        editorsRef.current.set(blockId, editor);

        const handleUpdate = () => syncActiveEditor(blockId);

        editor.on("selectionUpdate", handleUpdate);
        editor.on("transaction", handleUpdate);
        editor.on("focus", () => {
          setActiveBlockIdState(blockId);
          syncActiveEditor(blockId);
        });

        syncActiveEditor(blockId);
        return;
      }

      editorsRef.current.delete(blockId);
      syncActiveEditor();
    },
    [syncActiveEditor],
  );

  const setActiveBlockId = useCallback(
    (blockId: string) => {
      setActiveBlockIdState(blockId);
      syncActiveEditor(blockId);
    },
    [syncActiveEditor],
  );

  const applyFormat = useCallback(
    (formatId: FormatId) => {
      const editor = activeEditor;

      if (!editor) {
        return;
      }

      const chain = editor.chain().focus();

      switch (formatId) {
        case "bold":
          chain.toggleBold().run();
          break;
        case "italic":
          chain.toggleItalic().run();
          break;
        case "underline":
          chain.toggleUnderline().run();
          break;
        case "strikethrough":
          chain.toggleStrike().run();
          break;
        case "heading":
          chain.toggleHeading({ level: 2 }).run();
          break;
        case "bullet":
          chain.toggleBulletList().run();
          break;
        case "numbered":
          chain.toggleOrderedList().run();
          break;
        case "smallcaps":
          chain.toggleSmallCaps().run();
          break;
        case "title":
          chain.toggleTitle().run();
          break;
        case "divider":
          chain.setHorizontalRule().run();
          break;
      }

      syncActiveEditor();
    },
    [activeEditor, syncActiveEditor],
  );

  const undo = useCallback(() => {
    activeEditor?.chain().focus().undo().run();
    syncActiveEditor();
  }, [activeEditor, syncActiveEditor]);

  const redo = useCallback(() => {
    activeEditor?.chain().focus().redo().run();
    syncActiveEditor();
  }, [activeEditor, syncActiveEditor]);

  const isFormatActive = useCallback(
    (formatId: FormatId) => getFormatActive(activeEditor, formatId),
    [activeEditor],
  );

  const insertImage = useCallback(
    ({
      src,
      storagePath,
      alt = "Afbeelding in je entry",
    }: {
      src: string;
      storagePath: string;
      alt?: string;
    }) => {
      activeEditor
        ?.chain()
        .focus()
        .setImage({ src, alt })
        .updateAttributes("image", { "data-storage-path": storagePath })
        .run();
      syncActiveEditor();
    },
    [activeEditor, syncActiveEditor],
  );

  const value = useMemo(
    () => ({
      registerEditor,
      setActiveBlockId,
      applyFormat,
      undo,
      redo,
      isFormatActive,
      insertImage,
      canUndo: activeEditor?.can().undo() ?? false,
      canRedo: activeEditor?.can().redo() ?? false,
      hasActiveEditor: activeEditor !== null,
      revision,
    }),
    [
      activeEditor,
      applyFormat,
      isFormatActive,
      insertImage,
      redo,
      registerEditor,
      revision,
      setActiveBlockId,
      undo,
    ],
  );

  return (
    <EditorBridgeContext.Provider value={value}>
      {children}
    </EditorBridgeContext.Provider>
  );
}

export function useEditorBridge(): EditorBridgeValue {
  const context = useContext(EditorBridgeContext);

  if (!context) {
    throw new Error("useEditorBridge must be used within EditorBridgeProvider");
  }

  return context;
}
