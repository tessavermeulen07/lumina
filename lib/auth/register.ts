function getRegisterErrorMessage(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "Dit e-mailadres is al in gebruik.";
  }

  if (lower.includes("password")) {
    return "Je wachtwoord voldoet niet aan de vereisten. Gebruik minimaal 8 tekens.";
  }

  return "Registratie mislukt. Controleer je gegevens en probeer het opnieuw.";
}

interface RegisterRequestBody {
  name?: string;
  email?: string;
  password?: string;
}

export function parseRegisterRequestBody(body: RegisterRequestBody) {
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!name || !email || !password) {
    return {
      error: "Vul alle velden in.",
      status: 400 as const,
    };
  }

  if (password.length < 8) {
    return {
      error: "Je wachtwoord voldoet niet aan de vereisten. Gebruik minimaal 8 tekens.",
      status: 400 as const,
    };
  }

  return { name, email, password };
}

export { getRegisterErrorMessage };
