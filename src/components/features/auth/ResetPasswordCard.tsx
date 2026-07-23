"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { passwordsMatch, validatePassword } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordCard() {
  const router = useRouter();
  const titleId = useId();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      setHasSession(Boolean(data.session));
    }

    void checkSession();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!passwordsMatch(password, confirmPassword)) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setIsLoading(false);

    if (updateError) {
      setError(
        "Je link is verlopen of ongeldig. Vraag een nieuwe resetlink aan.",
      );
      return;
    }

    router.push("/vandaag");
    router.refresh();
  }

  if (hasSession === null) {
    return (
      <div className="w-full rounded-2xl border border-lumina-500/25 bg-surface p-6 text-center shadow-lg">
        <p className="text-sm text-muted">Even geduld…</p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="w-full rounded-2xl border border-lumina-500/25 bg-surface p-6 text-center shadow-lg">
        <div className="mb-6 flex justify-center opacity-70">
          <Logo className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-2xl text-foreground">
          Link verlopen
        </h1>
        <p className="mt-2 text-sm text-muted">
          Deze resetlink is niet meer geldig. Vraag een nieuwe aan.
        </p>
        <Link
          className="mt-6 inline-block text-sm font-medium text-lumina-500 transition-colors hover:text-lumina-700"
          href="/wachtwoord-vergeten"
        >
          Nieuwe resetlink aanvragen
        </Link>
      </div>
    );
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
          Nieuw wachtwoord
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Kies een nieuw wachtwoord voor je account.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            autoComplete="new-password"
            id="reset-password"
            label="Nieuw wachtwoord"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimaal 8 tekens"
            required
            type="password"
            value={password}
          />
          <Input
            autoComplete="new-password"
            id="reset-password-confirm"
            label="Bevestig wachtwoord"
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Herhaal je wachtwoord"
            required
            type="password"
            value={confirmPassword}
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
            {isLoading ? "Bezig met opslaan…" : "Wachtwoord opslaan"}
          </Button>
        </form>
      </div>
    </div>
  );
}
