import type { ContactCategory } from "@/types/database";

export const CONTACT_CATEGORY_VALUES = [
  "algemene_vraag",
  "support",
  "klacht",
] as const satisfies readonly ContactCategory[];

export const CONTACT_CATEGORY_LABELS: Record<ContactCategory, string> = {
  algemene_vraag: "Algemene vraag",
  support: "Support",
  klacht: "Klacht",
};

export function getContactCategoryLabel(category: ContactCategory): string {
  return CONTACT_CATEGORY_LABELS[category];
}
