import type { EntryAnalysis, ReflectionPeriod } from "@/lib/types/database";

export interface CheckInCardData {
  period: ReflectionPeriod;
  label: string;
  prompt: string;
  contextSnippet: string;
  hint: string;
  isCompleted: boolean;
  isAvailable: boolean;
  href: string;
}

export interface FollowUpPromptCardData {
  id: string;
  topic: string;
  question: string;
  isBookmarked: boolean;
}

export interface DailyCheckInData {
  ochtend: CheckInCardData;
  avond: CheckInCardData;
}

export interface EntryWithAnalysis {
  id: string;
  content: string;
  created_at: string;
  reflection_period: ReflectionPeriod | null;
  analysis: EntryAnalysis | null;
}
