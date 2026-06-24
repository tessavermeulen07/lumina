import OpenAI from "openai";
import { mergeEmotionScores } from "@/lib/ai/emotion-scores";
import { analyzeEntrySentiment } from "@/lib/ai/twinword";
import { buildEntryThreadContext } from "@/lib/entries/entry-thread";
import { listEntryBlocks } from "@/lib/entries/entry-blocks";
import { countWords } from "@/lib/data/week-utils";
import type { EntryAnalysis } from "@/lib/types/database";
import type { EntryAnalysisData } from "@/lib/types/entry-analysis";

const ANALYSIS_PROMPT = `Je bent Lumina, een reflectiecoach. Analyseer de journal entry van de gebruiker.
Antwoord in het Nederlands. Wees warm en helder.

Geef JSON met:
- title: korte titel (max 8 woorden)
- summary: korte samenvatting voor een overzicht (2-3 zinnen)
- reflection_text: uitgebreide reflectie op de entry (2-4 alinea's)
- key_insight: één kernzin met het belangrijkste inzicht
- english_plain_text: getrouwe Engelse vertaling van alleen de user-tekst (voor sentiment-analyse, niet tonen aan gebruiker)
- feelings: array van { key, label, emoji, intensity } — max 5 gevoelens
  - key: verplicht één van sadness, fear, joy, anger, surprise, disgust, love
  - love: alleen voor affectie en verbondenheid (verliefd, geliefd, dankbaar) — niet voor algemene blijdschap
  - label: Nederlandse beschrijving (bijv. Verdrietig, Bezorgd, Verliefd)
  - emoji: passend bij het gevoel
  - intensity: getal 1-5 (5 = sterkst)
- persons: array van { name, mention_count } — personen die genoemd worden
- themes: array van { name } — thema's in de tekst, max 6`;

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
    .map((b) => b.content)
    .join("\n\n");

  if (!userText.trim()) {
    return { error: "Geen tekst om te analyseren." };
  }

  const wordCount = countWords(userText);
  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: ANALYSIS_PROMPT },
      {
        role: "user",
        content: `Analyseer deze entry:\n\n${thread}`,
      },
    ],
    response_format: { type: "json_object" },
  });

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

  const feelings = parsed.feelings ?? [];
  const englishText = parsed.english_plain_text?.trim() || userText;
  const sentiment = await analyzeEntrySentiment(englishText, {
    skipEntryCache: true,
  });
  const emotion_scores = mergeEmotionScores(
    "error" in sentiment ? null : sentiment.scores,
    feelings,
  );

  return {
    title: parsed.title?.trim() || "Reflectie",
    summary: parsed.summary?.trim() || "",
    reflection_text: parsed.reflection_text?.trim() || "",
    key_insight: parsed.key_insight?.trim() || "",
    feelings,
    persons: parsed.persons ?? [],
    themes: parsed.themes ?? [],
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
