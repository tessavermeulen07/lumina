"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookmarkFilledIcon, BookmarkIcon } from "@/components/journal/WritingToolbarIcons";
import { usePromptMutations } from "@/lib/queries/use-prompts";
import type { FollowUpPromptCardData } from "@/lib/types/dashboard-reflection";

function PencilIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-lumina-500"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

interface FollowUpPromptCardProps {
  prompt: FollowUpPromptCardData;
}

export function FollowUpPromptCard({
  prompt,
}: Readonly<FollowUpPromptCardProps>) {
  const { toggleBookmark } = usePromptMutations();
  const [isBookmarked, setIsBookmarked] = useState(prompt.isBookmarked);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsBookmarked(prompt.isBookmarked);
  }, [prompt.isBookmarked]);

  async function handleToggleBookmark() {
    setError(null);

    const result = await toggleBookmark.mutateAsync(prompt.id);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setIsBookmarked((current) => !current);
  }

  return (
    <div className="relative min-w-[260px] max-w-[300px] shrink-0 snap-start sm:min-w-[280px] sm:max-w-[320px] md:min-w-[300px] md:max-w-[340px]">
      <article className="group relative flex min-h-full flex-col rounded-2xl border border-lumina-500/25 bg-surface p-4 transition-colors hover:border-lumina-500/50">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 rounded-full bg-lumina-500/10 px-2.5 py-1 text-sm font-medium whitespace-nowrap text-lumina-500">
            {prompt.topic}
          </span>

          <button
            aria-label={
              isBookmarked ? "Verwijder bookmark" : "Bewaar reflectievraag"
            }
            aria-pressed={isBookmarked}
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500 ${
              isBookmarked
                ? "bg-lumina-500/15 text-lumina-500"
                : "text-muted hover:bg-lumina-500/10 hover:text-lumina-500"
            }`}
            disabled={toggleBookmark.isPending}
            onClick={() => {
              void handleToggleBookmark();
            }}
            type="button"
          >
            {isBookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
          </button>
        </div>

        <Link
          aria-label={`Schrijf over: ${prompt.question}`}
          className="mt-3 flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500"
          href={`/schrijf?vervolg=${prompt.id}`}
        >
          <p className="flex-1 text-sm leading-relaxed text-foreground">
            {prompt.question}
          </p>

          <span className="pointer-events-none mt-3 self-end opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <PencilIcon />
          </span>
        </Link>
      </article>

      {error ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
