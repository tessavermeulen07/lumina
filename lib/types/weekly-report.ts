export interface WeeklyReportSection {
  title: string;
  content: string;
}

export interface WeeklyReportData {
  headline: string;
  sections: WeeklyReportSection[];
}
