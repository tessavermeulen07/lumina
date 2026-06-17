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
  SmallCapsIcon,
  StrikethroughIcon,
  SummarizeIcon,
  TitleIcon,
  TrashIcon,
  UnderlineIcon,
  UndoIcon,
} from "@/components/journal/WritingToolbarIcons";

type ToolbarPanel = "main" | "ai" | "format" | "more";

interface WritingToolbarProps {
  visible: boolean;
  onOpenImageModal: () => void;
  onDeleteEntry: () => void;
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

export function WritingToolbar({
  visible,
  onOpenImageModal,
  onDeleteEntry,
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

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-20 -translate-x-1/2 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <div className="overflow-visible rounded-full border border-lumina-500/25 bg-surface/90 px-3 py-2 shadow-sm backdrop-blur-sm">
        {activePanel === "main" && (
          <div className="flex items-center gap-0.5" role="toolbar">
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
                onClick={() => undefined}
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
          <div className="flex items-center gap-0.5" role="toolbar">
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
