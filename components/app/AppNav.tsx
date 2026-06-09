"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/vandaag", label: "Vandaag" },
  { href: "/entries", label: "Eerdere entries" },
];

function navLinkClass(isActive: boolean): string {
  const base =
    "border-b-2 pb-0.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lumina-500";
  return isActive
    ? `${base} border-lumina-500 font-medium text-foreground`
    : `${base} border-transparent text-muted hover:border-lumina-500/40 hover:text-foreground`;
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="App-navigatie" className="flex items-center gap-6 md:gap-8">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href === "/vandaag" && pathname === "/");

        return (
          <Link
            key={item.href}
            className={navLinkClass(isActive)}
            href={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
