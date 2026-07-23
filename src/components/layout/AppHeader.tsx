import Link from "next/link";
import { AppMobileNav } from "@/components/layout/AppMobileNav";
import { AppNav } from "@/components/layout/AppNav";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-lumina-500/10 bg-background/80 backdrop-blur-sm">
      <div className="flex w-full items-center gap-4 px-6 py-4 md:px-10 lg:px-14">
        <Link className="flex shrink-0 items-center gap-2" href="/vandaag">
          <Logo className="h-10 w-10 md:h-12 md:w-12" />
          <span className="text-lg font-semibold text-foreground md:text-xl">
            Lumina
          </span>
        </Link>

        <div className="ml-auto flex items-center justify-end gap-3 md:gap-6">
          <AppNav />

          <div className="flex items-center gap-2 md:gap-3">
            <Button href="/schrijf" variant="primary">
              Schrijf
            </Button>
            <div className="hidden lg:block">
              <UserMenu />
            </div>
            <AppMobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
