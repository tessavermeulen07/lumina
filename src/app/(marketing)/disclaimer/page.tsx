import type { Metadata } from "next";
import { DisclaimerPage } from "@/components/features/marketing/DisclaimerPage";

export const metadata: Metadata = {
  title: "Disclaimer | Lumina",
  description:
    "Grenzen van Lumina: AI als hulpmiddel, geen therapie, plus de formele disclaimer.",
};

export default function DisclaimerRoutePage() {
  return <DisclaimerPage />;
}
