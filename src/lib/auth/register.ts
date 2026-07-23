import { timingSafeEqual } from "node:crypto";

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
  inviteCode?: string;
  acceptedTerms?: boolean;
}

type InviteCodeValidationResult =
  | { ok: true }
  | { ok: false; status: 400 | 403 | 503; error: string };

function codesMatch(submitted: string, expected: string): boolean {
  const submittedBuf = Buffer.from(submitted);
  const expectedBuf = Buffer.from(expected);

  if (submittedBuf.length !== expectedBuf.length) {
    timingSafeEqual(submittedBuf, Buffer.alloc(submittedBuf.length));
    return false;
  }

  return timingSafeEqual(submittedBuf, expectedBuf);
}

export function validateRegistrationInviteCode(
  submittedCode: string,
): InviteCodeValidationResult {
  const expectedCode = process.env.REGISTRATION_INVITE_CODE?.trim();

  if (!expectedCode) {
    return {
      ok: false,
      status: 503,
      error: "Registratie is tijdelijk niet beschikbaar.",
    };
  }

  const normalizedSubmitted = submittedCode.trim();

  if (!normalizedSubmitted) {
    return {
      ok: false,
      status: 400,
      error: "Vul je uitnodigingscode in.",
    };
  }

  if (!codesMatch(normalizedSubmitted, expectedCode)) {
    return {
      ok: false,
      status: 403,
      error: "Ongeldige uitnodigingscode.",
    };
  }

  return { ok: true };
}

export function parseRegisterRequestBody(body: RegisterRequestBody) {
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  const inviteCode = body.inviteCode ?? "";

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

  if (body.acceptedTerms !== true) {
    return {
      error: "Je moet akkoord gaan met de voorwaarden.",
      status: 400 as const,
    };
  }

  return { name, email, password, inviteCode, acceptedTerms: true as const };
}

export { getRegisterErrorMessage };
