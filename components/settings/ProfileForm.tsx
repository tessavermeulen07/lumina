"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChangePasswordSection } from "@/components/settings/ChangePasswordSection";
import { createClient } from "@/lib/supabase/client";
import { coachOptions } from "@/lib/constants/onboarding";
import { useUpdateProfile } from "@/lib/queries/use-profile";
import type { AiCoachStyle } from "@/lib/types/onboarding";
import {
  COMMON_TIMEZONE_OPTIONS,
  DEFAULT_TIMEZONE,
  detectBrowserTimezone,
  resolveTimezone,
} from "@/lib/utils/user-timezone";

interface ProfileFormProps {
  username: string;
  email?: string;
  aiPersonaPreference: AiCoachStyle | null;
  timezone?: string | null;
  goalsCheckinTime?: string | null;
  morningReflectionTime?: string | null;
  eveningReflectionTime?: string | null;
}

function toTimeInputValue(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  return value.slice(0, 5);
}

export function ProfileForm({
  username: initialUsername,
  email,
  aiPersonaPreference: initialCoachStyle,
  timezone: initialTimezone,
  goalsCheckinTime: initialGoalsCheckinTime,
  morningReflectionTime: initialMorningReflectionTime,
  eveningReflectionTime: initialEveningReflectionTime,
}: Readonly<ProfileFormProps>) {
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const usernameId = useId();
  const coachStyleId = useId();
  const timezoneId = useId();
  const [username, setUsername] = useState(initialUsername);
  const [coachStyle, setCoachStyle] = useState<AiCoachStyle | "">(
    initialCoachStyle ?? "",
  );
  const [timezone, setTimezone] = useState(
    resolveTimezone(initialTimezone ?? DEFAULT_TIMEZONE),
  );
  const [goalsCheckinTime, setGoalsCheckinTime] = useState(
    toTimeInputValue(initialGoalsCheckinTime, "09:00"),
  );
  const [morningReflectionTime, setMorningReflectionTime] = useState(
    toTimeInputValue(initialMorningReflectionTime, "08:00"),
  );
  const [eveningReflectionTime, setEveningReflectionTime] = useState(
    toTimeInputValue(initialEveningReflectionTime, "20:00"),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isPending = updateProfile.isPending;

  useEffect(() => {
    if (window.location.hash !== "#meldingen") {
      return;
    }

    document.getElementById("meldingen")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    if (!initialTimezone) {
      setTimezone(detectBrowserTimezone());
    }
  }, [initialTimezone]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitProfile();
  }

  async function submitProfile() {
    setMessage(null);
    setError(null);

    const result = await updateProfile.mutateAsync({
      username: username.trim(),
      aiPersonaPreference: coachStyle || null,
      timezone,
      goalsCheckinTime,
      morningReflectionTime,
      eveningReflectionTime,
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setMessage("Je profiel is bijgewerkt.");
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-foreground"
            htmlFor={usernameId}
          >
            Naam
          </label>
          <input
            className="w-full max-w-md rounded-xl border border-lumina-500/25 bg-surface px-4 py-3 text-foreground focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50"
            id={usernameId}
            onChange={(event) => setUsername(event.target.value)}
            required
            type="text"
            value={username}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            E-mailadres
          </label>
          <p className="text-muted">{email ?? "—"}</p>
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-foreground"
            htmlFor={coachStyleId}
          >
            AI-coach stijl
          </label>
          <select
            className="w-full max-w-md rounded-xl border border-lumina-500/25 bg-surface px-4 py-3 text-foreground focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50"
            id={coachStyleId}
            onChange={(event) =>
              setCoachStyle(event.target.value as AiCoachStyle | "")
            }
            value={coachStyle}
          >
            <option value="">Nog niet gekozen</option>
            {coachOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <section
          className="scroll-mt-8 space-y-4 rounded-2xl border border-lumina-500/15 bg-background p-4"
          id="meldingen"
        >
          <h2 className="text-sm font-semibold text-foreground">
            Meldingen en herinneringen
          </h2>
          <p className="text-xs text-muted">
            Je krijgt op deze tijden een popup in je eigen tijdzone. Ben je niet
            online, dan tonen we de popup zodra je weer inlogt.
          </p>
          <div>
            <label
              className="mb-1.5 block text-xs font-medium text-foreground"
              htmlFor={timezoneId}
            >
              Tijdzone
            </label>
            <select
              className="w-full max-w-md rounded-xl border border-lumina-500/25 bg-surface px-3 py-2 text-sm text-foreground focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50"
              id={timezoneId}
              onChange={(event) => setTimezone(event.target.value)}
              value={timezone}
            >
              {COMMON_TIMEZONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Tijd doelen check-in
              </label>
              <input
                className="w-full rounded-xl border border-lumina-500/25 bg-surface px-3 py-2 text-sm text-foreground focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50"
                onChange={(event) => setGoalsCheckinTime(event.target.value)}
                required
                type="time"
                value={goalsCheckinTime}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Tijd ochtendreflectie
              </label>
              <input
                className="w-full rounded-xl border border-lumina-500/25 bg-surface px-3 py-2 text-sm text-foreground focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50"
                onChange={(event) => setMorningReflectionTime(event.target.value)}
                required
                type="time"
                value={morningReflectionTime}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Tijd avondreflectie
              </label>
              <input
                className="w-full rounded-xl border border-lumina-500/25 bg-surface px-3 py-2 text-sm text-foreground focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50"
                onChange={(event) => setEveningReflectionTime(event.target.value)}
                required
                type="time"
                value={eveningReflectionTime}
              />
            </div>
          </div>
        </section>

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

        <Button disabled={isPending} type="submit" variant="primary">
          {isPending ? "Opslaan…" : "Opslaan"}
        </Button>
      </form>

      {email ? <ChangePasswordSection email={email} /> : null}

      <section className="border-t border-lumina-500/15 pt-8">
        <h2 className="text-lg font-semibold text-foreground">Account</h2>
        <p className="mt-2 max-w-prose text-sm text-muted">
          Log uit om je sessie op dit apparaat te beëindigen.
        </p>
        <div className="mt-4">
          <Button
            disabled={isSigningOut}
            onClick={() => {
              void handleSignOut();
            }}
            type="button"
            variant="outline"
          >
            {isSigningOut ? "Uitloggen…" : "Uitloggen"}
          </Button>
        </div>
      </section>
    </div>
  );
}
