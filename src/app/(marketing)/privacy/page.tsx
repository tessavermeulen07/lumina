import type { Metadata } from "next";
import { PrivacyPage } from "@/components/features/marketing/PrivacyPage";

export const metadata: Metadata = {
  title: "Privacy | Lumina",
  description:
    "Hoe Lumina omgaat met je reflecties, plus de privacyverklaring (AVG).",
};

export default function PrivacyRoutePage() {
  return <PrivacyPage />;
}
