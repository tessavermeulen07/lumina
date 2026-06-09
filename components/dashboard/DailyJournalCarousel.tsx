"use client";

import { useRef } from "react";

interface DailyJournalCarouselProps {
  title: string;
  children: React.ReactNode;
}

function CarouselArrow({
  direction,
  onClick,
}: Readonly<{
  direction: "prev" | "next";
  onClick: () => void;
}>) {
  return (
    <button
      aria-label={direction === "prev" ? "Vorige" : "Volgende"}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lumina-500/25 text-muted transition-colors hover:border-lumina-500 hover:bg-lumina-500/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500"
      onClick={onClick}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={direction === "prev" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );
}

export function DailyJournalCarousel({
  title,
  children,
}: Readonly<DailyJournalCarouselProps>) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "prev" | "next") {
    const track = trackRef.current;
    if (!track) return;

    const scrollAmount = Math.max(track.clientWidth * 0.75, 240);
    track.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>

        <div className="flex shrink-0 items-center gap-2">
          <CarouselArrow direction="prev" onClick={() => scroll("prev")} />
          <CarouselArrow direction="next" onClick={() => scroll("next")} />
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </section>
  );
}
