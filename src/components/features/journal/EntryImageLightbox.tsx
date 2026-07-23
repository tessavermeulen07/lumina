"use client";

import { useCallback, useEffect } from "react";

interface EntryImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function EntryImageLightbox({
  src,
  alt = "Afbeelding in je entry",
  onClose,
}: Readonly<EntryImageLightboxProps>) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        aria-label="Sluit vergrote afbeelding"
        className="absolute inset-0 bg-foreground/70"
        onClick={handleClose}
        type="button"
      />

      <figure className="relative z-10 max-h-[90vh] max-w-[min(90vw,56rem)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={alt}
          className="max-h-[90vh] max-w-[min(90vw,56rem)] rounded-xl object-contain shadow-lg"
          src={src}
        />
      </figure>
    </div>
  );
}
