import type {
  AiCoachStyle,
  JournalExperience,
  OnboardingMainGoal,
  OnboardingOption,
  OnboardingPriority,
} from "@/lib/types/onboarding";

export const USER_NAME_KEY = "lumina-user-name";
export const ONBOARDING_ANSWERS_KEY = "lumina-onboarding-answers";

export const mainGoalOptions: OnboardingOption<OnboardingMainGoal>[] = [
  { id: "mental-health", label: "Mental Health verbeteren" },
  { id: "gratitude", label: "Dankbaarheid stimuleren" },
  {
    id: "patterns-triggers",
    label: "Ontdekken van patronen en triggers",
  },
  {
    id: "life-events",
    label: "Belangrijkse gebeurtenissen vastleggen",
  },
  { id: "self-expression", label: "Mezelf uitdrukken" },
  { id: "personal-growth", label: "Personelijke groei bijhouden" },
];

export const priorityOptions: OnboardingOption<OnboardingPriority>[] = [
  { id: "creativity", label: "Creativiteit en expressie" },
  { id: "relationships", label: "Relaties" },
  {
    id: "balance-goals",
    label: "Balans en doelen in mijn leven",
  },
  { id: "work-career", label: "Werk en carrière" },
  { id: "personal-development", label: "Persoonlijke ontwikkeling" },
  { id: "health-wellbeing", label: "Gezondheid en welzijn" },
];

export const experienceOptions: OnboardingOption<JournalExperience>[] = [
  { id: "first-time", label: "Dit is de eerste keer" },
  { id: "some", label: "Al een paar keer gedaan" },
  { id: "experienced", label: "Behoorlijk wat ervaring" },
];

export const coachOptions: OnboardingOption<AiCoachStyle>[] = [
  {
    id: "empathetic",
    label: "De Empathische Luisteraar",
    description:
      "Warm, ondersteunend en oordeelloos. Focust op het valideren van je gevoelens en biedt een luisterend oor wanneer je dat het meeste nodig hebt.",
  },
  {
    id: "direct",
    label: "De Directe Gids",
    description:
      "Praktisch, constructief en analytisch. Daagt je meningen uit, confronteert je met patronen uit het verleden en helpt je zoeken naar oplossingen.",
  },
];
