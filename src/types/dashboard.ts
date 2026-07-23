export interface DashboardStats {
  streak: number;
  entryCount: number;
  wordCount: number;
}

export interface WeekDay {
  label: string;
  date: string;
  hasEntry: boolean;
  isToday: boolean;
}

export interface DashboardOverviewData {
  weekDays: WeekDay[];
  stats: DashboardStats;
}
