"use client";

import { useState } from "react";
import {
  useEditorBridge,
  type FormatId,
} from "@/components/journal/EditorBridge";
import { ToolbarCarousel } from "@/components/journal/ToolbarCarousel";
import { ToolbarIconButton } from "@/components/journal/ToolbarIconButton";
import {
  ActionIcon,
  AiIcon,
  BackIcon,
  BoldIcon,
  BookmarkIcon,
  BulletListIcon,
  CoachIcon,
  DeeperIcon,
  DividerIcon,
  FeedbackIcon,
  FormatIcon,
  HeadingIcon,
  ImageIcon,
  InsightIcon,
  ItalicIcon,
  LockIcon,
  NumberedListIcon,
  PatternIcon,
  QuestionIcon,
  RedoIcon,
  SaveIcon,
  SmallCapsIcon,
  StrikethroughIcon,
  SummarizeIcon,
  TitleIcon,
  TrashIcon,
  UnderlineIcon,
  UndoIcon,
} from "@/components/journal/WritingToolbarIcons";

type ToolbarPanel = "main" | "ai" | "format";
type DraftStatus = "idle" | "saving" | "saved" | "error";

interface WritingToolbarProps {
  visible: boolean;
  onOpenImageModal: () => void;
  onDeleteEntry: () => void;
  onSave: () => void;
  onAiAction: (label: string) => void;
  onToggleBookmark: () => void;
  onOpenPrivateDialog: () => void;
  canSave: boolean;
  isFinalizing: boolean;
  draftStatus: DraftStatus;
  draftError: string | null;
  finalizeError: string | null;
  isBookmarked: boolean;
  isPrivate: boolean;
}

const aiItems = [
  { label: "Vraag", title: "Vraag", icon: QuestionIcon },
  { label: "Ga dieper", title: "Ga dieper", icon: DeeperIcon },
  { label: "Coach me", title: "Coach me", icon: CoachIcon },
  { label: "Vat samen", title: "Vat samen", icon: SummarizeIcon },
  { label: "Geef inzicht", title: "Geef inzicht", icon: InsightIcon },
  {
    label: "Eerdere gedragspatronen",
    title: "Eerdere gedragspatronen",
    icon: PatternIcon,
  },
  { label: "Actie punten", title: "Actie punten", icon: ActionIcon },
  { label: "Geef feedback", title: "Geef feedback", icon: FeedbackIcon },
] as const;

const formatItems = [
  { id: "bold", label: "Vet", title: "Vet", icon: BoldIcon },
  { id: "italic", label: "Cursief", title: "Cursief", icon: ItalicIcon },
  {
    id: "underline",
    label: "Onderstrepen",
    title: "Onderstrepen",
    icon: UnderlineIcon,
  },
  {
    id: "strikethrough",
    label: "Doorhalen",
    title: "Doorhalen",
    icon: StrikethroughIcon,
  },
  { id: "heading", label: "Kop", title: "Kop", icon: HeadingIcon },
  {
    id: "bullet",
    label: "Opsomming",
    title: "Opsomming",
    icon: BulletListIcon,
  },
  {
    id: "numbered",
    label: "Genummerde lijst",
    title: "Genummerde lijst",
    icon: NumberedListIcon,
  },
  {
    id: "smallcaps",
    label: "Small caps",
    title: "Small caps",
    icon: SmallCapsIcon,
  },
  { id: "title", label: "Titel", title: "Titel", icon: TitleIcon },
  {
    id: "divider",
    label: "Scheidingslijn",
    title: "Scheidingslijn",
    icon: DividerIcon,
  },
] as const;

function getStatusMessage(
  draftStatus: DraftStatus,
  draftError: string | null,
  finalizeError: string | null,
  isFinalizing: boolean,
): string | null {
  if (isFinalizing) {
    return "Analyse wordt gemaakt…";
  }

  if (finalizeError) {
    return finalizeError;
  }

  if (draftStatus === "saving") {
    return "Concept opslaan…";
  }

  if (draftStatus === "saved") {
    return "Concept opgeslagen";
  }

  if (draftStatus === "error" && draftError) {
    return draftError;
  }

  return null;
}

export function WritingToolbar({
  visible,
  onOpenImageModal,
  onDeleteEntry,
  onSave,
  onAiAction,
  onToggleBookmark,
  onOpenPrivateDialog,
  canSave,
  isFinalizing,
  draftStatus,
  draftError,
  finalizeError,
  isBookmarked,
  isPrivate,
}: Readonly<WritingToolbarProps>) {
  const [activePanel, setActivePanel] = useState<ToolbarPanel>("main");
  const {
    applyFormat,
    undo,
    redo,
    isFormatActive,
    canUndo,
    canRedo,
    hasActiveEditor,
    revision,
  } = useEditorBridge();

  void revision;

  function togglePanel(panel: ToolbarPanel) {
    setActivePanel((current) => (current === panel ? "main" : panel));
  }

  if (!visible) return null;

  const statusMessage = getStatusMessage(
    draftStatus,
    draftError,
    finalizeError,
    isFinalizing,
  );
  const hasError = draftStatus === "error" || Boolean(finalizeError);

  return (
    <div className="mt-8 pb-12">
      <div className="overflow-visible rounded-2xl border border-lumina-500/25 bg-surface/90 px-4 py-3 shadow-sm backdrop-blur-sm">
        {statusMessage ? (
          <p
            aria-live="polite"
            className={`mb-3 text-center text-sm ${
              hasError ? "text-red-600" : "text-muted"
            }`}
          >
            {statusMessage}
          </p>
        ) : null}

        {activePanel === "main" && (
          <div className="flex flex-wrap items-center justify-center gap-1" role="toolbar">
            <ToolbarIconButton
              label="Gebruik depth AI"
              onClick={() => togglePanel("ai")}
              title="Gebruik depth AI"
            >
              <AiIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Verander stijl"
              onClick={() => togglePanel("format")}
              title="Verander stijl"
            >
              <FormatIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Voeg afbeelding toe"
              onClick={onOpenImageModal}
              title="Voeg afbeelding toe"
            >
              <ImageIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              ariaPressed={isBookmarked}
              isActive={isBookmarked}
              label={isBookmarked ? "Bookmark verwijderen" : "Bookmarken"}
              onClick={onToggleBookmark}
              title={isBookmarked ? "Bookmark verwijderen" : "Bookmarken"}
            >
              <BookmarkIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              ariaPressed={isPrivate}
              isActive={isPrivate}
              label={isPrivate ? "Niet meer privé" : "Privé maken"}
              onClick={onOpenPrivateDialog}
              title={isPrivate ? "Niet meer privé" : "Privé maken"}
            >
              <LockIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Entry verwijderen"
              onClick={onDeleteEntry}
              title="Entry verwijderen"
            >
              <TrashIcon />
            </ToolbarIconButton>
            <button
              aria-label="Naar de analyse"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lumina-500 text-white transition-colors hover:bg-lumina-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canSave || isFinalizing}
              onClick={onSave}
              title="Naar de analyse"
              type="button"
            >
              <SaveIcon />
            </button>
          </div>
        )}

        {activePanel === "ai" && (
          <ToolbarCarousel>
            <ToolbarIconButton
              label="Terug"
              onClick={() => setActivePanel("main")}
              title="Terug"
              variant="back"
            >
              <BackIcon />
            </ToolbarIconButton>
            {aiItems.map(({ label, title, icon: Icon }) => (
              <ToolbarIconButton
                key={label}
                label={label}
                onClick={() => onAiAction(label)}
                title={title}
              >
                <Icon />
              </ToolbarIconButton>
            ))}
          </ToolbarCarousel>
        )}

        {activePanel === "format" && (
          <ToolbarCarousel>
            <ToolbarIconButton
              label="Terug"
              onClick={() => setActivePanel("main")}
              title="Terug"
              variant="back"
            >
              <BackIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              disabled={!canUndo || !hasActiveEditor}
              label="Ongedaan maken"
              onClick={undo}
              title="Ongedaan maken"
            >
              <UndoIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              disabled={!canRedo || !hasActiveEditor}
              label="Opnieuw"
              onClick={redo}
              title="Opnieuw"
            >
              <RedoIcon />
            </ToolbarIconButton>
            {formatItems.map(({ id, label, title, icon: Icon }) => (
              <ToolbarIconButton
                key={id}
                ariaPressed={isFormatActive(id as FormatId)}
                disabled={!hasActiveEditor}
                isActive={isFormatActive(id as FormatId)}
                label={label}
                onClick={() => applyFormat(id as FormatId)}
                title={title}
              >
                <Icon />
              </ToolbarIconButton>
            ))}
          </ToolbarCarousel>
        )}
      </div>
    </div>
  );
}
