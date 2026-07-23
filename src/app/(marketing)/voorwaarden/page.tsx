import type { Metadata } from "next";
import { TermsPage } from "@/components/features/marketing/TermsPage";

export const metadata: Metadata = {
  title: "Voorwaarden | Lumina",
  description:
    "Wat je van Lumina mag verwachten, plus de algemene voorwaarden.",
};

export default function VoorwaardenRoutePage() {
  return <TermsPage />;
}
