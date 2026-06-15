import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function WachtwoordVergetenPage() {
  return (
    <main className="marketing-aura flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="w-full rounded-2xl border border-lumina-500/25 bg-surface p-6 text-center shadow-lg">
          <div className="mb-6 flex justify-center opacity-70">
            <Logo className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl text-foreground">
            Wachtwoord vergeten
          </h1>
          <p className="mt-2 text-sm text-muted">
            Deze functie komt binnenkort.
          </p>
          <Link
            className="mt-6 inline-block text-sm font-medium text-lumina-500 transition-colors hover:text-lumina-700"
            href="/inloggen"
          >
            Terug naar inloggen
          </Link>
        </div>
      </div>
    </main>
  );
}
