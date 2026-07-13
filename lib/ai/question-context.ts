import { createClient } from "@/lib/supabase/server";
import type { Question, QuestionCategory } from "@/lib/types/database";

export type AiUseCase =
  | "dagelijkse_reflectie"
  | "patronen"
  | "intenties"
  | "vooruitkijken";

export type ToolbarAiAction =
  | "vraag"
  | "ga_dieper"
  | "coach_me"
  | "vat_samen"
  | "geef_inzicht"
  | "eerdere_gedragspatronen"
  | "actie_punten"
  | "geef_feedback";

const USE_CASE_CATEGORIES: Record<AiUseCase, QuestionCategory[]> = {
  dagelijkse_reflectie: ["emotieregulatie", "patronen", "stress_angst"],
  patronen: ["patronen", "stress_angst"],
  intenties: ["intenties"],
  vooruitkijken: ["intenties", "stress_angst"],
};

const TOOLBAR_ACTION_CATEGORIES: Record<ToolbarAiAction, QuestionCategory[]> = {
  vraag: ["emotieregulatie", "patronen", "stress_angst"],
  ga_dieper: ["patronen", "emotieregulatie"],
  coach_me: ["intenties", "stress_angst"],
  vat_samen: [],
  geef_inzicht: ["patronen", "emotieregulatie"],
  eerdere_gedragspatronen: ["patronen", "stress_angst"],
  actie_punten: ["intenties"],
  geef_feedback: ["stress_angst", "emotieregulatie"],
};

async function fetchQuestionsByCategories(
  categories: QuestionCategory[],
  limit: number,
): Promise<Question[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .in("category", categories)
    .limit(limit * 3);

  if (error || !data?.length) {
    return [];
  }

  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit) as Question[];
}

export async function getQuestionsForUseCase(
  useCase: AiUseCase,
  limit = 2,
): Promise<Question[]> {
  return fetchQuestionsByCategories(USE_CASE_CATEGORIES[useCase], limit);
}

export async function getQuestionsForToolbarAction(
  action: ToolbarAiAction,
  limit = 2,
): Promise<Question[]> {
  return fetchQuestionsByCategories(TOOLBAR_ACTION_CATEGORIES[action], limit);
}
