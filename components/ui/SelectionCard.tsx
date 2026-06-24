interface SelectionCardProps {
  label: string;
  description?: string;
  isSelected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function SelectionCard({
  label,
  description,
  isSelected,
  disabled = false,
  onClick,
}: Readonly<SelectionCardProps>) {
  const baseClasses =
    "w-full rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-900";
  const stateClasses = isSelected
    ? "border-lumina-500 bg-lumina-300/15 ring-2 ring-lumina-100/50"
    : "border-lumina-500/25 bg-surface hover:border-lumina-500/50";

  return (
    <button
      aria-pressed={isSelected}
      className={`${baseClasses} ${stateClasses} disabled:cursor-not-allowed disabled:opacity-60`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="block font-serif text-lg text-foreground">{label}</span>
      {description ? (
        <span className="mt-2 block text-sm leading-relaxed text-muted">
          {description}
        </span>
      ) : null}
    </button>
  );
}
