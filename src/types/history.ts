import type { EntryAnalysis } from "@/types/database";

export interface HistoryEntryItem {
  id: string;
  created_at: string;
  is_bookmarked: boolean;
  is_private: boolean;
  is_unlocked: boolean;
  analysis: EntryAnalysis | null;
}

export interface HistoryDayGroup {
  dateKey: string;
  label: string;
  entries: HistoryEntryItem[];
}

export interface HistoryWeekData {
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  isCurrentWeek: boolean;
  hasPreviousWeek: boolean;
  hasNextWeek: boolean;
  previousWeekStart: string | null;
  nextWeekStart: string | null;
  dayGroups: HistoryDayGroup[];
}
