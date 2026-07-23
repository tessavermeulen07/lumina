import type { Metadata } from "next";
import { ContactPage } from "@/components/features/marketing/ContactPage";

export const metadata: Metadata = {
  title: "Contact | Lumina",
  description:
    "Neem contact op met Lumina voor een algemene vraag, support of een klacht.",
};

export default function ContactRoutePage() {
  return <ContactPage />;
}
