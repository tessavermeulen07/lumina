export type GoalFrequency =
  | "een-keer"
  | "dagelijks"
  | "wekelijks"
  | "maandelijks"
  | "altijd";

export type BuiltinGoalCategory =
  | "persoonlijk"
  | "werk"
  | "huishouden"
  | "hobbies";

export interface Goal {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  frequency: GoalFrequency;
  description: string;
}

export interface GoalCategoryOption {
  value: string;
  label: string;
  isCustom: boolean;
}

export const goalFrequencyOptions: {
  value: GoalFrequency;
  label: string;
}[] = [
  { value: "een-keer", label: "Eén keer" },
  { value: "dagelijks", label: "Dagelijks" },
  { value: "wekelijks", label: "Wekelijks" },
  { value: "maandelijks", label: "Maandelijks" },
  { value: "altijd", label: "Altijd" },
];

export function getFrequencyLabel(frequency: GoalFrequency): string {
  return (
    goalFrequencyOptions.find((option) => option.value === frequency)?.label ??
    frequency
  );
}

export const defaultGoalCategory: BuiltinGoalCategory = "persoonlijk";
