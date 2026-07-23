"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { MenuIcon } from "@/components/layout/MenuIcon";
import { createClient } from "@/lib/supabase/client";

const menuItems = [{ href: "/instellingen", label: "Instellingen" }];

export function UserMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Instellingen en account"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-lumina-500/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <MenuIcon />
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 z-20 mt-2 min-w-44 rounded-xl border border-lumina-500/25 bg-surface py-1 shadow-sm"
          id={menuId}
          role="menu"
        >
          {menuItems.map((item) => (
            <Link
              key={item.href}
              className="block px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-lumina-500/10 focus-visible:bg-lumina-500/10 focus-visible:outline-none"
              href={item.href}
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              {item.label}
            </Link>
          ))}
          <button
            className="block w-full px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-lumina-500/10 focus-visible:bg-lumina-500/10 focus-visible:outline-none disabled:opacity-50"
            disabled={isSigningOut}
            onClick={() => {
              void handleSignOut();
            }}
            role="menuitem"
            type="button"
          >
            {isSigningOut ? "Uitloggen…" : "Uitloggen"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
