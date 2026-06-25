import Link from "next/link";
import { AppNav } from "@/components/app/AppNav";
import { UserMenu } from "@/components/app/UserMenu";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-lumina-500/10 bg-background/80 backdrop-blur-sm">
      <div className="flex w-full flex-wrap items-center gap-4 px-6 py-4 md:px-10 lg:px-14">
        <Link className="flex shrink-0 items-center gap-2" href="/vandaag">
          <Logo className="h-12 w-12" />
          <span className="text-xl font-semibold text-foreground items-center">Lumina</span>
        </Link>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-4 md:gap-6">
          <AppNav />

          <div className="flex items-center gap-3">
            <Button href="/schrijf" variant="primary">
              Schrijf
            </Button>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
