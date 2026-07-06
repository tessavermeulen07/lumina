"use client";

import Link from "next/link";
import { useState } from "react";
import { MenuIcon } from "@/components/app/MenuIcon";
import { Button } from "@/components/ui/Button";
import { NavDrawer } from "@/components/ui/NavDrawer";

const marketingNavItems = [
  { href: "#functies", label: "Functies" },
  { href: "#over-ons", label: "Over ons" },
  { href: "#prijzen", label: "Prijzen" },
];

function drawerLinkClass(): string {
  return "block rounded-xl px-4 py-3 text-base text-muted transition-colors hover:bg-lumina-500/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500";
}

export function MarketingMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  function closeDrawer() {
    setIsOpen(false);
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
        <nav aria-label="Hoofdnavigatie" className="space-y-1">
          {marketingNavItems.map((item) => (
            <a
              key={item.href}
              className={drawerLinkClass()}
              href={item.href}
              onClick={closeDrawer}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div
          aria-hidden="true"
          className="my-3 border-t border-lumina-500/15"
        />

        <div className="space-y-2 px-1">
          <Button className="w-full" href="/inloggen" variant="dark">
            Inloggen
          </Button>
          <Button className="w-full" href="/registreren" variant="primary">
            Probeer gratis
          </Button>
        </div>
      </NavDrawer>
    </div>
  );
}
