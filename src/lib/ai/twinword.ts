import { createHash } from "node:crypto";
import {
  getCachedTwinwordScores,
  getEntryEmotionScores,
  isTwinwordEnabled,
  setCachedTwinwordScores,
  tryReserveTwinwordUsage,
} from "@/lib/ai/api-usage";
import type { EmotionScores } from "@/types/database";

const EMOTION_THRESHOLD = 0.04;

const TWINWORD_EMOTION_MAP: Record<string, keyof EmotionScores> = {
  joy: "joy",
  happiness: "joy",
  anger: "anger",
  sadness: "sadness",
  disgust: "disgust",
  surprise: "surprise",
  fear: "fear",
};

export interface SentimentAnalysisResult {
  scores: EmotionScores;
  dominantEmotion: string | null;
  cached?: boolean;
}

export interface SentimentAnalysisError {
  error: string;
  limitReached?: boolean;
}

export interface AnalyzeEntrySentimentOptions {
  entryId?: string;
  /** Sla entry-cache over (bijv. bij heranalyse na opslaan) */
  skipEntryCache?: boolean;
}

function hashText(text: string): string {
  return createHash("sha256").update(text.trim()).digest("hex");
}

function parseTwinwordPayload(
  rawScores: Record<string, number>,
): SentimentAnalysisResult {
  const scores: EmotionScores = {};

  for (const [key, value] of Object.entries(rawScores)) {
    const mapped = TWINWORD_EMOTION_MAP[key.toLowerCase()];
    if (mapped) {
      scores[mapped] = value;
    }
  }

  let dominantEmotion: string | null = null;
  let highestScore = EMOTION_THRESHOLD;

  for (const [emotion, score] of Object.entries(scores)) {
    if (typeof score === "number" && score > highestScore) {
      highestScore = score;
      dominantEmotion = emotion;
    }
  }

  return { scores, dominantEmotion };
}

function scoresToResult(scores: EmotionScores): SentimentAnalysisResult {
  let dominantEmotion: string | null = null;
  let highestScore = EMOTION_THRESHOLD;

  for (const [emotion, score] of Object.entries(scores)) {
    if (typeof score === "number" && score > highestScore) {
      highestScore = score;
      dominantEmotion = emotion;
    }
  }

  return { scores, dominantEmotion, cached: true };
}

/**
 * Analyseert emoties via Twinword. Verwacht Engelse tekst (vertaling upstream).
 */
export async function analyzeEntrySentiment(
  text: string,
  options: AnalyzeEntrySentimentOptions = {},
): Promise<SentimentAnalysisResult | SentimentAnalysisError> {
  const trimmed = text.trim();

  if (!trimmed) {
    return { error: "Geen tekst om te analyseren." };
  }

  if (!isTwinwordEnabled()) {
    return { error: "Emotie-analyse is uitgeschakeld." };
  }

  if (options.entryId && !options.skipEntryCache) {
    const existingScores = await getEntryEmotionScores(options.entryId);

    if (existingScores && Object.keys(existingScores).length > 0) {
      return scoresToResult(existingScores);
    }
  }

  const textHash = hashText(trimmed);
  const cached = await getCachedTwinwordScores(textHash);

  if (cached) {
    return {
      scores: cached.scores,
      dominantEmotion: cached.dominantEmotion,
      cached: true,
    };
  }

  const reservation = await tryReserveTwinwordUsage();

  if (!reservation.reserved) {
    return {
      error: `Maandlimiet voor emotie-analyse bereikt (${reservation.count}/${reservation.limit}).`,
      limitReached: true,
    };
  }

  const apiKey = process.env.RAPIDAPI_KEY!;

  const response = await fetch(
    "https://twinword-emotion-analysis-v1.p.rapidapi.com/analyze/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-rapidapi-host": "twinword-emotion-analysis-v1.p.rapidapi.com",
        "x-rapidapi-key": apiKey,
      },
      body: new URLSearchParams({ text: trimmed }).toString(),
    },
  );

  if (response.status === 429) {
    return {
      error: "Emotie-analyse: te veel verzoeken. Probeer het later opnieuw.",
      limitReached: true,
    };
  }

  if (!response.ok) {
    return { error: "Emotie-analyse is mislukt." };
  }

  const payload = (await response.json()) as {
    emotion_scores?: Record<string, number>;
  };

  const result = parseTwinwordPayload(payload.emotion_scores ?? {});

  await setCachedTwinwordScores(
    textHash,
    result.scores,
    result.dominantEmotion,
  );

  return result;
}
