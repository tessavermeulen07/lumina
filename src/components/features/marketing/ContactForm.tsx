"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CONTACT_CATEGORY_VALUES } from "@/lib/contact/categories";
import type { ContactCategory } from "@/types/database";

const fieldClassName =
  "w-full rounded-xl border border-lumina-500/25 bg-surface px-4 py-3 text-foreground focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50";

const CATEGORY_OPTIONS: { value: ContactCategory; label: string }[] = [
  { value: "algemene_vraag", label: "Algemene vraag" },
  { value: "support", label: "Support" },
  { value: "klacht", label: "Klacht" },
];

export function ContactForm() {
  const formId = useId();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<ContactCategory | "">("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!category || !CONTACT_CATEGORY_VALUES.includes(category)) {
      setError("Kies een type vraag.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          subject: subject.trim(),
          category,
          message: message.trim(),
          website,
        }),
      });

      let result: { error?: string } = {};
      const responseText = await response.text();
      if (responseText) {
        try {
          result = JSON.parse(responseText) as { error?: string };
        } catch {
          setError("Verzenden mislukt. Probeer het opnieuw.");
          setIsLoading(false);
          return;
        }
      }

      if (!response.ok) {
        setError(
          result.error ?? "Verzenden mislukt. Controleer je gegevens en probeer het opnieuw.",
        );
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setSubject("");
      setCategory("");
      setMessage("");
      setWebsite("");
    } catch {
      setError("Verzenden mislukt. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div
        className="rounded-2xl border border-lumina-500/15 bg-surface/60 px-6 py-8"
        role="status"
      >
        <h2 className="font-serif text-xl text-foreground">Bericht verzonden</h2>
        <p className="mt-3 text-muted">
          Bedankt, we hebben je bericht ontvangen. We nemen zo snel mogelijk
          contact met je op.
        </p>
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsSuccess(false)}
          >
            Nog een bericht sturen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      aria-labelledby={`${formId}-title`}
      className="relative space-y-5 rounded-2xl border border-lumina-500/15 bg-surface/60 px-6 py-8"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="sr-only" id={`${formId}-title`}>
        Contactformulier
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id={`${formId}-firstName`}
          label="Voornaam"
          autoComplete="given-name"
          required
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
        <Input
          id={`${formId}-lastName`}
          label="Achternaam"
          autoComplete="family-name"
          required
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
      </div>

      <Input
        id={`${formId}-email`}
        label="Emailadres"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <Input
        id={`${formId}-subject`}
        label="Onderwerp"
        required
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
      />

      <div>
        <label
          className="mb-1.5 block text-sm font-medium text-foreground"
          htmlFor={`${formId}-category`}
        >
          Type
        </label>
        <select
          className={fieldClassName}
          id={`${formId}-category`}
          required
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as ContactCategory | "")
          }
        >
          <option disabled value="">
            Kies een optie
          </option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Textarea
        id={`${formId}-message`}
        label="Bericht"
        required
        placeholder="Waar kunnen we je mee helpen?"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />

      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor={`${formId}-website`}>Website</label>
        <input
          autoComplete="off"
          id={`${formId}-website`}
          name="website"
          tabIndex={-1}
          type="text"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <Button className="w-full sm:w-auto" disabled={isLoading} type="submit">
        {isLoading ? "Verzenden…" : "Verstuur bericht"}
      </Button>
    </form>
  );
}
