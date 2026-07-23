"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { MenuIcon } from "@/components/layout/MenuIcon";
import { NavDrawer } from "@/components/ui/NavDrawer";
import {
  appNavItems,
  isAppNavItemActive,
} from "@/lib/nav/app-nav-items";
import { createClient } from "@/lib/supabase/client";

function drawerLinkClass(isActive: boolean): string {
  const base =
    "block rounded-xl px-4 py-3 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500";
  return isActive
    ? `${base} bg-lumina-500/10 font-medium text-foreground`
    : `${base} text-muted hover:bg-lumina-500/10 hover:text-foreground`;
}

export function AppMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  function closeDrawer() {
    setIsOpen(false);
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    closeDrawer();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="lg:hidden">
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-lumina-500/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <MenuIcon />
      </button>

      <NavDrawer isOpen={isOpen} onClose={closeDrawer} title="Menu">
        <nav aria-label="App-navigatie" className="space-y-1">
          {appNavItems.map((item) => {
            const isActive = isAppNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                className={drawerLinkClass(isActive)}
                href={item.href}
                onClick={closeDrawer}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          aria-hidden="true"
          className="my-3 border-t border-lumina-500/15"
        />

        <div className="space-y-1">
          <Link
            className={drawerLinkClass(pathname === "/instellingen")}
            href="/instellingen"
            onClick={closeDrawer}
          >
            Instellingen
          </Link>
          <button
            className={`${drawerLinkClass(false)} w-full text-left disabled:opacity-50`}
            disabled={isSigningOut}
            onClick={() => {
              void handleSignOut();
            }}
            type="button"
          >
            {isSigningOut ? "Uitloggen…" : "Uitloggen"}
          </button>
        </div>
      </NavDrawer>
    </div>
  );
}
