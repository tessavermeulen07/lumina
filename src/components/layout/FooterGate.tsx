"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

export function FooterGate() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/inloggen") ||
    pathname.startsWith("/wachtwoord-vergeten") ||
    pathname.startsWith("/wachtwoord-wijzigen") ||
    pathname.startsWith("/schrijf")
  ) {
    return null;
  }

  return <Footer />;
}
