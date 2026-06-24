"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { LoginCard } from "@/components/auth/LoginCard";

export function LoginOverlay() {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.replace("/");
  }, [router]);

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
        <LoginCard />
      </div>
    </div>
  );
}
