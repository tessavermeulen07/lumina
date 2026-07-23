import type {
  EntryFeeling,
  EntryPerson,
  EntryTheme,
} from "@/types/entry-analysis";
import type { WeeklyReportSection } from "@/types/weekly-report";
import type {
  AiCoachStyle,
  JournalExperience,
  OnboardingMainGoal,
  OnboardingPriority,
} from "@/types/onboarding";
import type { GoalFrequency } from "@/types/goal";

export type HabitType = "habit" | "intention";

export type HabitLogStatus = "completed" | "skipped" | "failed";
export type CheckinQueueStatus = "pending" | "completed" | "skipped";
export type CheckinPopupType = "goals" | "ochtend_reflectie" | "avond_reflectie";

export type ReflectionPeriod = "ochtend" | "avond";

export interface Profile {
  id: string;
  username: string;
  ai_persona_preference: AiCoachStyle | null;
  timezone: string;
  goals_checkin_time: string;
  morning_reflection_time: string;
  evening_reflection_time: string;
  onboarding_main_goal: OnboardingMainGoal | null;
  onboarding_priorities: OnboardingPriority[];
  onboarding_experience: JournalExperience | null;
  onboarding_completed_at: string | null;
  updated_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  content: string;
  summary: string | null;
  reflection_period: ReflectionPeriod | null;
  is_bookmarked: boolean;
  bookmarked_at: string | null;
  is_private: boolean;
  private_password_hash: string | null;
  created_at: string;
}

export interface EntryAiResponse {
  id: string;
  entry_id: string;
  action: string;
  response_text: string;
  sort_order: number;
  created_at: string;
}

export interface EntryUserBlock {
  id: string;
  entry_id: string;
  content: string;
  sort_order: number;
  created_at: string;
}

export interface EntryAnalysis {
  id: string;
  entry_id: string;
  title: string;
  summary: string;
  reflection_text: string;
  key_insight: string;
  feelings: EntryFeeling[];
  persons: EntryPerson[];
  themes: EntryTheme[];
  word_count: number;
  emotion_scores: EmotionScores | null;
  analyzed_at: string;
}

export interface EmotionScores {
  [emotion: string]: number;
}

export interface EmotionAnalysis {
  id: string;
  entry_id: string;
  scores: EmotionScores;
  dominant_emotion: string;
  analyzed_at: string;
}

export interface HabitAndIntention {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: HabitType;
  category: string;
  frequency: GoalFrequency;
  is_active: boolean;
  window_start_date: string;
  window_end_date: string;
  created_at: string;
}

export interface GoalCategory {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  status: HabitLogStatus;
  ai_checkin_prompt: string | null;
  logged_at: string;
}

export interface IntentionCheckinQueueItem {
  id: string;
  user_id: string;
  intention_id: string;
  due_for_date: string;
  status: CheckinQueueStatus;
  created_at: string;
  processed_at: string | null;
}

export interface CheckinPopupState {
  id: string;
  user_id: string;
  popup_type: CheckinPopupType;
  popup_date: string;
  shown_at: string;
  dismissed_at: string | null;
  completed_at: string | null;
}

export interface AiInsightPatterns {
  themes?: string[];
  emotions?: string[];
  [key: string]: unknown;
}

export interface AiInsight {
  id: string;
  user_id: string;
  insight_text: string;
  patterns_detected: AiInsightPatterns | null;
  date_from: string;
  date_to: string;
}

export interface WeeklyReport {
  id: string;
  user_id: string;
  week_start: string;
  analysis_level: number;
  headline: string;
  sections: WeeklyReportSection[];
  total_words: number;
  generated_at: string;
}

export type QuestionCategory =
  | "stress_angst"
  | "patronen"
  | "intenties"
  | "emotieregulatie";

export type QuestionFramework =
  | "cbt"
  | "groei_reflectie"
  | "gedragsactivatie"
  | "act";

export interface Question {
  id: string;
  category: QuestionCategory;
  framework: QuestionFramework;
  question_text: string;
}

export interface ReflectionPrompt {
  id: string;
  user_id: string;
  topic: string;
  question: string;
  is_bookmarked: boolean;
  prompt_date: string | null;
  entry_id: string | null;
  bookmarked_at: string | null;
  created_at: string;
}

export interface DashboardReflectionCache {
  user_id: string;
  cache_date: string;
  cache_key: string;
  payload: Record<string, unknown>;
  generated_at: string;
}

export type ContactCategory = "algemene_vraag" | "support" | "klacht";

export interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  category: ContactCategory;
  message: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "updated_at"> & { updated_at?: string };
        Update: Partial<Omit<Profile, "id">>;
      };
      entries: {
        Row: Entry;
        Insert: Omit<Entry, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Entry, "id" | "user_id">>;
      };
      entry_ai_responses: {
        Row: EntryAiResponse;
        Insert: Omit<EntryAiResponse, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<EntryAiResponse, "id" | "entry_id">>;
      };
      entry_user_blocks: {
        Row: EntryUserBlock;
        Insert: Omit<EntryUserBlock, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<EntryUserBlock, "id" | "entry_id" | "sort_order">>;
      };
      entry_analyses: {
        Row: EntryAnalysis;
        Insert: Omit<EntryAnalysis, "id" | "analyzed_at"> & {
          id?: string;
          analyzed_at?: string;
        };
        Update: Partial<Omit<EntryAnalysis, "id" | "entry_id">>;
      };
      emotion_analyses: {
        Row: EmotionAnalysis;
        Insert: Omit<EmotionAnalysis, "id" | "analyzed_at"> & {
          id?: string;
          analyzed_at?: string;
        };
        Update: Partial<Omit<EmotionAnalysis, "id" | "entry_id">>;
      };
      habits_and_intentions: {
        Row: HabitAndIntention;
        Insert: Omit<HabitAndIntention, "id" | "created_at" | "is_active"> & {
          id?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Omit<HabitAndIntention, "id" | "user_id">>;
      };
      goal_categories: {
        Row: GoalCategory;
        Insert: Omit<GoalCategory, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<GoalCategory, "id" | "user_id">>;
      };
      habit_logs: {
        Row: HabitLog;
        Insert: Omit<HabitLog, "id" | "logged_at"> & {
          id?: string;
          logged_at?: string;
        };
        Update: Partial<Omit<HabitLog, "id" | "habit_id">>;
      };
      intention_checkin_queue: {
        Row: IntentionCheckinQueueItem;
        Insert: Omit<IntentionCheckinQueueItem, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Omit<IntentionCheckinQueueItem, "id" | "user_id" | "intention_id">
        >;
      };
      checkin_popup_state: {
        Row: CheckinPopupState;
        Insert: Omit<CheckinPopupState, "id" | "shown_at"> & {
          id?: string;
          shown_at?: string;
        };
        Update: Partial<
          Omit<CheckinPopupState, "id" | "user_id" | "popup_type" | "popup_date">
        >;
      };
      ai_insights: {
        Row: AiInsight;
        Insert: Omit<AiInsight, "id"> & { id?: string };
        Update: Partial<Omit<AiInsight, "id" | "user_id">>;
      };
      weekly_reports: {
        Row: WeeklyReport;
        Insert: Omit<WeeklyReport, "id" | "generated_at"> & {
          id?: string;
          generated_at?: string;
        };
        Update: Partial<Omit<WeeklyReport, "id" | "user_id" | "week_start">>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, "id"> & { id?: string };
        Update: Partial<Omit<Question, "id">>;
      };
      reflection_prompts: {
        Row: ReflectionPrompt;
        Insert: Omit<
          ReflectionPrompt,
          "id" | "created_at" | "is_bookmarked" | "bookmarked_at" | "entry_id"
        > & {
          id?: string;
          created_at?: string;
          is_bookmarked?: boolean;
          bookmarked_at?: string | null;
          entry_id?: string | null;
        };
        Update: Partial<Omit<ReflectionPrompt, "id" | "user_id">>;
      };
      dashboard_reflection_cache: {
        Row: DashboardReflectionCache;
        Insert: Omit<DashboardReflectionCache, "generated_at"> & {
          generated_at?: string;
        };
        Update: Partial<
          Omit<DashboardReflectionCache, "user_id" | "cache_date" | "cache_key">
        >;
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: Omit<ContactSubmission, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ContactSubmission, "id">>;
      };
    };
  };
}
