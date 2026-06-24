import {
  insightsCardClass,
  insightsHeadingClass,
  insightsTagClass,
} from "@/components/insights/insights-styles";
import {
  EMOTION_COLUMN_IDS,
  scoreForColumn,
  type EmotionColumnId,
} from "@/lib/ai/emotion-scores";
import type { EmotionScores } from "@/lib/types/database";
import type { EntryFeeling } from "@/lib/types/entry-analysis";

const COLUMN_EMOJIS: Record<EmotionColumnId, string> = {
  sadness: "😢",
  fear: "😟",
  joy: "😁",
  positive: "😍",
  anger: "😡",
  surprise: "😲",
};


interface EmotionalLandscapeProps {
  emotionAverages: EmotionScores;
  feelings: EntryFeeling[];
}

export function EmotionalLandscape({
  emotionAverages,
  feelings,
}: Readonly<EmotionalLandscapeProps>) {
  const barScores = EMOTION_COLUMN_IDS.map((columnId) =>
    scoreForColumn(columnId, emotionAverages),
  );
  const hasFeelings = feelings.length > 0;
  const hasEmotions = barScores.some((score) => score > 0);
  const maxScore = Math.max(...barScores, 0.01);

  if (!hasFeelings && !hasEmotions) {
    return (
      <section className={insightsCardClass}>
        <h2 className={insightsHeadingClass}>Emoties</h2>
        <p className="mt-4 text-sm text-muted">
          Nog geen emotionele data deze week. Rond een entry af om inzichten te
          zien.
        </p>
      </section>
    );
  }

  return (
    <section className={insightsCardClass}>
      <h2 className={insightsHeadingClass}>Emoties</h2>

      {feelings.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {feelings.map((feeling) => (
            <li className={insightsTagClass} key={feeling.key}>
              {feeling.label}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6">
        <div className="flex items-end justify-between gap-2 px-1 sm:gap-4 sm:px-4">
          {EMOTION_COLUMN_IDS.map((columnId, index) => {
            const score = barScores[index] ?? 0;
            const heightPercent =
              score > 0 ? Math.max((score / maxScore) * 100, 18) : 0;

            return (
              <div
                className="flex flex-1 flex-col items-center"
                key={columnId}
              >
                <div className="flex h-28 w-full items-end justify-center">
                  {heightPercent > 0 ? (
                    <div
                      className="w-10 rounded-t-xl bg-[#8b7fd4] sm:w-12"
                      style={{ height: `${heightPercent}%` }}
                      title={`${Math.round(score * 100)}%`}
                    />
                  ) : (
                    <div className="w-10 sm:w-12" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          aria-hidden="true"
          className="mx-1 border-t border-neutral-300 dark:border-neutral-600 sm:mx-4"
        />

        <div className="mt-3 flex justify-between gap-2 px-1 sm:gap-4 sm:px-4">
          {EMOTION_COLUMN_IDS.map((columnId) => (
            <span
              aria-hidden="true"
              className="flex flex-1 justify-center text-2xl sm:text-3xl"
              key={columnId}
            >
              {COLUMN_EMOJIS[columnId]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
