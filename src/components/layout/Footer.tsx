import Link from "next/link";

const footerLinkClass =
  "text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500";

export function Footer() {
  return (
    <footer className="border-t border-lumina-500/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <nav aria-label="Footer navigatie" className="flex gap-6">
          <Link className={footerLinkClass} href="/privacy">
            Privacy
          </Link>
          <Link className={footerLinkClass} href="/voorwaarden">
            Voorwaarden
          </Link>
          <Link className={footerLinkClass} href="/disclaimer">
            Disclaimer
          </Link>
          <Link className={footerLinkClass} href="/contact">
            Contact
          </Link>
        </nav>
        <p className="text-sm text-muted">&copy; 2026 Lumina</p>
      </div>
    </footer>
  );
}
