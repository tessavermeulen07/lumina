import type { ToolbarAiAction } from "@/lib/ai/question-context";
import { getToolbarActionLabel } from "@/lib/ai/toolbar-actions";
import type { AiCoachStyle } from "@/lib/types/onboarding";

export type InteractionMode = "dashboard" | "entry_toolbar";

const BASE_PROMPT = `Je bent Lumina, een rustige AI-reflectiecoach in een journal-app.
Je spreekt de gebruiker aan met "je". Je bent helder en niet-oordelend.
Je stelt geen medische diagnoses.

Gebruik de beschikbare tools wanneer dat helpt:
- analyze_entry_sentiment — emoties in teksten meten
- search_journal_history — eerdere journal entries doorzoeken
- fetch_reflection_framework — reflectievragen ophalen
- save_ai_insight — waardevolle inzichten opslaan

Antwoord altijd in het Nederlands. Houd antwoorden beknopt maar betekenisvol (2–5 alinea's max).`;

const COACH_STYLE_PROMPTS: Record<AiCoachStyle, string> = {
  empathetic: `Je bent "De Empathische Luisteraar": warm, ondersteunend en oordeelloos.
Valideer gevoelens en bied een luisterend oor. Wees zacht en bemoedigend, maar ook analytisch. `,
  direct: `Je bent "De Directe Gids": praktisch, constructief en analytisch.
Daag meningen uit waar dat helpt, benoem patronen helder en help zoeken naar oplossingen.`,
};

const DASHBOARD_PROMPT = `INTERACTIEMODUS: Dashboard — "Vraag het Lumina"
De gebruiker stelt een vraag over eerdere journal entries en patronen. Er is geen huidige entry-inhoud.
Gebruik search_journal_history om relevante eerdere entries te vinden.
Sla waardevolle patronen op via save_ai_insight wanneer dat zinvol is.
Als er weinig entries zijn, wees eerlijk en moedig zacht aan om verder te schrijven.`;

const TOOLBAR_PROMPT = `INTERACTIEMODUS: Schrijfpagina — hulp bij de huidige entry
De gebruiker schrijft actief in een journal entry. Focus op de huidige entry-inhoud.
Volg de gevraagde AI-actie (zie user-bericht) voor toon en inhoud van je antwoord.`;

const TOOLBAR_ACTION_INSTRUCTIONS: Record<ToolbarAiAction, string> = {
  vraag:
    "Actie: Vraag — Stel één gerichte reflectievraag op basis van de huidige tekst. Gebruik fetch_reflection_framework indien nuttig.",
  ga_dieper:
    "Actie: Ga dieper — Vraag door op onderliggende emoties en motieven. Optioneel analyze_entry_sentiment.",
  coach_me:
    "Actie: Coach me — Wees bemoedigend en actiegericht. Help de gebruiker vooruit met de huidige entry.",
  geef_inzicht:
    "Actie: Geef inzicht — Geef een korte samenvatting én benoem welke thema's, emoties en denkpatronen in DEZE tekst naar voren komen. Gebruik analyze_entry_sentiment. Zoek NIET in eerdere entries. Als het label 'Vat samen' is: houd het kort en samenvattend. Als het label 'Geef inzicht' is: voeg patronen en thema's toe.",
  eerdere_gedragspatronen:
    "Actie: Eerdere gedragspatronen — Vergelijk met eerdere journal entries via search_journal_history (verplicht). Benoem terugkerende thema's, triggers en gedragspatronen over tijd.",
  actie_punten:
    "Actie: Actie punten — Geef concrete, haalbare vervolgstappen op basis van de huidige entry.",
  geef_feedback:
    "Actie: Geef feedback — Geef constructieve, warme feedback op de huidige tekst. Optioneel analyze_entry_sentiment.",
};

interface BuildSystemPromptInput {
  interactionMode: InteractionMode;
  coachStyle: AiCoachStyle;
  toolbarAction?: ToolbarAiAction;
}

export function buildSystemPrompt(input: BuildSystemPromptInput): string {
  const parts = [
    BASE_PROMPT,
    COACH_STYLE_PROMPTS[input.coachStyle],
    input.interactionMode === "dashboard" ? DASHBOARD_PROMPT : TOOLBAR_PROMPT,
  ];

  if (input.interactionMode === "entry_toolbar" && input.toolbarAction) {
    parts.push(TOOLBAR_ACTION_INSTRUCTIONS[input.toolbarAction]);
  }

  return parts.join("\n\n");
}

interface BuildUserMessageInput {
  userQuestion: string;
  interactionMode: InteractionMode;
  actionLabel?: string;
  toolbarAction?: ToolbarAiAction;
  entryContent?: string;
  entryThreadContext?: string;
}

export function buildUserMessage(input: BuildUserMessageInput): string {
  const modeLabel =
    input.interactionMode === "dashboard"
      ? "Dashboard — vraag over eerdere entries"
      : "Schrijfpagina — hulp bij huidige entry";

  const parts = [`Context: ${modeLabel}`, `Vraag: ${input.userQuestion}`];

  if (input.toolbarAction) {
    const label =
      input.actionLabel ?? getToolbarActionLabel(input.toolbarAction);
    parts.push(`Gevraagde AI-actie: ${label} (${input.toolbarAction})`);
  }

  if (input.entryThreadContext?.trim()) {
    parts.push(`Volledige entry-thread:\n${input.entryThreadContext.trim()}`);
  }

  if (input.entryContent?.trim()) {
    parts.push(`Actief schrijfsegment (focus):\n${input.entryContent.trim()}`);
  }

  return parts.join("\n\n");
}

export function resolveCoachStyle(
  preference: AiCoachStyle | null | undefined,
): AiCoachStyle {
  return preference ?? "empathetic";
}
