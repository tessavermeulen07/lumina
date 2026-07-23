export interface LuminaDashboardQuestion {
  id: string;
  question_text: string;
}

export function hasPersonalizedQuestions(
  questions: LuminaDashboardQuestion[],
): boolean {
  return questions.some((question) => question.id.startsWith("lumina-q-"));
}
