"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { dismissPopup } from "@/lib/checkins/dismiss-popup";
import type { PendingPopup } from "@/lib/checkins/get-pending-popup";
import { markPopupShown } from "@/lib/checkins/mark-popup-shown";

interface CheckinPopupProps {
  popup: PendingPopup | null;
}

export function CheckinPopup({ popup }: Readonly<CheckinPopupProps>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(Boolean(popup));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsOpen(Boolean(popup));
  }, [popup]);

  useEffect(() => {
    if (!popup) return;
    void markPopupShown(popup.type);
  }, [popup]);

  if (!popup || !isOpen) {
    return null;
  }

  const activePopup = popup;

  function handleAction(href: string) {
    startTransition(async () => {
      await dismissPopup(activePopup.type);
      setIsOpen(false);
      router.push(href);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Sluit check-in popup"
        className="absolute inset-0 bg-foreground/20"
        disabled={isPending}
        onClick={() => {
          handleAction(activePopup.secondaryHref);
        }}
        type="button"
      />
      <div
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-lumina-500/25 bg-surface p-6 shadow-sm"
        role="dialog"
      >
        <h2 className="text-lg font-semibold text-foreground">{activePopup.title}</h2>
        <p className="mt-2 text-sm text-muted">{activePopup.message}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            className="h-8 px-3 text-xs"
            disabled={isPending}
            onClick={() => {
              handleAction(activePopup.secondaryHref);
            }}
            type="button"
            variant="outline"
          >
            {activePopup.secondaryLabel}
          </Button>
          <Button
            className="h-8 px-3 text-xs"
            disabled={isPending}
            onClick={() => {
              handleAction(activePopup.href);
            }}
            type="button"
            variant="primary"
          >
            {activePopup.primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
