const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_REQUIREMENTS_MESSAGE =
  "Je wachtwoord voldoet niet aan de vereisten. Gebruik minimaal 8 tekens.";

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return PASSWORD_REQUIREMENTS_MESSAGE;
  }

  return null;
}

export function passwordsMatch(a: string, b: string): boolean {
  return a === b;
}
