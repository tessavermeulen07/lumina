import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendContactNotification } from "@/lib/email/send-contact-notification";
import { CONTACT_CATEGORY_VALUES } from "@/lib/contact/categories";

const contactBodySchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.email().max(254),
  subject: z.string().trim().min(1).max(160),
  category: z.enum(CONTACT_CATEGORY_VALUES),
  message: z.string().trim().min(1).max(5000),
  website: z.string().optional(),
});

export type ContactFormPayload = Omit<
  z.infer<typeof contactBodySchema>,
  "website"
>;

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const rateLimitByIp = new Map<string, number[]>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = (rateLimitByIp.get(ip) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );

  rateLimitByIp.set(ip, recent);
  return recent.length >= RATE_LIMIT_MAX;
}

export function recordRateLimitHit(ip: string): void {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = (rateLimitByIp.get(ip) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );
  recent.push(now);
  rateLimitByIp.set(ip, recent);
}

type ParseResult =
  | { ok: true; data: ContactFormPayload; isSpam: boolean }
  | { ok: false; status: 400; error: string };

export function parseContactRequestBody(body: unknown): ParseResult {
  const parsed = contactBodySchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const field = firstIssue?.path[0];

    if (field === "email") {
      return {
        ok: false,
        status: 400,
        error: "Vul een geldig e-mailadres in.",
      };
    }

    if (field === "category") {
      return {
        ok: false,
        status: 400,
        error: "Kies een geldig type vraag.",
      };
    }

    if (field === "message") {
      return {
        ok: false,
        status: 400,
        error: "Vul je bericht in.",
      };
    }

    return {
      ok: false,
      status: 400,
      error: "Controleer je gegevens en probeer het opnieuw.",
    };
  }

  const { website, ...data } = parsed.data;
  const isSpam = Boolean(website?.trim());

  return { ok: true, data, isSpam };
}

export async function submitContactForm(
  data: ContactFormPayload,
): Promise<{ ok: true } | { ok: false; status: 500; error: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("contact_submissions").insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      subject: data.subject,
      category: data.category,
      message: data.message,
    });

    if (error) {
      console.error("Contact insert mislukt:", error.message);
      return {
        ok: false,
        status: 500,
        error:
          "Je bericht kon niet worden opgeslagen. Probeer het later opnieuw.",
      };
    }
  } catch (error) {
    console.error("Contact submit mislukt:", error);
    return {
      ok: false,
      status: 500,
      error:
        "Je bericht kon niet worden opgeslagen. Probeer het later opnieuw.",
    };
  }

  try {
    await sendContactNotification(data);
  } catch (error) {
    console.error("Contact e-mailnotificatie mislukt:", error);
  }

  return { ok: true };
}
