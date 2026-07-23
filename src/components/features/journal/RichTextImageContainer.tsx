"use client";

import { useState, type ReactNode } from "react";
import { EntryImageLightbox } from "@/components/features/journal/EntryImageLightbox";

interface ExpandedImage {
  src: string;
  alt: string;
}

interface RichTextImageContainerProps {
  children: ReactNode;
  className?: string;
}

export function RichTextImageContainer({
  children,
  className = "",
}: Readonly<RichTextImageContainerProps>) {
  const [expandedImage, setExpandedImage] = useState<ExpandedImage | null>(null);

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (!(target instanceof HTMLImageElement) || !target.src) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setExpandedImage({
      src: target.currentSrc || target.src,
      alt: target.alt || "Afbeelding in je entry",
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target;

    if (
      !(target instanceof HTMLImageElement) ||
      !target.src ||
      (event.key !== "Enter" && event.key !== " ")
    ) {
      return;
    }

    event.preventDefault();
    setExpandedImage({
      src: target.currentSrc || target.src,
      alt: target.alt || "Afbeelding in je entry",
    });
  }

  return (
    <>
      <div
        className={className}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>

      {expandedImage ? (
        <EntryImageLightbox
          alt={expandedImage.alt}
          onClose={() => setExpandedImage(null)}
          src={expandedImage.src}
        />
      ) : null}
    </>
  );
}
