"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  appNavItems,
  isAppNavItemActive,
} from "@/lib/nav/app-nav-items";

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
    <nav
      aria-label="App-navigatie"
      className="hidden items-center gap-6 lg:flex lg:gap-8"
    >
      {appNavItems.map((item) => {
        const isActive = isAppNavItemActive(pathname, item.href);

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
