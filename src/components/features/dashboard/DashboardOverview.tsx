import { StatCard } from "@/components/features/dashboard/StatCard";
import type { DashboardOverviewData } from "@/types/dashboard";

interface DashboardOverviewProps {
  data: DashboardOverviewData;
}

function formatToday(date = new Date()): string {
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function DashboardOverview({ data }: Readonly<DashboardOverviewProps>) {
  const { weekDays, stats } = data;

  return (
    <section className="flex flex-col gap-3 md:flex-row md:items-stretch">
      <article className="w-fit shrink-0 rounded-2xl border border-lumina-500/25 bg-surface p-3 md:p-4">
        <h1 className="font-serif text-lg capitalize text-foreground md:text-xl">
          {formatToday()}
        </h1>

        <div
          aria-label="Schrijfdagen deze week"
          className="mt-2 flex items-center gap-1.5"
          role="list"
        >
          {weekDays.map((day) => (
            <div
              key={day.date}
              className="flex flex-col items-center gap-1"
              role="listitem"
            >
              <span className="text-[0.65rem] text-muted sm:text-xs">
                {day.label}
              </span>
              <span
                aria-label={
                  day.hasEntry
                    ? `${day.label}: geschreven`
                    : `${day.label}: nog niet geschreven`
                }
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  day.hasEntry
                    ? "bg-lumina-500 text-surface"
                    : "border border-lumina-500/25 bg-background text-muted"
                } ${day.isToday ? "ring-2 ring-lumina-300 ring-offset-1 ring-offset-surface" : ""}`}
              >
                {day.hasEntry ? (
                  <svg
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-lumina-500/20" />
                )}
              </span>
            </div>
          ))}
        </div>
      </article>

      <div
        aria-label="Statistieken"
        className="grid min-w-0 flex-1 grid-cols-3 gap-3"
      >
        <StatCard
          compact
          description="dagen op rij"
          label="Streak"
          value={String(stats.streak)}
        />
        <StatCard
          compact
          label="Entries"
          value={String(stats.entryCount)}
        />
        <StatCard
          compact
          label="Woorden"
          value={stats.wordCount.toLocaleString("nl-NL")}
        />
      </div>
    </section>
  );
}
