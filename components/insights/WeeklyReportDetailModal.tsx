"use client";

import { useCallback, useEffect } from "react";
import {
  insightsCardClass,
  insightsHeadingClass,
} from "@/components/insights/insights-styles";
import type { WeeklyReport } from "@/lib/types/database";

interface WeeklyReportDetailModalProps {
  report: WeeklyReport;
  weekEndLabel: string;
  onClose: () => void;
}

export function WeeklyReportDetailModal({
  report,
  weekEndLabel,
  onClose,
}: Readonly<WeeklyReportDetailModalProps>) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  const isDeepAnalysis = report.analysis_level === 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Sluit dialoog"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
        type="button"
      />

      <div
        aria-labelledby="weekly-report-title"
        aria-modal="true"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-lumina-500/25 bg-surface shadow-lg"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-lumina-500/15 px-6 py-5">
          <div className="min-w-0 flex-1">
            <h2
              className="text-lg font-bold text-foreground"
              id="weekly-report-title"
            >
              {report.headline}
            </h2>
            <p className="mt-2 text-sm text-lumina-500">{weekEndLabel}</p>
            {isDeepAnalysis ? (
              <span className="mt-3 inline-flex rounded-full bg-lumina-500/15 px-3 py-1 text-xs font-medium text-lumina-600 dark:text-lumina-300">
                Diepgaande analyse
              </span>
            ) : null}
          </div>
          <button
            aria-label="Sluiten"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-lumina-500/10 hover:text-foreground"
            onClick={handleClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className={`${insightsCardClass} space-y-6`}>
            {report.sections.map((section) => (
              <div key={section.title}>
                <h3 className={insightsHeadingClass}>{section.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
