"use client";

import {
  ANALYSIS_LEVEL_LABELS,
  type AnalysisLevel,
} from "@/lib/insights/analysis-levels";
import {
  insightsCardClass,
  insightsHeadingClass,
} from "@/components/insights/insights-styles";
import type { WeeklyReportView } from "@/lib/insights/get-weekly-report";

const LEVELS: AnalysisLevel[] = [1, 2, 3, 4, 5];

interface WeeklyReportProgressCardProps {
  view: WeeklyReportView;
  onViewReport?: () => void;
}

function unlockMessage(daysUntilUnlock: number): string {
  if (daysUntilUnlock === 0) {
    return "je weekrapport ontgrendelt vandaag";
  }

  if (daysUntilUnlock === 1) {
    return "je weekrapport ontgrendelt over 1 dag";
  }

  return `je weekrapport ontgrendelt over ${daysUntilUnlock} dagen`;
}

export function WeeklyReportProgressCard({
  view,
  onViewReport,
}: Readonly<WeeklyReportProgressCardProps>) {
  const currentLevel = view.analysisLevel ?? 0;
  const hasReport = view.report !== null;

  return (
    <section className={insightsCardClass}>
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-3">
          {!view.isUnlocked ? (
            <span aria-hidden="true" className="shrink-0 text-2xl">
              🔒
            </span>
          ) : null}
          <h3 className={insightsHeadingClass}>Wekelijks rapport</h3>
        </div>
        <p className="mt-2 text-center text-base tracking-wide text-muted [font-variant:small-caps]">
          {!view.isUnlocked
            ? unlockMessage(view.daysUntilUnlock)
            : hasReport
              ? "je weekrapport is klaar"
              : view.analysisLevel
                ? "je rapport wordt gegenereerd…"
                : "schrijf minimaal 50 woorden deze week voor een basisanalyse"}
        </p>
      </div>

      {view.analysisLevel === null ? (
        <p className="mt-4 text-center text-sm text-neutral-400 dark:text-neutral-500">
          {Math.max(50 - view.totalWords, 0)} woorden tot basisanalyse
        </p>
      ) : view.wordsToNextLevel !== null && view.nextLevelLabel ? (
        <p className="mt-4 text-sm text-foreground">
          Nog <strong>{view.wordsToNextLevel}</strong> woorden tot{" "}
          {view.nextLevelLabel.toLowerCase()}
        </p>
      ) : currentLevel === 5 ? (
        <p className="mt-4 text-sm text-foreground">
          Je hebt het hoogste analyse-niveau bereikt deze week.
        </p>
      ) : null}

      <div className="mt-6">
        <div className="flex gap-2">
          {LEVELS.map((level) => {
            const isFilled = currentLevel >= level;
            const isActive = currentLevel === level;

            return (
              <div className="flex flex-1 flex-col items-center gap-2" key={level}>
                <div
                  className={`h-3 w-full rounded-sm transition-colors ${isFilled
                    ? isActive
                      ? "bg-lumina-500"
                      : "bg-lumina-500/50"
                    : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  title={ANALYSIS_LEVEL_LABELS[level]}
                />
                <span className="hidden text-center text-[10px] leading-tight text-muted sm:block">
                  {ANALYSIS_LEVEL_LABELS[level]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {hasReport && view.report ? (
        <div className="mt-6 border-t border-neutral-200 pt-5 dark:border-neutral-700">
          <p className="text-sm font-medium text-foreground">
            {view.report.headline}
          </p>
          {onViewReport ? (
            <button
              className="mt-3 text-sm font-medium text-lumina-500 hover:text-lumina-600 dark:hover:text-lumina-300"
              onClick={onViewReport}
              type="button"
            >
              Bekijk rapport
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
