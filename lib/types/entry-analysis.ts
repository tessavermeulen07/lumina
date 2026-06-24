export interface EntryFeeling {
  key: string;
  label: string;
  emoji: string;
  intensity?: number;
}

export interface EntryPerson {
  name: string;
  mention_count: number;
}

export interface EntryTheme {
  name: string;
}

export interface EntryAnalysisData {
  title: string;
  summary: string;
  reflection_text: string;
  key_insight: string;
  feelings: EntryFeeling[];
  persons: EntryPerson[];
  themes: EntryTheme[];
  word_count: number;
  emotion_scores: Record<string, number> | null;
}
