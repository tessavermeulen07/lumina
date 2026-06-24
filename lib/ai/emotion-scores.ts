import type { EmotionScores } from "@/lib/types/database";
import type { EntryFeeling } from "@/lib/types/entry-analysis";

export const EMOTION_KEYS = [
  "sadness",
  "fear",
  "joy",
  "anger",
  "surprise",
  "disgust",
] as const;

export type EmotionKey = (typeof EMOTION_KEYS)[number];

/** Kolom-id's in EmotionalLandscape */
export const EMOTION_COLUMN_IDS = [
  "sadness",
  "fear",
  "joy",
  "positive",
  "anger",
  "surprise",
] as const;

export type EmotionColumnId = (typeof EMOTION_COLUMN_IDS)[number];

const SCORE_THRESHOLD = 0.04;

const FEELING_KEY_ALIASES: Record<string, EmotionKey> = {
  sadness: "sadness",
  verdriet: "sadness",
  fear: "fear",
  angst: "fear",
  bezorgd: "fear",
  joy: "joy",
  vreugde: "joy",
  blij: "joy",
  anger: "anger",
  boosheid: "anger",
  boos: "anger",
  surprise: "surprise",
  verrassing: "surprise",
  verrast: "surprise",
  disgust: "disgust",
  walging: "disgust",
};

/** Affectie/verbondenheid — apart van algemene blijdschap of verrassing */
const AFFECTION_KEY_ALIASES = new Set([
  "love",
  "positive",
  "liefde",
  "verliefd",
  "geliefd",
  "dankbaar",
  "affection",
]);

const COLUMN_FOR_KEY: Record<EmotionKey, EmotionColumnId[]> = {
  sadness: ["sadness"],
  fear: ["fear"],
  joy: ["joy"],
  anger: ["anger"],
  surprise: ["surprise"],
  disgust: ["surprise"],
};

export function isAffectionFeelingKey(key: string): boolean {
  return AFFECTION_KEY_ALIASES.has(key.toLowerCase().trim());
}

export function normalizeFeelingKey(key: string): EmotionKey | null {
  const normalized = key.toLowerCase().trim();
  return FEELING_KEY_ALIASES[normalized] ?? null;
}

export function normalizeIntensity(intensity: number | undefined): number {
  if (intensity === undefined || Number.isNaN(intensity)) {
    return 0.5;
  }

  if (intensity > 1) {
    return Math.min(intensity / 5, 1);
  }

  return Math.max(0, Math.min(intensity, 1));
}

export function scoresFromFeelings(feelings: EntryFeeling[]): EmotionScores {
  const scores: EmotionScores = {};

  for (const feeling of feelings) {
    const value = normalizeIntensity(feeling.intensity);

    if (isAffectionFeelingKey(feeling.key)) {
      scores.positive = Math.max(scores.positive ?? 0, value);
      continue;
    }

    const key = normalizeFeelingKey(feeling.key);

    if (!key) {
      continue;
    }

    scores[key] = Math.max(scores[key] ?? 0, value);
  }

  return scores;
}

export function isEmptyTwinwordScores(scores: EmotionScores | null): boolean {
  if (!scores) {
    return true;
  }

  return !Object.values(scores).some(
    (value) => typeof value === "number" && value > SCORE_THRESHOLD,
  );
}

export function mergeEmotionScores(
  twinwordScores: EmotionScores | null,
  feelings: EntryFeeling[],
): EmotionScores | null {
  const fromFeelings = scoresFromFeelings(feelings);
  const twinwordEmpty = isEmptyTwinwordScores(twinwordScores);

  if (twinwordEmpty && Object.keys(fromFeelings).length === 0) {
    return null;
  }

  if (twinwordEmpty) {
    return fromFeelings;
  }

  const merged: EmotionScores = { ...fromFeelings };

  for (const [emotion, score] of Object.entries(twinwordScores ?? {})) {
    if (typeof score !== "number") {
      continue;
    }

    merged[emotion] = Math.max(merged[emotion] ?? 0, score);
  }

  return merged;
}

export function getDominantEmotion(scores: EmotionScores): string | null {
  let dominant: string | null = null;
  let highest = SCORE_THRESHOLD;

  for (const [emotion, score] of Object.entries(scores)) {
    if (typeof score === "number" && score > highest) {
      highest = score;
      dominant = emotion;
    }
  }

  return dominant;
}

export function groupFeelingsByColumn(
  feelings: EntryFeeling[],
): Record<EmotionColumnId, EntryFeeling[]> {
  const grouped = Object.fromEntries(
    EMOTION_COLUMN_IDS.map((id) => [id, [] as EntryFeeling[]]),
  ) as Record<EmotionColumnId, EntryFeeling[]>;

  const seenPerColumn = new Map<EmotionColumnId, Set<string>>();

  for (const feeling of feelings) {
    if (isAffectionFeelingKey(feeling.key)) {
      const seen = seenPerColumn.get("positive") ?? new Set<string>();
      const dedupeKey = feeling.label.toLowerCase();

      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        seenPerColumn.set("positive", seen);
        grouped.positive.push(feeling);
      }

      continue;
    }

    const key = normalizeFeelingKey(feeling.key);

    if (!key) {
      continue;
    }

    const columns = COLUMN_FOR_KEY[key];

    for (const columnId of columns) {
      const seen = seenPerColumn.get(columnId) ?? new Set<string>();
      const dedupeKey = feeling.label.toLowerCase();

      if (seen.has(dedupeKey)) {
        continue;
      }

      seen.add(dedupeKey);
      seenPerColumn.set(columnId, seen);
      grouped[columnId].push(feeling);
    }
  }

  return grouped;
}

export function mergeFeelingsByColumn(
  columns: Record<EmotionColumnId, EntryFeeling[]>[],
): Record<EmotionColumnId, EntryFeeling[]> {
  const merged = groupFeelingsByColumn([]);

  for (const column of columns) {
    for (const columnId of EMOTION_COLUMN_IDS) {
      for (const feeling of column[columnId]) {
        const exists = merged[columnId].some(
          (item) => item.label.toLowerCase() === feeling.label.toLowerCase(),
        );

        if (!exists) {
          merged[columnId].push(feeling);
        }
      }
    }
  }

  return merged;
}

export function scoreForColumn(
  columnId: EmotionColumnId,
  averages: EmotionScores,
): number {
  switch (columnId) {
    case "sadness":
      return averages.sadness ?? 0;
    case "fear":
      return averages.fear ?? 0;
    case "joy":
      return averages.joy ?? 0;
    case "positive":
      return averages.positive ?? 0;
    case "anger":
      return averages.anger ?? 0;
    case "surprise":
      return averages.surprise ?? 0;
    default:
      return 0;
  }
}
