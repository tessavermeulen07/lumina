import OpenAI from "openai";

export type OpenAiErrorContext = "agent" | "analysis";

const AGENT_CONTINUE_HINT =
  "Je kunt wel gewoon doorgaan met schrijven.";

export function mapOpenAiError(
  error: unknown,
  context: OpenAiErrorContext,
): string {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 429) {
      return context === "analysis"
        ? "Analyse is tijdelijk niet beschikbaar door drukte. Probeer het zo opnieuw."
        : "Lumina is tijdelijk niet beschikbaar door drukte. Probeer het zo opnieuw.";
    }

    if (typeof error.status === "number" && error.status >= 500) {
      return context === "analysis"
        ? "Analyse is tijdelijk niet beschikbaar. Probeer het zo opnieuw."
        : `Lumina is tijdelijk niet beschikbaar. ${AGENT_CONTINUE_HINT}`;
    }
  }

  return context === "analysis"
    ? "Analyse kon niet worden gemaakt. Probeer het opnieuw."
    : `Lumina is tijdelijk niet beschikbaar. ${AGENT_CONTINUE_HINT}`;
}
