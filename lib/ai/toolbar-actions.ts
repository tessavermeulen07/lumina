import type { ToolbarAiAction } from "@/lib/ai/question-context";

const TOOLBAR_ACTION_LABELS: Record<string, ToolbarAiAction> = {
  Vraag: "vraag",
  "Ga dieper": "ga_dieper",
  "Coach me": "coach_me",
  "Vat samen": "geef_inzicht",
  "Geef inzicht": "geef_inzicht",
  "Eerdere gedragspatronen": "eerdere_gedragspatronen",
  "Actie punten": "actie_punten",
  "Geef feedback": "geef_feedback",
};

const ACTION_TO_LABEL: Record<ToolbarAiAction, string> = {
  vraag: "Vraag",
  ga_dieper: "Ga dieper",
  coach_me: "Coach me",
  geef_inzicht: "Geef inzicht",
  eerdere_gedragspatronen: "Eerdere gedragspatronen",
  actie_punten: "Actie punten",
  geef_feedback: "Geef feedback",
};

export function mapToolbarLabelToAction(
  label: string,
): ToolbarAiAction | null {
  return TOOLBAR_ACTION_LABELS[label] ?? null;
}

export function getToolbarActionLabel(action: ToolbarAiAction): string {
  return ACTION_TO_LABEL[action];
}
