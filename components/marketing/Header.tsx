import Link from "next/link";
import { MarketingMobileNav } from "@/components/marketing/MarketingMobileNav";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-lumina-500/10 bg-background/80 backdrop-blur-sm">
      <div className="flex w-full items-center px-6 py-4 md:px-10 lg:px-14">
        <Link className="flex shrink-0 items-center gap-2" href="/">
          <Logo className="h-10 w-10 md:h-12 md:w-12" />
          <span className="text-lg font-semibold text-foreground md:text-xl">
            Lumina
          </span>
        </Link>

        <div className="ml-auto flex items-center justify-end gap-6 md:gap-10">
          <nav
            aria-label="Hoofdnavigatie"
            className="hidden items-center gap-6 lg:flex lg:gap-8"
          >
            <a
              className="text-sm text-muted transition-colors hover:text-foreground"
              href="#functies"
            >
              Functies
            </a>
            <a
              className="text-sm text-muted transition-colors hover:text-foreground"
              href="#over-ons"
            >
              Over ons
            </a>
            <a
              className="text-sm text-muted transition-colors hover:text-foreground"
              href="#prijzen"
            >
              Prijzen
            </a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button href="/registreren" variant="primary">
              Probeer gratis
            </Button>
            <Button href="/inloggen" variant="dark">
              Inloggen
            </Button>
          </div>

          <MarketingMobileNav />
        </div>
      </div>
    </header>
  );
}
