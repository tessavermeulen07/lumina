import OpenAI from "openai";
import { getQuestionsForUseCase } from "@/lib/ai/question-context";
import { getFinalizedEntriesWithAnalyses } from "@/lib/dashboard/reflection-entries";

export interface GeneratedFollowUpPrompt {
  topic: string;
  question: string;
}

const FOLLOW_UP_PROMPT = `Je bent Lumina, een rustige reflectiecoach.
Op basis van de recente journal entries van de gebruiker, stel 2 tot 3 persoonlijke vervolgreflecties op.

Antwoord in het Nederlands als JSON:
{
  "prompts": [
    { "topic": "kort thema (2-4 woorden)", "question": "persoonlijke reflectievraag" }
  ]
}

Regels:
- topic: kort label voor een badge (bijv. "Werkdruk", "Rust zoeken")
- question: één warme, concrete vraag die voortbouwt op wat de gebruiker eerder schreef
- Geen herhaling van exact dezelfde vraag
- Maximaal 3 prompts`;

export async function generateFollowUpPrompts(
  limit = 3,
): Promise<GeneratedFollowUpPrompt[]> {
  const entries = await getFinalizedEntriesWithAnalyses(5);

  if (!entries.length) {
    const fallback = await getQuestionsForUseCase("dagelijkse_reflectie", limit);
    return fallback.map((question) => ({
      topic: categoryLabel(question.category),
      question: question.question_text,
    }));
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackFromEntries(entries, limit);
  }

  const context = entries
    .map((entry) => {
      const analysis = entry.analysis;
      if (!analysis) return "";

      const themes = analysis.themes.map((theme) => theme.name).join(", ");
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
        { role: "system", content: FOLLOW_UP_PROMPT },
        {
          role: "user",
          content: `Recente reflecties:\n${context}\n\nGenereer ${limit} vervolgvragen.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return buildFallbackFromEntries(entries, limit);

    const parsed = JSON.parse(raw) as {
      prompts?: GeneratedFollowUpPrompt[];
    };

    const prompts = (parsed.prompts ?? [])
      .filter((prompt) => prompt.topic?.trim() && prompt.question?.trim())
      .slice(0, limit);

    if (!prompts.length) {
      return buildFallbackFromEntries(entries, limit);
    }

    return prompts;
  } catch {
    return buildFallbackFromEntries(entries, limit);
  }
}

function buildFallbackFromEntries(
  entries: Awaited<ReturnType<typeof getFinalizedEntriesWithAnalyses>>,
  limit: number,
): GeneratedFollowUpPrompt[] {
  return entries.slice(0, limit).map((entry) => ({
    topic: entry.analysis?.title ?? "Reflectie",
    question: `Wat wil je verder verkennen rond ${(entry.analysis?.title ?? "dit thema").toLowerCase()}?`,
  }));
}

function categoryLabel(
  category: string,
): string {
  const labels: Record<string, string> = {
    stress_angst: "Stress",
    patronen: "Patronen",
    intenties: "Intenties",
    emotieregulatie: "Emoties",
  };
  return labels[category] ?? "Reflectie";
}
