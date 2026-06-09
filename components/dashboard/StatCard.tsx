interface StatCardProps {
  label: string;
  value: string;
  description?: string;
  compact?: boolean;
}

export function StatCard({
  label,
  value,
  description,
  compact = false,
}: Readonly<StatCardProps>) {
  if (compact) {
    return (
      <article className="flex h-full flex-col items-center justify-center rounded-2xl border border-lumina-500/25 bg-surface p-4 text-center md:p-5">
        <p className="text-2xl font-semibold text-foreground md:text-3xl">{value}</p>
        <p className="mt-1 text-xs text-muted md:text-sm">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        ) : null}
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-lumina-500/25 bg-surface p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
      {description ? (
        <p className="mt-1 text-sm text-muted">{description}</p>
      ) : null}
    </article>
  );
}
