export function Footer() {
  return (
    <footer className="border-t border-lumina-500/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <nav aria-label="Footer navigatie" className="flex gap-6">
          <a
            className="text-sm text-muted transition-colors hover:text-foreground"
            href="#"
          >
            Privacy
          </a>
          <a
            className="text-sm text-muted transition-colors hover:text-foreground"
            href="#"
          >
            Voorwaarden
          </a>
          <a
            className="text-sm text-muted transition-colors hover:text-foreground"
            href="#"
          >
            Disclaimer
          </a>
          <a
            className="text-sm text-muted transition-colors hover:text-foreground"
            href="#"
          >
            Contact
          </a>
        </nav>
        <p className="text-sm text-muted">&copy; 2026 Lumina</p>
      </div>
    </footer>
  );
}
