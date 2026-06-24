import OpenAI from "openai";
import {
  ANALYSIS_LEVEL_LABELS,
  type AnalysisLevel,
} from "@/lib/insights/analysis-levels";
import type { EntryAnalysis } from "@/lib/types/database";
import type { EntryFeeling, EntryPerson } from "@/lib/types/entry-analysis";
import type { WeeklyReportData } from "@/lib/types/weekly-report";

export interface WeeklyReportInput {
  weekLabel: string;
  totalWords: number;
  analysisLevel: AnalysisLevel;
  entryCount: number;
  analyses: EntryAnalysis[];
  feelings: EntryFeeling[];
  themes: string[];
  persons: EntryPerson[];
}

function buildLevelInstructions(level: AnalysisLevel): string {
  switch (level) {
    case 1:
    case 2:
      return `Analyse-niveau: ${ANALYSIS_LEVEL_LABELS[level]}.
Geef een korte headline (max 1 zin) en precies 2 secties: "Emoties" en "Thema's".
Houd elke sectie beknopt (2-3 zinnen).`;
    case 3:
    case 4:
      return `Analyse-niveau: ${ANALYSIS_LEVEL_LABELS[level]}.
Geef een headline (max 1 zin) en 3-4 secties: "Emoties", "Thema's", "Personen" en optioneel "Patronen".
Elke sectie 3-4 zinnen met concrete observaties uit de week.`;
    case 5:
      return `Analyse-niveau: ${ANALYSIS_LEVEL_LABELS[level]}.
Geef een krachtige headline (max 1 zin) en 4-5 secties: "Emoties", "Thema's", "Personen", "Patronen" en "Reflectie".
Elke sectie 4-6 zinnen met diepgaande, warme reflectie op wat er deze week opviel.`;
    default:
      return "";
  }
}

function formatAnalysesContext(analyses: EntryAnalysis[]): string {
  return analyses
    .map(
      (analysis, index) =>
        `Entry ${index + 1}:
- Titel: ${analysis.title}
- Samenvatting: ${analysis.summary}
- Kerninzicht: ${analysis.key_insight}`,
    )
    .join("\n\n");
}

const SYSTEM_PROMPT = `Je bent Lumina, een rustige AI-reflectiecoach.
Je schrijft wekelijkse rapporten in het Nederlands, warm en helder, met "je" als aanspreekvorm.
Geen medische diagnoses. Focus op wat er deze week opviel.

Antwoord als JSON:
{
  "headline": "één zin die de week samenvat",
  "sections": [{ "title": "Sectietitel", "content": "analyse-tekst" }]
}`;

export async function generateWeeklyReport(
  input: WeeklyReportInput,
): Promise<WeeklyReportData | { error: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { error: "AI-rapport is tijdelijk niet beschikbaar." };
  }

  const feelingsText =
    input.feelings.length > 0
      ? input.feelings.map((f) => `${f.label} (${f.emoji})`).join(", ")
      : "Geen gevoelens gedetecteerd";

  const themesText =
    input.themes.length > 0 ? input.themes.join(", ") : "Geen thema's";

  const personsText =
    input.persons.length > 0
      ? input.persons.map((p) => `${p.name} (${p.mention_count}x)`).join(", ")
      : "Geen personen genoemd";

  const userPrompt = `Week: ${input.weekLabel}
Aantal entries: ${input.entryCount}
Totaal woorden: ${input.totalWords}

${buildLevelInstructions(input.analysisLevel)}

Gevoelens deze week: ${feelingsText}
Thema's: ${themesText}
Personen: ${personsText}

Entry-samenvattingen:
${formatAnalysesContext(input.analyses)}`;

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      return { error: "AI-rapport gaf geen resultaat." };
    }

    const parsed = JSON.parse(raw) as WeeklyReportData;

    if (!parsed.headline?.trim() || !Array.isArray(parsed.sections)) {
      return { error: "AI-rapport kon niet worden verwerkt." };
    }

    return {
      headline: parsed.headline.trim(),
      sections: parsed.sections
        .filter((section) => section.title?.trim() && section.content?.trim())
        .map((section) => ({
          title: section.title.trim(),
          content: section.content.trim(),
        })),
    };
  } catch {
    return { error: "AI-rapport kon niet worden verwerkt." };
  }
}
