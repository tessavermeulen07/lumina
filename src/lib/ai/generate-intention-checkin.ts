import OpenAI from "openai";
import { getQuestionsForUseCase } from "@/lib/ai/question-context";
import { getFinalizedEntriesWithAnalyses } from "@/lib/dashboard/reflection-entries";
import { getEntryThemeLabel } from "@/types/entry-analysis";

const GOAL_CHECKIN_PROMPT = `Je bent Lumina, een rustige reflectiecoach.
Stel één warme, concrete check-in vraag voor een doel van de gebruiker.

Antwoord in het Nederlands als JSON:
{ "question": "persoonlijke check-in vraag" }

Regels:
- Maximaal twee zinnen
- Sluit aan bij het doel en recente reflecties
- Geen preekachtige toon`;

type GenerateGoalCheckinInput = {
  title: string;
  description: string | null;
  categoryLabel: string;
};

export async function generateGoalCheckin(
  input: GenerateGoalCheckinInput,
): Promise<string> {
  const entries = await getFinalizedEntriesWithAnalyses(5);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackQuestion(input);
  }

  const context = entries
    .map((entry) => {
      const analysis = entry.analysis;
      if (!analysis) return "";

      const themes = analysis.themes
        .map((theme) => getEntryThemeLabel(theme))
        .join(", ");
      return `- ${analysis.title}: ${analysis.key_insight}${
        themes ? ` (thema's: ${themes})` : ""
      }`;
    })
    .filter(Boolean)
    .join("\n");

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: GOAL_CHECKIN_PROMPT },
        {
          role: "user",
          content: [
            `Categorie: ${input.categoryLabel}`,
            `Doel: ${input.title}`,
            input.description ? `Omschrijving: ${input.description}` : "",
            context ? `Recente reflecties:\n${context}` : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return buildFallbackQuestion(input);
    }

    const parsed = JSON.parse(raw) as { question?: string };
    const question = parsed.question?.trim();

    if (!question) {
      return buildFallbackQuestion(input);
    }

    return question;
  } catch {
    return buildFallbackQuestion(input);
  }
}

/** @deprecated Use generateGoalCheckin */
export async function generateIntentionCheckin(
  input: GenerateGoalCheckinInput,
): Promise<string> {
  return generateGoalCheckin(input);
}

async function buildFallbackQuestion(
  input: GenerateGoalCheckinInput,
): Promise<string> {
  const questions = await getQuestionsForUseCase("intenties", 1);
  const fallback = questions[0]?.question_text;

  if (fallback) {
    return fallback;
  }

  return `Hoe gaat het vandaag met je doel "${input.title}" (${input.categoryLabel.toLowerCase()})?`;
}
