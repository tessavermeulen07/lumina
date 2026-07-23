"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordCard() {
  const searchParams = useSearchParams();
  const titleId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const linkExpired = searchParams.get("fout") === "verlopen";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/wachtwoord-wijzigen`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo },
    );

    setIsLoading(false);

    if (resetError) {
      setError("Er ging iets mis. Probeer het later opnieuw.");
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="w-full">
      <div
        aria-labelledby={titleId}
        className="relative w-full rounded-2xl border border-lumina-500/25 bg-surface p-6 shadow-lg"
      >
        <div className="mb-6 flex justify-center opacity-70">
          <Logo className="h-6 w-6" />
        </div>

        <h1
          className="text-center font-serif text-2xl text-foreground"
          id={titleId}
        >
          Wachtwoord vergeten
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Vul je e-mailadres in. Je ontvangt een link om je wachtwoord te
          resetten.
        </p>

        {linkExpired ? (
          <p className="mt-4 text-center text-sm text-lumina-700" role="alert">
            Je resetlink is verlopen. Vraag hieronder een nieuwe aan.
          </p>
        ) : null}

        {success ? (
          <p className="mt-6 text-center text-sm text-lumina-500" role="status">
            Als dit e-mailadres bij ons bekend is, ontvang je een link.
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              autoComplete="email"
              id="forgot-email"
              label="E-mailadres"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="naam@voorbeeld.com"
              required
              type="email"
              value={email}
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
              {isLoading ? "Bezig met versturen…" : "Stuur resetlink"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          <Link
            className="font-medium text-lumina-500 transition-colors hover:text-lumina-700"
            href="/inloggen"
          >
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
