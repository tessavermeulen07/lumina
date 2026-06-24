"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { EntryPerson } from "@/lib/types/entry-analysis";

import {
  insightsCardClass,
  insightsHeadingClass,
} from "@/components/insights/insights-styles";
import {
  layoutWordCloud,
  type PlacedCloudWord,
} from "@/lib/insights/word-cloud-layout";

interface PersonsCloudProps {
  persons: EntryPerson[];
}

function measureTextWidth(
  text: string,
  fontSize: number,
  fontWeight: number,
): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return text.length * fontSize * 0.55;
  }

  context.font = `${fontWeight} ${fontSize}px system-ui, -apple-system, sans-serif`;
  return context.measureText(text).width;
}

export function PersonsCloud({ persons }: Readonly<PersonsCloudProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cloud, setCloud] = useState<{
    words: PlacedCloudWord[];
    height: number;
  }>({ words: [], height: 120 });

  useLayoutEffect(() => {
    const element = containerRef.current;

    if (!element || persons.length === 0) {
      return;
    }

    function updateLayout() {
      const width = element?.clientWidth ?? 320;
      const nextCloud = layoutWordCloud(
        persons.map((person) => ({
          text: person.name,
          count: person.mention_count,
        })),
        width,
        measureTextWidth,
      );
      setCloud(nextCloud);
    }

    updateLayout();

    const observer = new ResizeObserver(updateLayout);
    observer.observe(element);

    return () => observer.disconnect();
  }, [persons]);

  if (persons.length === 0) {
    return null;
  }

  return (
    <section className={insightsCardClass}>
      <h2 className={insightsHeadingClass}>Personen</h2>

      <div
        className="relative mt-5 w-full"
        ref={containerRef}
        style={{ height: `${cloud.height}px` }}
      >
        {cloud.words.map((word) => (
          <span
            className="absolute whitespace-nowrap text-lumina-700 dark:text-lumina-300"
            key={word.text}
            style={{
              left: `${word.x}px`,
              top: `${word.y}px`,
              fontSize: `${word.fontSize}px`,
              fontWeight: word.fontWeight,
              lineHeight: 1,
            }}
          >
            {word.text}
            <span
              className="ml-1 text-lumina-300 dark:text-lumina-100"
              style={{
                fontSize: `${word.fontSize * 0.6}px`,
                fontWeight: 400,
              }}
            >
              {word.count}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
