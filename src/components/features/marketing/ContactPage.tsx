import Link from "next/link";
import { Header } from "@/components/features/marketing/Header";
import { ContactForm } from "@/components/features/marketing/ContactForm";

export function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
        <h1 className="mb-4 font-serif text-3xl text-foreground md:text-4xl">
          Contact
        </h1>
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted">
          Heb je een vraag, wil je support, of wil je iets melden? Vul het
          formulier in — we lezen elk bericht.
        </p>

        <ContactForm />

        <p className="mt-10">
          <Link
            className="text-sm text-lumina-700 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500"
            href="/"
          >
            Terug naar home
          </Link>
        </p>
      </main>
    </>
  );
}
