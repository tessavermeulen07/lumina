import type { DashboardOverviewData } from "@/lib/types/dashboard";

// Placeholder tot Supabase entries-tabel beschikbaar is.

const dashboardStats = {
  streak: 3,
  entryCount: 12,
  wordCount: 4521,
};

const dayLabels = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getWeekDays(referenceDate = new Date()) {
  const today = toDateString(referenceDate);
  const monday = startOfWeek(referenceDate);

  return dayLabels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateStr = toDateString(date);
    const isPastOrToday = date <= referenceDate;

    return {
      label,
      date: dateStr,
      hasEntry:
        isPastOrToday && (index % 2 === 0 || dateStr === today),
      isToday: dateStr === today,
    };
  });
}

export function getDashboardOverview(
  referenceDate = new Date(),
): DashboardOverviewData {
  return {
    weekDays: getWeekDays(referenceDate),
    stats: dashboardStats,
  };
}

export const samplePrompts = [
  {
    id: "prompt-1",
    text: "Wat gaf je vandaag energie?",
    isPersonalized: true,
  },
  {
    id: "prompt-2",
    text: "Waar ben je trots op deze week?",
    isPersonalized: true,
  },
];

export const sampleQuestions = [
  "Wat viel me deze week op?",
  "Welke patronen zie je in mijn entries?",
  "Waar kan ik me op richten komende week?",
];

export const aiPlaceholderMessage =
  "Antwoorden op basis van je entries komen binnenkort.";
