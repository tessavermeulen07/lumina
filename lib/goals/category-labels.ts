import type { BuiltinGoalCategory } from "@/lib/types/goal";

export const builtinGoalCategories: {
  value: BuiltinGoalCategory;
  label: string;
}[] = [
  { value: "persoonlijk", label: "Persoonlijk" },
  { value: "werk", label: "Werk" },
  { value: "huishouden", label: "Huishouden" },
  { value: "hobbies", label: "Hobby's" },
];

const builtinLabels = new Map<string, string>(
  builtinGoalCategories.map((category) => [category.value, category.label]),
);

export function isBuiltinGoalCategory(
  value: string,
): value is BuiltinGoalCategory {
  return builtinLabels.has(value);
}

export function getBuiltinGoalCategoryLabel(value: BuiltinGoalCategory): string {
  return builtinLabels.get(value) ?? value;
}

export function resolveGoalCategoryLabel(
  category: string,
  customCategories: { id: string; name: string }[],
): string {
  if (isBuiltinGoalCategory(category)) {
    return getBuiltinGoalCategoryLabel(category);
  }

  const custom = customCategories.find((item) => item.id === category);
  return custom?.name ?? "Overig";
}
