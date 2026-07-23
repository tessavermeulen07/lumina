import OpenAI from "openai";

export async function translateForSentiment(
  text: string,
): Promise<string | { error: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const trimmed = text.trim();

  if (!trimmed) {
    return { error: "Geen tekst om te vertalen." };
  }

  if (!apiKey) {
    return { error: "Vertaling is tijdelijk niet beschikbaar." };
  }

  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Translate the user's journal text to English. Return only the translation, no explanation. Preserve emotional tone.",
      },
      { role: "user", content: trimmed },
    ],
    temperature: 0,
  });

  const translated = completion.choices[0]?.message?.content?.trim();

  if (!translated) {
    return { error: "Vertaling mislukt." };
  }

  return translated;
}
