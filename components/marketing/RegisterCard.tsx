"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import { getRegisterErrorMessage } from "@/lib/auth/register";

interface RegisterCardProps {
  onAccountCreated: (name: string) => void;
}

export function RegisterCard({ onAccountCreated }: Readonly<RegisterCardProps>) {
  const router = useRouter();
  const titleId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) return;

    setIsLoading(true);

    const registerResponse = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmedName,
        email,
        password,
      }),
    });

    const registerResult = (await registerResponse.json()) as { error?: string };

    if (!registerResponse.ok) {
      setIsLoading(false);
      setError(
        registerResult.error ??
          "Registratie mislukt. Controleer je gegevens en probeer het opnieuw.",
      );
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(getRegisterErrorMessage(signInError.message));
      return;
    }

    router.refresh();
    onAccountCreated(trimmedName);
  }

  return (
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

      <h2
        className="text-center font-serif text-2xl text-foreground"
        id={titleId}
      >
        Creëer je gratis account
      </h2>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <Input
          autoComplete="name"
          id="register-name"
          label="Naam"
          onChange={(event) => setName(event.target.value)}
          placeholder="Hoe mogen we je noemen?"
          required
          value={name}
        />
        <Input
          autoComplete="email"
          id="register-email"
          label="E-mailadres"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="naam@voorbeeld.com"
          required
          type="email"
          value={email}
        />
        <Input
          autoComplete="new-password"
          id="register-password"
          label="Wachtwoord"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimaal 8 tekens"
          required
          type="password"
          value={password}
        />

        {error ? (
          <p className="text-sm text-lumina-700" role="alert">
            {error}
          </p>
        ) : null}

        <Button className="mt-2 w-full" disabled={isLoading} type="submit" variant="primary">
          {isLoading ? "Account aanmaken…" : "Account aanmaken ✦"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Heb je al een account?{" "}
        <Link
          className="font-medium text-lumina-500 transition-colors hover:text-lumina-700"
          href="/inloggen"
        >
          Log in
        </Link>
      </p>

      <p className="mt-4 text-center text-sm text-muted">
        🔒 Je data is end-to-end beveiligd en 100% privé.
      </p>
    </div>
  );
}
