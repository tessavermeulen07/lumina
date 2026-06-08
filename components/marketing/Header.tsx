import { Button } from "@/components/ui/Button";

function LogoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8 text-lumina-500"
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        className="fill-lumina-100/40"
        height="20"
        rx="2"
        width="16"
        x="8"
        y="6"
      />
      <path
        d="M12 10h8M12 14h6M12 18h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M22 8l4 4-8 8-3 1 1-3 8-8z"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-lumina-500/10 bg-background/80 backdrop-blur-sm">
      <div className="flex w-full items-center px-6 py-4 md:px-10 lg:px-14">
        <a className="flex shrink-0 items-center gap-2" href="/">
          <LogoIcon />
          <span className="text-lg font-semibold text-foreground">Lumina</span>
        </a>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-6 md:gap-10">
          <nav
            aria-label="Hoofdnavigatie"
            className="flex items-center gap-6 md:gap-8"
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

          <div className="flex items-center gap-3">
            <Button href="#functies" variant="primary">
              Probeer gratis
            </Button>
            <Button type="button" variant="dark">
              Inloggen
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
