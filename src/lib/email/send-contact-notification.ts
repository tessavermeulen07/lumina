import { Resend } from "resend";
import { getContactCategoryLabel } from "@/lib/contact/categories";
import type { ContactFormPayload } from "@/lib/contact/submit-contact";

const DEFAULT_NOTIFY_TO = "tessavermeulen@icloud.com";
const DEFAULT_FROM = "Lumina <onboarding@resend.dev>";

export async function sendContactNotification(
  data: ContactFormPayload,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "RESEND_API_KEY ontbreekt; contactnotificatie is overgeslagen.",
    );
    return;
  }

  const to = process.env.CONTACT_NOTIFY_TO?.trim() || DEFAULT_NOTIFY_TO;
  const from = process.env.CONTACT_FROM?.trim() || DEFAULT_FROM;
  const categoryLabel = getContactCategoryLabel(data.category);
  const fullName = `${data.firstName} ${data.lastName}`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: data.email,
    subject: `[Lumina contact] ${categoryLabel}: ${data.subject}`,
    text: [
      `Nieuw contactbericht via Lumina`,
      ``,
      `Naam: ${fullName}`,
      `E-mail: ${data.email}`,
      `Type: ${categoryLabel}`,
      `Onderwerp: ${data.subject}`,
      ``,
      `Bericht:`,
      data.message,
    ].join("\n"),
  });

  if (error) {
    throw new Error(error.message);
  }
}
