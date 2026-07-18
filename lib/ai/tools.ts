import { tool } from "ai";
import { z } from "zod";
import { getQuestionsForUseCase } from "@/lib/ai/question-context";
import { searchJournalHistory } from "@/lib/ai/search-journal";
import { saveAiInsight } from "@/lib/ai/save-insight";
import {
  getDominantEmotion,
  mergeEmotionScores,
} from "@/lib/ai/emotion-scores";
import { translateForSentiment } from "@/lib/ai/translate-for-sentiment";
import { analyzeEntrySentiment } from "@/lib/ai/twinword";
import { createClient } from "@/lib/supabase/server";
import type { AiUseCase } from "@/lib/ai/question-context";
import type { AiInsightPatterns } from "@/lib/types/database";
import type { EntryFeeling } from "@/lib/types/entry-analysis";

export interface LuminaToolContext {
  userId: string;
  defaultEntryId?: string;
}

async function getEntryFeelings(entryId: string): Promise<EntryFeeling[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entry_analyses")
    .select("feelings")
    .eq("entry_id", entryId)
    .single();

  return (data?.feelings as EntryFeeling[] | undefined) ?? [];
}

export function createLuminaTools(context: LuminaToolContext) {
  return {
    analyze_entry_sentiment: tool({
      description:
        "Meet de emotionele lading van een dagboektekst via Twinword (Engelse tekst).",
      inputSchema: z.object({
        text: z.string().describe("De te analyseren tekst."),
        english_text: z
          .string()
          .optional()
          .describe("Optionele Engelse vertaling voor Twinword."),
        entry_id: z
          .string()
          .optional()
          .describe("Optioneel entry-id om het resultaat op te slaan."),
      }),
      execute: async ({ text, english_text, entry_id }) => {
        const entryId = entry_id ?? context.defaultEntryId;
        let englishText = english_text?.trim() ?? "";

        if (!englishText) {
          const translated = await translateForSentiment(text);

          if (typeof translated !== "string") {
            return { error: translated.error };
          }

          englishText = translated;
        }

        const sentiment = await analyzeEntrySentiment(englishText, {
          entryId,
          skipEntryCache: true,
        });

        const feelings = entryId ? await getEntryFeelings(entryId) : [];
        const scores = mergeEmotionScores(
          "error" in sentiment ? null : sentiment.scores,
          feelings,
        );

        if (!scores) {
          return {
            error:
              "error" in sentiment
                ? sentiment.error
                : "Emotie-analyse gaf geen resultaat.",
          };
        }

        const dominantEmotion = getDominantEmotion(scores);

        if (entryId && dominantEmotion) {
          const supabase = await createClient();
          await supabase.from("emotion_analyses").upsert(
            {
              entry_id: entryId,
              scores,
              dominant_emotion: dominantEmotion,
            },
            { onConflict: "entry_id" },
          );
        }

        return { scores, dominantEmotion };
      },
    }),

    search_journal_history: tool({
      description:
        "Zoek relevante eerdere journal entries van de ingelogde gebruiker.",
      inputSchema: z.object({
        query: z.string().describe("Zoekterm of vraag."),
        limit: z
          .number()
          .optional()
          .describe("Maximaal aantal resultaten."),
      }),
      execute: async ({ query, limit }) => {
        const results = await searchJournalHistory(query, limit ?? 5);

        return results.map((entry) => ({
          id: entry.id,
          created_at: entry.created_at,
          excerpt: entry.content.slice(0, 300),
        }));
      },
    }),

    fetch_reflection_framework: tool({
      description:
        "Haal gecategoriseerde reflectievragen op uit de questions-tabel.",
      inputSchema: z.object({
        use_case: z.enum([
          "dagelijkse_reflectie",
          "patronen",
          "intenties",
          "vooruitkijken",
        ]),
        limit: z.number().optional(),
      }),
      execute: async ({ use_case, limit }) => {
        const questions = await getQuestionsForUseCase(
          use_case as AiUseCase,
          limit ?? 3,
        );

        return questions.map((question) => ({
          category: question.category,
          framework: question.framework,
          question_text: question.question_text,
        }));
      },
    }),

    save_ai_insight: tool({
      description: "Sla een definitief inzicht op in ai_insights.",
      inputSchema: z.object({
        insight_text: z.string(),
        patterns_detected: z.record(z.string(), z.unknown()).optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
      }),
      execute: async ({
        insight_text,
        patterns_detected,
        date_from,
        date_to,
      }) => {
        return saveAiInsight({
          insightText: insight_text,
          patternsDetected:
            (patterns_detected as AiInsightPatterns | undefined) ?? null,
          dateFrom: date_from,
          dateTo: date_to,
        });
      },
    }),
  };
}
