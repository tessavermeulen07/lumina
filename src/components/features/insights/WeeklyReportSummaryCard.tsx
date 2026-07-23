"use client";

import { insightsCardClass } from "@/components/features/insights/insights-styles";
import type { WeeklyReport } from "@/types/database";

interface WeeklyReportSummaryCardProps {
  report: WeeklyReport;
  weekEndLabel: string;
  onOpen: () => void;
}

export function WeeklyReportSummaryCard({
  report,
  weekEndLabel,
  onOpen,
}: Readonly<WeeklyReportSummaryCardProps>) {
  return (
    <button
      className={`${insightsCardClass} w-full text-left transition-colors hover:border-lumina-500/40`}
      onClick={onOpen}
      type="button"
    >
      <p className="text-base font-medium text-foreground">{report.headline}</p>
      <p className="mt-2 text-sm text-lumina-500">{weekEndLabel}</p>
    </button>
  );
}
