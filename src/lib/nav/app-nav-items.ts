export interface AppNavItem {
  href: string;
  label: string;
}

export const appNavItems: AppNavItem[] = [
  { href: "/vandaag", label: "Vandaag" },
  { href: "/geschiedenis", label: "Geschiedenis" },
  { href: "/bewaard", label: "Bewaard" },
  { href: "/inzichten", label: "Inzichten" },
];

export function isAppNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) {
    return true;
  }

  if (href === "/vandaag" && pathname === "/") {
    return true;
  }

  if (
    href === "/geschiedenis" &&
    (pathname === "/geschiedenis" || pathname === "/entries")
  ) {
    return true;
  }

  return false;
}
