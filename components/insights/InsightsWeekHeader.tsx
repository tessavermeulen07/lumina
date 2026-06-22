interface InsightsWeekHeaderProps {
  weekLabel: string;
  isCurrentWeek: boolean;
}

export function InsightsWeekHeader({
  weekLabel,
  isCurrentWeek,
}: Readonly<InsightsWeekHeaderProps>) {
  return (
    <header className="rounded-xl border border-lumina-500/20 bg-surface px-6 py-5 text-center">
      {isCurrentWeek ? (
        <>
          <p className="text-base font-medium text-foreground">Deze week</p>
          <p className="mt-1 text-sm text-lumina-500">{weekLabel}</p>
        </>
      ) : (
        <p className="text-base font-medium text-foreground">{weekLabel}</p>
      )}
    </header>
  );
}
