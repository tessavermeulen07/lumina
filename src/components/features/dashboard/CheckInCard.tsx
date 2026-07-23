import { Button } from "@/components/ui/Button";
import type { CheckInCardData } from "@/types/dashboard-reflection";
import type { ReflectionPeriod } from "@/types/database";

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 text-white"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function MorningIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3v2.25M12 18.75V21M4.22 4.22l1.59 1.59M18.19 18.19l1.59 1.59M3 12h2.25M18.75 12H21M4.22 19.78l1.59-1.59M18.19 5.81l1.59-1.59"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function EveningIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 14.25A7.5 7.5 0 1110.5 3.75a6 6 0 109.5 10.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 5.5l.25 1M20 8.75l1 .25M18.5 12l.25 1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckInIllustration({ period }: Readonly<{ period: ReflectionPeriod }>) {
  return (
    <div
      aria-hidden="true"
      className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-lumina-500/10 text-lumina-500"
    >
      {period === "ochtend" ? <MorningIllustration /> : <EveningIllustration />}
    </div>
  );
}

interface CheckInCardProps {
  data: CheckInCardData;
}

export function CheckInCard({ data }: Readonly<CheckInCardProps>) {
  return (
    <article
      className={`relative flex w-full flex-col items-center rounded-2xl border border-lumina-500/25 bg-surface p-6 ${
        data.isCompleted ? "bg-lumina-100/20" : ""
      }`}
    >
      {data.isCompleted ? (
        <span
          aria-label="Afgerond"
          className="absolute top-4 right-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-lumina-300"
        >
          <CheckIcon />
        </span>
      ) : null}

      <CheckInIllustration period={data.period} />

      <p className="text-xl font-semibold text-lumina-500">{data.label}</p>
      <p className="mt-2 w-full whitespace-pre-line text-left text-lg leading-relaxed text-foreground">
        {data.hint}
      </p>

      <div className="mt-4 flex w-full justify-center">
        {!data.isAvailable ? (
          <p className="w-full text-left text-sm text-muted">
            Beschikbaar vanaf 18:00
          </p>
        ) : data.isCompleted ? (
          <Button href={data.href} variant="outline">
            Afgerond
          </Button>
        ) : (
          <Button href={data.href} variant="outline">
            Schrijf je check-in
          </Button>
        )}
      </div>
    </article>
  );
}
