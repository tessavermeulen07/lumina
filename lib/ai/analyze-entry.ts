import OpenAI from "openai";
import {
  getCoachStyleInstruction,
  resolveCoachStyle,
} from "@/lib/ai/agent-prompt";
import { mergeEmotionScores } from "@/lib/ai/emotion-scores";
import { mapOpenAiError } from "@/lib/ai/openai-errors";
import { analyzeEntrySentiment } from "@/lib/ai/twinword";
import { getProfile } from "@/lib/auth/get-profile";
import { buildEntryThreadContext } from "@/lib/entries/entry-thread";
import { listEntryBlocks } from "@/lib/entries/entry-blocks";
import { countWords } from "@/lib/data/week-utils";
import { stripRichTextToPlain } from "@/lib/utils/rich-text";
import type { EntryAnalysis } from "@/lib/types/database";
import type { EntryAnalysisData } from "@/lib/types/entry-analysis";
import { normalizeEntryThemes } from "@/lib/types/entry-analysis";

const ANALYSIS_PROMPT = (coachingStyleInstruction: string) => `Je bent Lumina, een scherpzinnige en intuïtieve reflectiecoach.
Analyseer de journal entry van de gebruiker en  extraheer gestructureerde data.

STIJL: ${coachingStyleInstruction}
Schrijf de 'reflection_text' strikt vanuit dit profiel. Stel geen medische diagnoses.

STRICT JSON SCHEMA:
{
  "title": "Korte, betekenisvolle titel die de kern van de situatie dekt (max 6 woorden)",
  "summary": "Een beknopte samenvatting van de feiten en situatie voor het overzichtelijk dashboard (2-3 zinnen)",
  "reflection_text": " Een diepgaande, persoonlijke reflectie en spiegeling gericht aan de gebruiker (2-4 alinea's). Gebruik
  je actieve stijlprofiel om de gebruiker te ondersteunen en eventuele denkpatronen mild uit te dagen.",
  "key_insight": "Eén krachtige kernzin die fungeert als het belangrijkste inzicht of de 'takeaway' van deze entry.",
  "english_plain_text": "Een zuivere, getrouwe Engelse vertaling van alléén de oorspronkelijke tekst van de gebruiker. 
  Verwijder emoticons en HTML. Dit wordt gebruikt voor sentiment-API's.",
  "feelings": [
    {
      "key": "Verplicht exact één van deze 7 strings: 'sadness', 'fear', 'joy', 'anger', 'surprise', 'disgust', 'love'. (Gebruik
      'love' voor affectie, verbondenheid, diepe dankbaarheid, verliefdheid, liefde, etc.; niet voor algemene blijdschap).",
      "label": "De Nederlandse vertaling of nuance (bijv. 'Gedemotiveerd', 'Angstig', 'Dankbaar'). Begin met hoofdletters.",
      "emoji": "Een passend emoji voor het gevoel (bijv. 💔, 😰, 😊, 😡, 😮, 😞, 💖).",
      intensity: 1
    }
  ],
  "persons": [
    {
      "name": "Voornaam of rol van een genoemd persoon (bijv. 'Manager', 'Lisa', 'Pap', 'Mam'). Schrijf met een hoofdletter.",
      "mention_count": 1,
    }
  ],
  "themes": [
    {
      "name": "Overkoepelend thema in één of twee woorden (bijv. 'Werk', 'Relaties', 'Grenzen'). Maximaal 4 thema's per entry. Schrijf met een hoofdletter."
    }
  ]
}
`;

interface RawAnalysis {
  title?: string;
  summary?: string;
  reflection_text?: string;
  key_insight?: string;
  english_plain_text?: string;
  feelings?: EntryAnalysisData["feelings"];
  persons?: EntryAnalysisData["persons"];
  themes?: EntryAnalysisData["themes"];
}

function validateParsedAnalysis(parsed: RawAnalysis): string | null {
  if (!parsed.title?.trim()) {
    return "AI-analyse mist een titel.";
  }

  if (!parsed.reflection_text?.trim()) {
    return "AI-analyse mist een reflectietekst.";
  }

  if (!parsed.summary?.trim() && !parsed.key_insight?.trim()) {
    return "AI-analyse mist een samenvatting of kerninzicht.";
  }

  return null;
}

export async function analyzeEntry(
  entryId: string,
): Promise<EntryAnalysisData | { error: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { error: "AI-analyse is tijdelijk niet beschikbaar." };
  }

  const blocks = await listEntryBlocks(entryId);
  const thread = buildEntryThreadContext(blocks);
  const userText = blocks
    .filter((b) => b.type === "user")
    .map((b) => stripRichTextToPlain(b.content))
    .join("\n\n");

  if (!userText.trim()) {
    return { error: "Geen tekst om te analyseren." };
  }

  const wordCount = countWords(userText);
  const openai = new OpenAI({ apiKey });
  const profile = await getProfile();
  const coachStyle = resolveCoachStyle(profile.ai_persona_preference);

  let completion: OpenAI.Chat.Completions.ChatCompletion;

  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: ANALYSIS_PROMPT(getCoachStyleInstruction(coachStyle)),
        },
        {
          role: "user",
          content: `Analyseer deze entry:\n\n${thread}`,
        },
      ],
      response_format: { type: "json_object" },
    });
  } catch (error) {
    return { error: mapOpenAiError(error, "analysis") };
  }

  const raw = completion.choices[0]?.message?.content;

  if (!raw) {
    return { error: "AI-analyse gaf geen resultaat." };
  }

  let parsed: RawAnalysis;

  try {
    parsed = JSON.parse(raw) as RawAnalysis;
  } catch {
    return { error: "AI-analyse kon niet worden verwerkt." };
  }

  const validationError = validateParsedAnalysis(parsed);

  if (validationError) {
    return { error: validationError };
  }

  const feelings = parsed.feelings ?? [];
  const englishText = parsed.english_plain_text?.trim() || userText;
  const sentiment = await analyzeEntrySentiment(englishText, {
    skipEntryCache: true,
  });
  const emotion_scores = mergeEmotionScores(
    "error" in sentiment ? null : sentiment.scores,
    feelings,
  );

  const title = parsed.title?.trim() ?? "";
  const reflectionText = parsed.reflection_text?.trim() ?? "";
  const summary = parsed.summary?.trim() || "";
  const keyInsight = parsed.key_insight?.trim() || "";

  return {
    title,
    summary,
    reflection_text: reflectionText,
    key_insight: keyInsight,
    feelings,
    persons: parsed.persons ?? [],
    themes: normalizeEntryThemes(parsed.themes),
    word_count: wordCount,
    emotion_scores,
  };
}

export function toEntryAnalysisRow(
  entryId: string,
  data: EntryAnalysisData,
): Omit<EntryAnalysis, "id" | "analyzed_at"> {
  return {
    entry_id: entryId,
    title: data.title,
    summary: data.summary,
    reflection_text: data.reflection_text,
    key_insight: data.key_insight,
    feelings: data.feelings,
    persons: data.persons,
    themes: data.themes,
    word_count: data.word_count,
    emotion_scores: data.emotion_scores,
  };
}
