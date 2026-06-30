"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { passwordsMatch, validatePassword } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";

interface ChangePasswordSectionProps {
  email: string;
}

export function ChangePasswordSection({
  email,
}: Readonly<ChangePasswordSectionProps>) {
  const currentPasswordId = useId();
  const newPasswordId = useId();
  const confirmPasswordId = useId();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!passwordsMatch(newPassword, confirmPassword)) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      setIsLoading(false);
      setError("Je huidige wachtwoord is onjuist.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsLoading(false);

    if (updateError) {
      setError("Wachtwoord wijzigen mislukt. Probeer het opnieuw.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Je wachtwoord is gewijzigd.");
  }

  return (
    <section className="border-t border-lumina-500/15 pt-8">
      <h2 className="text-lg font-semibold text-foreground">Wachtwoord</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Wijzig je wachtwoord. Je hebt je huidige wachtwoord nodig.
      </p>

      <form className="mt-4 max-w-md space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-foreground"
            htmlFor={currentPasswordId}
          >
            Huidig wachtwoord
          </label>
          <input
            autoComplete="current-password"
            className="w-full rounded-xl border border-lumina-500/25 bg-surface px-4 py-3 text-foreground focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50"
            id={currentPasswordId}
            minLength={8}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            type="password"
            value={currentPassword}
          />
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-foreground"
            htmlFor={newPasswordId}
          >
            Nieuw wachtwoord
          </label>
          <input
            autoComplete="new-password"
            className="w-full rounded-xl border border-lumina-500/25 bg-surface px-4 py-3 text-foreground focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50"
            id={newPasswordId}
            minLength={8}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            type="password"
            value={newPassword}
          />
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-foreground"
            htmlFor={confirmPasswordId}
          >
            Bevestig nieuw wachtwoord
          </label>
          <input
            autoComplete="new-password"
            className="w-full rounded-xl border border-lumina-500/25 bg-surface px-4 py-3 text-foreground focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50"
            id={confirmPasswordId}
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-lumina-500" role="status">
            {message}
          </p>
        ) : null}

        <Button disabled={isLoading} type="submit" variant="primary">
          {isLoading ? "Opslaan…" : "Wachtwoord wijzigen"}
        </Button>
      </form>
    </section>
  );
}
