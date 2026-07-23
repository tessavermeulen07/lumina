import { NextResponse } from "next/server";
import {
  getClientIp,
  isRateLimited,
  parseContactRequestBody,
  recordRateLimitHit,
  submitContactForm,
} from "@/lib/contact/submit-contact";

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        error:
          "Je hebt te vaak een bericht gestuurd. Probeer het later opnieuw.",
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ongeldig verzoek." },
      { status: 400 },
    );
  }

  const parsed = parseContactRequestBody(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error },
      { status: parsed.status },
    );
  }

  // Honeypot gevuld: stil "succes" zonder opslag.
  if (parsed.isSpam) {
    return NextResponse.json({ ok: true });
  }

  recordRateLimitHit(ip);

  const result = await submitContactForm(parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true });
}
