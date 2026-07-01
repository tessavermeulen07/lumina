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

export function getEntryThemeLabel(theme: EntryTheme | string | unknown): string {
  if (typeof theme === "string") {
    return theme.trim();
  }

  if (theme && typeof theme === "object") {
    const record = theme as Record<string, unknown>;

    if (typeof record.name === "string" && record.name.trim()) {
      return record.name.trim();
    }

    const firstKey = Object.keys(record)[0];

    if (firstKey) {
      return firstKey.trim();
    }
  }

  return "Thema";
}

export function normalizeEntryThemes(themes: unknown): EntryTheme[] {
  if (!Array.isArray(themes)) {
    return [];
  }

  const normalized: EntryTheme[] = [];

  for (const theme of themes) {
    const label = getEntryThemeLabel(theme);

    if (label && label !== "Thema") {
      normalized.push({ name: label });
    }
  }

  return normalized;
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
