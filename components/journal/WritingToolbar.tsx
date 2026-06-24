"use client";

import { useState } from "react";
import { ToolbarCarousel } from "@/components/journal/ToolbarCarousel";
import {
  ToolbarIconButton,
  ToolbarSeparator,
} from "@/components/journal/ToolbarIconButton";
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
  MoreIcon,
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

type ToolbarPanel = "main" | "ai" | "format" | "more";
type DraftStatus = "idle" | "saving" | "saved" | "error";

interface WritingToolbarProps {
  visible: boolean;
  onOpenImageModal: () => void;
  onDeleteEntry: () => void;
  onSave: () => void;
  onAiAction: (label: string) => void;
  canSave: boolean;
  isFinalizing: boolean;
  draftStatus: DraftStatus;
  draftError: string | null;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isPrivate: boolean;
  onTogglePrivate: () => void;
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
  isFinalizing: boolean,
): string | null {
  if (isFinalizing) {
    return "Analyse wordt gemaakt…";
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
  canSave,
  isFinalizing,
  draftStatus,
  draftError,
  isBookmarked,
  onToggleBookmark,
  isPrivate,
  onTogglePrivate,
}: Readonly<WritingToolbarProps>) {
  const [activePanel, setActivePanel] = useState<ToolbarPanel>("main");
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  function togglePanel(panel: ToolbarPanel) {
    setActivePanel((current) => (current === panel ? "main" : panel));
  }

  function toggleFormat(id: string) {
    setActiveFormats((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (!visible) return null;

  const statusMessage = getStatusMessage(draftStatus, draftError, isFinalizing);

  return (
    <div className="mt-8 pb-12">
      <div className="overflow-visible rounded-2xl border border-lumina-500/25 bg-surface/90 px-4 py-3 shadow-sm backdrop-blur-sm">
        {statusMessage ? (
          <p
            aria-live="polite"
            className={`mb-3 text-center text-sm ${
              draftStatus === "error" ? "text-red-600" : "text-muted"
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
              label="Voeg afbeelding toe"
              onClick={onOpenImageModal}
              title="Voeg afbeelding toe"
            >
              <ImageIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Verander style"
              onClick={() => togglePanel("format")}
              title="Verander style"
            >
              <FormatIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Meer opties"
              onClick={() => togglePanel("more")}
              title="Meer opties"
            >
              <MoreIcon />
            </ToolbarIconButton>
            <ToolbarSeparator />
            <button
              aria-label="Opslaan"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-lumina-900 px-4 text-sm font-medium text-white transition-colors hover:bg-lumina-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canSave || isFinalizing}
              onClick={onSave}
              type="button"
            >
              <SaveIcon />
              {isFinalizing ? "Opslaan…" : "Opslaan"}
            </button>
          </div>
        )}

        {activePanel === "ai" && (
          <ToolbarCarousel>
            <ToolbarIconButton
              label="Terug"
              onClick={() => setActivePanel("main")}
              title="Terug"
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
            >
              <BackIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Ongedaan maken"
              onClick={() => undefined}
              title="Ongedaan maken"
            >
              <UndoIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Opnieuw"
              onClick={() => undefined}
              title="Opnieuw"
            >
              <RedoIcon />
            </ToolbarIconButton>
            <ToolbarSeparator />
            {formatItems.map(({ id, label, title, icon: Icon }) => (
              <ToolbarIconButton
                key={id}
                ariaPressed={activeFormats.has(id)}
                isActive={activeFormats.has(id)}
                label={label}
                onClick={() => toggleFormat(id)}
                title={title}
              >
                <Icon />
              </ToolbarIconButton>
            ))}
          </ToolbarCarousel>
        )}

        {activePanel === "more" && (
          <div className="flex items-center justify-center gap-1" role="toolbar">
            <ToolbarIconButton
              label="Terug"
              onClick={() => setActivePanel("main")}
              title="Terug"
            >
              <BackIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Entry verwijderen"
              onClick={() => {
                onDeleteEntry();
                setActivePanel("main");
              }}
              title="Entry verwijderen"
            >
              <TrashIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              ariaPressed={isBookmarked}
              isActive={isBookmarked}
              label="Bookmarken"
              onClick={onToggleBookmark}
              title="Bookmarken"
            >
              <BookmarkIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              ariaPressed={isPrivate}
              isActive={isPrivate}
              label="Privé maken"
              onClick={onTogglePrivate}
              title="Privé maken"
            >
              <LockIcon />
            </ToolbarIconButton>
          </div>
        )}
      </div>
    </div>
  );
}
