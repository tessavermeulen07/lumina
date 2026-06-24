"use client";

import { useState } from "react";
import {
  insightsCardClass,
  insightsSectionHeadingClass,
} from "@/components/insights/insights-styles";
import { WeeklyReportDetailModal } from "@/components/insights/WeeklyReportDetailModal";
import { WeeklyReportProgressCard } from "@/components/insights/WeeklyReportProgressCard";
import { WeeklyReportSummaryCard } from "@/components/insights/WeeklyReportSummaryCard";
import type { WeeklyReportView } from "@/lib/insights/get-weekly-report";

interface WeeklyReportSectionProps {
  view: WeeklyReportView;
}

export function WeeklyReportSection({
  view,
}: Readonly<WeeklyReportSectionProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function openModal() {
    if (view.report) {
      setIsModalOpen(true);
    }
  }

  return (
    <section className="space-y-5">
      <h2 className={insightsSectionHeadingClass}>wekelijks rapport</h2>

      {view.isCurrentWeek ? (
        <WeeklyReportProgressCard onViewReport={openModal} view={view} />
      ) : view.report ? (
        <WeeklyReportSummaryCard
          onOpen={openModal}
          report={view.report}
          weekEndLabel={view.weekEndLabel}
        />
      ) : (
        <section className={insightsCardClass}>
          <p className="text-sm text-muted">
            Deze week was er niet genoeg geschreven voor een rapport.
          </p>
        </section>
      )}

      {isModalOpen && view.report ? (
        <WeeklyReportDetailModal
          onClose={() => setIsModalOpen(false)}
          report={view.report}
          weekEndLabel={view.weekEndLabel}
        />
      ) : null}
    </section>
  );
}
