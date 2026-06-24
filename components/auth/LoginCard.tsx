"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";

export function LoginCard() {
  const router = useRouter();
  const titleId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError("E-mailadres of wachtwoord is onjuist.");
      return;
    }

    router.push("/vandaag");
    router.refresh();
  }

  return (
    <div className="w-full">
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative w-full rounded-2xl border border-lumina-500/25 bg-surface p-6 shadow-lg"
        role="dialog"
      >
        <Link
          aria-label="Sluiten"
          className="absolute top-4 right-4 z-20 rounded-full p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-900"
          href="/"
          onClick={(event) => event.stopPropagation()}
        >
          <svg
            aria-hidden
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <div className="mb-6 flex justify-center opacity-70">
          <Logo className="h-6 w-6" />
        </div>

        <h1
          className="text-center font-serif text-2xl text-foreground"
          id={titleId}
        >
          Welkom terug
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Neem een moment voor jezelf.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            autoComplete="email"
            id="login-email"
            label="E-mailadres"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="naam@voorbeeld.com"
            required
            type="email"
            value={email}
          />
          <Input
            autoComplete="current-password"
            id="login-password"
            label="Wachtwoord"
            labelAction={
              <Link
                className="text-sm font-medium text-lumina-500 transition-colors hover:text-lumina-700"
                href="/wachtwoord-vergeten"
              >
                Wachtwoord vergeten?
              </Link>
            }
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Je wachtwoord"
            required
            type="password"
            value={password}
          />

          {error ? (
            <p className="text-sm text-lumina-700" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            className="mt-2 w-full bg-lumina-500 text-surface hover:bg-lumina-700"
            disabled={isLoading}
            type="submit"
            variant="primary"
          >
            {isLoading ? "Bezig met inloggen…" : "Inloggen ✦"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Nieuw bij Lumina?{" "}
          <Link
            className="font-medium text-lumina-500 transition-colors hover:text-lumina-700"
            href="/registreren"
            onClick={(event) => event.stopPropagation()}
          >
            Registreer hier
          </Link>
        </p>
      </div>
    </div>
  );
}
