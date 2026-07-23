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

const THEME_LABEL_ALIASES = ["name", "theme", "thema", "label"] as const;

const PLACEHOLDER_THEME_LABELS = new Set(["thema", "theme"]);

function isPlaceholderThemeLabel(label: string): boolean {
  return PLACEHOLDER_THEME_LABELS.has(label.toLowerCase());
}

export function getEntryThemeLabel(theme: EntryTheme | string | unknown): string {
  if (typeof theme === "string") {
    return theme.trim();
  }

  if (theme && typeof theme === "object") {
    const record = theme as Record<string, unknown>;

    for (const key of THEME_LABEL_ALIASES) {
      const value = record[key];

      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }

    for (const value of Object.values(record)) {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
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

    if (label && !isPlaceholderThemeLabel(label)) {
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
