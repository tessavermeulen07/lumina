import OpenAI from "openai";
import { getRecentInsights } from "@/lib/ai/get-recent-insights";
import type { LuminaDashboardQuestion } from "@/lib/ai/lumina-dashboard-question";
import { getQuestionsForUseCase } from "@/lib/ai/question-context";
import type { AiInsight } from "@/types/database";

export type { LuminaDashboardQuestion } from "@/lib/ai/lumina-dashboard-question";

const DASHBOARD_QUESTIONS_PROMPT = `Je bent Lumina, een rustige reflectiecoach.
Op basis van eerder opgeslagen inzichten over patronen in het dagboek van de gebruiker, stel 2 tot 3 korte voorbeeldvragen op die de gebruiker kan stellen aan Lumina.

Antwoord in het Nederlands als JSON:
{
  "questions": [
    { "insight_index": 0, "question": "korte persoonlijke vraag" }
  ]
}

Regels:
- question: kort genoeg voor een klikbare chip, concreet, warm en rustig
- Gebaseerd op de patronen en thema's uit de inzichten, niet het ruwe inzicht letterlijk herhalen
- Geen therapeutisch jargon
- insight_index: 0-based index van het inzicht waar de vraag op voortbouwt
- Maximaal één vraag per inzicht
- Maximaal 3 vragen`;

export async function getLuminaDashboardQuestions(
  limit = 3,
): Promise<LuminaDashboardQuestion[]> {
  const insights = await getRecentInsights(limit);

  if (!insights.length) {
    return mapDbQuestions(await getQuestionsForUseCase("patronen", limit));
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    const aiQuestions = await generateQuestionsFromInsights(insights, limit, apiKey);
    if (aiQuestions.length) {
      return fillToLimit(aiQuestions, limit);
    }
  }

  const ruleQuestions = buildQuestionsFromInsights(insights, limit);
  return fillToLimit(ruleQuestions, limit);
}

async function generateQuestionsFromInsights(
  insights: AiInsight[],
  limit: number,
  apiKey: string,
): Promise<LuminaDashboardQuestion[]> {
  const context = insights
    .map((insight, index) => {
      const themes = insight.patterns_detected?.themes?.join(", ") ?? "";
      const emotions = insight.patterns_detected?.emotions?.join(", ") ?? "";
      const patterns = [themes && `thema's: ${themes}`, emotions && `emoties: ${emotions}`]
        .filter(Boolean)
        .join("; ");

      return `[${index}] ${insight.insight_text}${patterns ? ` (${patterns})` : ""}`;
    })
    .join("\n");

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: DASHBOARD_QUESTIONS_PROMPT },
        {
          role: "user",
          content: `Opgeslagen inzichten:\n${context}\n\nGenereer ${limit} voorbeeldvragen.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return [];

    const parsed = JSON.parse(raw) as {
      questions?: { insight_index?: number; question?: string }[];
    };

    return (parsed.questions ?? [])
      .filter((item) => item.question?.trim())
      .slice(0, limit)
      .map((item, index) => {
        const insightIndex = item.insight_index ?? index;
        const insight = insights[insightIndex] ?? insights[index] ?? insights[0];
        return {
          id: `lumina-q-${insight.id}-${index}`,
          question_text: item.question!.trim(),
        };
      });
  } catch {
    return [];
  }
}

function buildQuestionsFromInsights(
  insights: AiInsight[],
  limit: number,
): LuminaDashboardQuestion[] {
  return insights.slice(0, limit).map((insight, index) => ({
    id: `lumina-q-${insight.id}-${index}`,
    question_text: questionFromInsight(insight),
  }));
}

function questionFromInsight(insight: AiInsight): string {
  const theme = insight.patterns_detected?.themes?.[0];
  if (theme) {
    return `Wat valt je op aan hoe ${theme.toLowerCase()} terugkomt in je entries?`;
  }

  const emotion = insight.patterns_detected?.emotions?.[0];
  if (emotion) {
    return `Hoe merk je ${emotion.toLowerCase()} in je dagelijkse reflecties?`;
  }

  const snippet = truncateInsight(insight.insight_text, 80);
  return `Kun je dit patroon verder verkennen: ${snippet}?`;
}

function truncateInsight(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;

  const shortened = trimmed.slice(0, maxLength).trimEnd();
  const lastSpace = shortened.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.6) {
    return `${shortened.slice(0, lastSpace)}…`;
  }
  return `${shortened}…`;
}

async function fillToLimit(
  questions: LuminaDashboardQuestion[],
  limit: number,
): Promise<LuminaDashboardQuestion[]> {
  if (questions.length >= limit) {
    return questions.slice(0, limit);
  }

  const existingTexts = new Set(
    questions.map((question) => question.question_text.toLowerCase()),
  );
  const dbQuestions = await getQuestionsForUseCase(
    "patronen",
    limit - questions.length,
  );

  for (const dbQuestion of dbQuestions) {
    if (questions.length >= limit) break;
    if (existingTexts.has(dbQuestion.question_text.toLowerCase())) continue;

    questions.push({
      id: dbQuestion.id,
      question_text: dbQuestion.question_text,
    });
    existingTexts.add(dbQuestion.question_text.toLowerCase());
  }

  return questions;
}

function mapDbQuestions(
  questions: Awaited<ReturnType<typeof getQuestionsForUseCase>>,
): LuminaDashboardQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    question_text: question.question_text,
  }));
}
