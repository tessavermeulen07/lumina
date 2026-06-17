"use client";

import { useState } from "react";
import { ImageUploadModal } from "@/components/journal/ImageUploadModal";
import { WritingToolbar } from "@/components/journal/WritingToolbar";

interface WritingAreaProps {
  hint: string;
}

export function WritingArea({ hint }: Readonly<WritingAreaProps>) {
  const [content, setContent] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const showToolbar = content.trim().length > 0;

  function handleDeleteEntry() {
    setContent("");
    setIsBookmarked(false);
    setIsPrivate(false);
  }

  return (
    <>
      <section className="mx-auto flex min-h-[70vh] max-w-prose flex-col justify-center px-2 pb-24">
        <p
          aria-live="polite"
          className="font-serif text-lg leading-relaxed text-muted"
        >
          {hint}
        </p>
        <textarea
          aria-label="Jouw reflectie"
          autoFocus
          className="mt-6 min-h-[50vh] w-full resize-none border-0 bg-transparent font-serif text-lg leading-relaxed text-foreground shadow-none outline-none focus:ring-0"
          onChange={(event) => setContent(event.target.value)}
          value={content}
        />
      </section>

      <WritingToolbar
        isBookmarked={isBookmarked}
        isPrivate={isPrivate}
        onDeleteEntry={handleDeleteEntry}
        onOpenImageModal={() => setIsImageModalOpen(true)}
        onToggleBookmark={() => setIsBookmarked((current) => !current)}
        onTogglePrivate={() => setIsPrivate((current) => !current)}
        visible={showToolbar}
      />

      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />
    </>
  );
}
