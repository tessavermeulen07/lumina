import { mergeEmotionScores } from "@/lib/ai/emotion-scores";
import type { EntryAnalysis, EmotionScores } from "@/types/database";
import type { EntryFeeling } from "@/types/entry-analysis";

export function resolveAnalysisEmotionScores(
  analysis: EntryAnalysis,
): EmotionScores | null {
  return mergeEmotionScores(
    analysis.emotion_scores,
    analysis.feelings as EntryFeeling[],
  );
}

export function averageEmotionScores(analyses: EntryAnalysis[]): EmotionScores {
  const totals: EmotionScores = {};
  let count = 0;

  for (const analysis of analyses) {
    const scores = resolveAnalysisEmotionScores(analysis);

    if (!scores) continue;

    count += 1;

    for (const [emotion, score] of Object.entries(scores)) {
      totals[emotion] = (totals[emotion] ?? 0) + score;
    }
  }

  if (count === 0) return {};

  const averages: EmotionScores = {};

  for (const [emotion, total] of Object.entries(totals)) {
    averages[emotion] = total / count;
  }

  return averages;
}
