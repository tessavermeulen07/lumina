import Link from "next/link";

interface PromptCardProps {
  text: string;
}

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

export function PromptCard({ text }: Readonly<PromptCardProps>) {
  return (
    <Link
      aria-label={`Schrijf over: ${text}`}
      className="group relative flex min-h-full min-w-[200px] max-w-[220px] shrink-0 snap-start flex-col rounded-2xl border border-lumina-500/25 bg-surface p-4 transition-colors hover:border-lumina-500/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500"
      href="/schrijf"
    >
      <span className="rounded-full bg-lumina-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-lumina-500">
        Voor jou
      </span>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
        {text}
      </p>
      <span className="pointer-events-none absolute right-3 bottom-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <PencilIcon />
      </span>
    </Link>
  );
}
