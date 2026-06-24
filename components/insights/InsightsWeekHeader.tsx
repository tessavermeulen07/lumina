"use client";

import { useRouter } from "next/navigation";

interface InsightsWeekHeaderProps {
  weekLabel: string;
  isCurrentWeek: boolean;
  hasPreviousWeek: boolean;
  hasNextWeek: boolean;
  previousWeekStart: string | null;
  nextWeekStart: string | null;
}

export function InsightsWeekHeader({
  weekLabel,
  isCurrentWeek,
  hasPreviousWeek,
  hasNextWeek,
  previousWeekStart,
  nextWeekStart,
}: Readonly<InsightsWeekHeaderProps>) {
  const router = useRouter();

  function navigateWeek(weekStart: string | null) {
    const params = new URLSearchParams();

    if (weekStart) {
      params.set("week", weekStart);
    }

    const query = params.toString();
    router.push(query ? `/inzichten?${query}` : "/inzichten");
  }

  return (
    <header className="rounded-xl border border-lumina-500/20 bg-surface px-4 py-5 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <button
          aria-label="Vorige week"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lumina-500 transition-colors hover:bg-lumina-500/10 disabled:cursor-not-allowed disabled:opacity-30"
          disabled={!hasPreviousWeek}
          onClick={() => navigateWeek(previousWeekStart)}
          type="button"
        >
          <span aria-hidden="true" className="text-xl">
            ‹
          </span>
        </button>

        <div className="min-w-0 flex-1 text-center">
          {isCurrentWeek ? (
            <>
              <p className="text-base font-medium text-foreground">Deze week</p>
              <p className="mt-1 text-sm text-lumina-500">{weekLabel}</p>
            </>
          ) : (
            <p className="text-base font-medium text-foreground">{weekLabel}</p>
          )}
        </div>

        {hasNextWeek ? (
          <button
            aria-label="Volgende week"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lumina-500 transition-colors hover:bg-lumina-500/10"
            onClick={() => navigateWeek(nextWeekStart)}
            type="button"
          >
            <span aria-hidden="true" className="text-xl">
              ›
            </span>
          </button>
        ) : (
          <span aria-hidden="true" className="h-10 w-10 shrink-0" />
        )}
      </div>
    </header>
  );
}
