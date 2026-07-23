"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { OnboardingWizard } from "@/components/features/onboarding/OnboardingWizard";
import { RegisterCard } from "@/components/features/marketing/RegisterCard";
import { USER_NAME_KEY } from "@/lib/constants/onboarding";

type RegisterPhase = "register" | "onboarding";

export function RegisterOverlay() {
  const router = useRouter();
  const [phase, setPhase] = useState<RegisterPhase>("register");
  const [userName, setUserName] = useState("");

  const handleClose = useCallback(() => {
    router.replace("/");
  }, [router]);

  function handleAccountCreated(name: string) {
    sessionStorage.setItem(USER_NAME_KEY, name);
    setUserName(name);
    setPhase("onboarding");
  }

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Sluit dialoog"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
        type="button"
      />

      <div
        className="relative z-10 w-full max-w-lg"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="presentation"
      >
        {phase === "register" ? (
          <RegisterCard onAccountCreated={handleAccountCreated} />
        ) : (
          <div className="relative flex max-h-[min(90vh,720px)] flex-col overflow-hidden rounded-2xl border border-lumina-500/25 bg-surface shadow-lg">
            <Link
              aria-label="Sluiten"
              className="absolute top-4 right-4 z-20 rounded-full p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-900"
              href="/"
              onClick={(event) => event.stopPropagation()}
            >
              <svg
                aria-hidden
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <div className="overflow-y-auto p-6">
              <OnboardingWizard compact userName={userName} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
