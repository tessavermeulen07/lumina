export function getEntryErrorMessage(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("jwt") || lower.includes("not authenticated")) {
    return "Je bent niet ingelogd.";
  }

  return "Opslaan mislukt. Probeer het opnieuw.";
}
