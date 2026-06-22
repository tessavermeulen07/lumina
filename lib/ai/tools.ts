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
import type { EntryFeeling } from "@/lib/types/entry-analysis";

export const luminaToolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "analyze_entry_sentiment",
      description:
        "Meet de emotionele lading van een dagboektekst via Twinword (Engelse tekst).",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "De te analyseren tekst." },
          english_text: {
            type: "string",
            description: "Optionele Engelse vertaling voor Twinword.",
          },
          entry_id: {
            type: "string",
            description: "Optioneel entry-id om het resultaat op te slaan.",
          },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_journal_history",
      description:
        "Zoek relevante eerdere journal entries van de ingelogde gebruiker.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Zoekterm of vraag." },
          limit: { type: "number", description: "Maximaal aantal resultaten." },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "fetch_reflection_framework",
      description:
        "Haal gecategoriseerde reflectievragen op uit de questions-tabel.",
      parameters: {
        type: "object",
        properties: {
          use_case: {
            type: "string",
            enum: [
              "dagelijkse_reflectie",
              "patronen",
              "intenties",
              "vooruitkijken",
            ],
          },
          limit: { type: "number" },
        },
        required: ["use_case"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "save_ai_insight",
      description: "Sla een definitief inzicht op in ai_insights.",
      parameters: {
        type: "object",
        properties: {
          insight_text: { type: "string" },
          patterns_detected: {
            type: "object",
            additionalProperties: true,
          },
          date_from: { type: "string" },
          date_to: { type: "string" },
        },
        required: ["insight_text"],
      },
    },
  },
];

interface ExecuteToolContext {
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

export async function executeLuminaTool(
  name: string,
  args: Record<string, unknown>,
  context: ExecuteToolContext,
): Promise<string> {
  switch (name) {
    case "analyze_entry_sentiment": {
      const text = String(args.text ?? "");
      const entryId =
        (args.entry_id as string | undefined) ?? context.defaultEntryId;
      let englishText = String(args.english_text ?? "").trim();

      if (!englishText) {
        const translated = await translateForSentiment(text);

        if (typeof translated !== "string") {
          return JSON.stringify({ error: translated.error });
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
        return JSON.stringify({
          error:
            "error" in sentiment
              ? sentiment.error
              : "Emotie-analyse gaf geen resultaat.",
        });
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

      return JSON.stringify({ scores, dominantEmotion });
    }

    case "search_journal_history": {
      const results = await searchJournalHistory(
        String(args.query ?? ""),
        typeof args.limit === "number" ? args.limit : 5,
      );

      return JSON.stringify(
        results.map((entry) => ({
          id: entry.id,
          created_at: entry.created_at,
          excerpt: entry.content.slice(0, 300),
        })),
      );
    }

    case "fetch_reflection_framework": {
      const useCase = String(args.use_case ?? "patronen") as AiUseCase;
      const limit = typeof args.limit === "number" ? args.limit : 3;
      const questions = await getQuestionsForUseCase(useCase, limit);

      return JSON.stringify(
        questions.map((question) => ({
          category: question.category,
          framework: question.framework,
          question_text: question.question_text,
        })),
      );
    }

    case "save_ai_insight": {
      const result = await saveAiInsight({
        insightText: String(args.insight_text ?? ""),
        patternsDetected:
          (args.patterns_detected as Record<string, unknown> | undefined) ??
          null,
        dateFrom: args.date_from ? String(args.date_from) : undefined,
        dateTo: args.date_to ? String(args.date_to) : undefined,
      });

      return JSON.stringify(result);
    }

    default:
      return JSON.stringify({ error: `Onbekende tool: ${name}` });
  }
}
