"use client";

interface HistoryWeekHeaderProps {
  weekLabel: string;
  isCurrentWeek: boolean;
  hasPreviousWeek: boolean;
  hasNextWeek: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function HistoryWeekHeader({
  weekLabel,
  isCurrentWeek,
  hasPreviousWeek,
  hasNextWeek,
  onPreviousWeek,
  onNextWeek,
}: Readonly<HistoryWeekHeaderProps>) {
  return (
    <div className="flex items-center justify-between gap-4">
      <button
        aria-label="Vorige week"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lumina-500 transition-colors hover:bg-lumina-500/10 disabled:cursor-not-allowed disabled:opacity-30"
        disabled={!hasPreviousWeek}
        onClick={onPreviousWeek}
        type="button"
      >
        <span aria-hidden="true" className="text-xl">
          ‹
        </span>
      </button>

      <div className="min-w-0 flex-1 text-center">
        {isCurrentWeek ? (
          <p className="text-base font-medium text-foreground">Deze week</p>
        ) : null}
        <p className="text-sm text-lumina-500">{weekLabel}</p>
      </div>

      {hasNextWeek ? (
        <button
          aria-label="Volgende week"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lumina-500 transition-colors hover:bg-lumina-500/10"
          onClick={onNextWeek}
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
  );
}
