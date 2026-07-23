import Link from "next/link";
import { Header } from "@/components/features/marketing/Header";

const LAST_UPDATED = "23 juli 2026";

const linkClass =
  "text-foreground underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500";

function SectionHeading({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <h2 className="mb-3 font-serif text-xl text-foreground md:text-2xl">
      {children}
    </h2>
  );
}

function Paragraph({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p className="mb-4 leading-relaxed text-muted last:mb-0">{children}</p>
  );
}

function LegalHeading({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <h3 className="mb-2 mt-8 font-serif text-lg text-foreground first:mt-0">
      {children}
    </h3>
  );
}

export function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
        <h1 className="mb-4 font-serif text-3xl text-foreground md:text-4xl">
          Privacy bij Lumina
        </h1>
        <Paragraph>
          Reflecties zijn persoonlijk. Hier lees je op een rustige manier hoe
          Lumina met jouw gegevens omgaat — en daaronder de formele
          privacyverklaring.
        </Paragraph>
        <p className="mb-10">
          <a
            className="text-sm text-lumina-700 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500"
            href="#privacyverklaring"
          >
            Naar de privacyverklaring
          </a>
        </p>

        <section aria-labelledby="uitleg-heading" className="space-y-8">
          <h2 className="sr-only" id="uitleg-heading">
            Hoe Lumina met je data omgaat
          </h2>

          <div>
            <SectionHeading>Jouw reflecties zijn van jou</SectionHeading>
            <Paragraph>
              Entries, intenties en inzichten horen bij jouw account. Andere
              gebruikers kunnen ze niet zien. Toegang tot jouw data in de
              database is beperkt tot jouw account (row-level security).
            </Paragraph>
          </div>

          <div>
            <SectionHeading>
              Wat we nodig hebben om de app te laten werken
            </SectionHeading>
            <Paragraph>
              Om Lumina te gebruiken hebben we een account nodig (e-mail en
              naam), je journaltekst, eventuele afbeeldingen die je uploadt,
              voorkeuren uit onboarding of instellingen, en de resultaten van
              analyses (zoals samenvattingen, thema&apos;s of emotiescores).
            </Paragraph>
          </div>

          <div>
            <SectionHeading>AI als hulpmiddel</SectionHeading>
            <Paragraph>
              Voor de coach, entry-analyse en weekrapporten sturen we relevante
              tekst naar externe AI-diensten. Dat gebeurt alleen om die
              functies te leveren. We verkopen je journalinhoud niet en zetten
              geen openbare feed van reflecties online.
            </Paragraph>
          </div>

          <div>
            <SectionHeading>Extra bescherming: privé</SectionHeading>
            <Paragraph>
              Privé-entries kun je in de app vergrendelen. Je ontgrendelt ze
              dan bewust voordat je ze weer leest. Dat is een extra drempel in
              de app — geen end-to-end encryptie. Server-side blijven gegevens
              beveiligd via authenticatie en toegangsregels.
            </Paragraph>
          </div>

          <div>
            <SectionHeading>Wat we niet doen</SectionHeading>
            <Paragraph>
              We verkopen je journalinhoud niet aan derden en delen reflecties
              niet openbaar. We gebruiken je tekst niet om een openbaar product
              of community-feed te vullen.
            </Paragraph>
          </div>

          <div>
            <SectionHeading>Jouw keuzes</SectionHeading>
            <Paragraph>
              In je account kun je profielgegevens bekijken en aanpassen. Wil
              je je account of data laten verwijderen, neem dan contact op via
              de{" "}
              <Link className={linkClass} href="/contact">
                contactpagina
              </Link>
              .
            </Paragraph>
          </div>
        </section>

        <p className="mt-10 mb-12">
          <a
            className="text-sm text-lumina-700 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500"
            href="#privacyverklaring"
          >
            Lees de volledige privacyverklaring
          </a>
        </p>

        <hr className="border-lumina-500/15" />

        <section
          aria-labelledby="privacyverklaring-heading"
          className="pt-12"
          id="privacyverklaring"
        >
          <h2
            className="mb-2 font-serif text-2xl text-foreground md:text-3xl"
            id="privacyverklaring-heading"
          >
            Privacyverklaring
          </h2>
          <p className="mb-8 text-sm text-muted">
            Laatst bijgewerkt: {LAST_UPDATED}
          </p>

          <LegalHeading>1. Wie is verantwoordelijk?</LegalHeading>
          <Paragraph>
            Lumina is een reflectie-app (portfolio- / eindopdrachtproject). Voor
            vragen over privacy kun je terecht op de{" "}
            <Link className={linkClass} href="/contact">
              contactpagina
            </Link>
            .
          </Paragraph>

          <LegalHeading>2. Welke gegevens verwerken we?</LegalHeading>
          <Paragraph>
            Afhankelijk van hoe je Lumina gebruikt, kunnen we de volgende
            gegevens verwerken:
          </Paragraph>
          <ul className="mb-4 list-disc space-y-2 pl-5 text-muted">
            <li>Account- en authenticatiegegevens (zoals e-mailadres)</li>
            <li>Profielgegevens (zoals naam en voorkeuren)</li>
            <li>
              Journalentries, afbeeldingen en gerelateerde metadata
            </li>
            <li>
              AI-uitvoer zoals samenvattingen, thema&apos;s, vragen en
              emotie-analyses
            </li>
            <li>Intenties, gewoonten en check-ins</li>
            <li>
              Technische gegevens die nodig zijn om de dienst veilig te laten
              werken (zoals sessie-informatie)
            </li>
          </ul>

          <LegalHeading>3. Doeleinden en grondslag</LegalHeading>
          <Paragraph>
            We verwerken gegevens om de dienst te leveren (overeenkomst):
            accountbeheer, opslaan van reflecties, AI-coaching en inzichten,
            intentie-check-ins en beveiliging. Waar nodig vragen we toestemming
            of steunen we op een gerechtvaardigd belang voor de veilige
            werking van de app.
          </Paragraph>

          <LegalHeading>4. Bewaartermijn</LegalHeading>
          <Paragraph>
            We bewaren je gegevens zolang je account actief is. Na verwijdering
            van je account streven we ernaar persoonsgegevens binnen 30 dagen
            te verwijderen of te anonimiseren, tenzij een langere bewaring
            wettelijk verplicht is.
          </Paragraph>

          <LegalHeading>5. Verwerkers en ontvangers</LegalHeading>
          <Paragraph>
            Om Lumina te laten werken schakelen we dienstverleners in die
            gegevens in onze opdracht verwerken:
          </Paragraph>
          <ul className="mb-4 list-disc space-y-2 pl-5 text-muted">
            <li>Supabase — authenticatie, database en bestandsopslag</li>
            <li>OpenAI — tekstanalyse, coachantwoorden en rapporten</li>
            <li>
              TwinWord (via RapidAPI) — optionele emotieanalyse van tekst
            </li>
            <li>Vercel — hosting van de applicatie</li>
          </ul>

          <LegalHeading>6. Doorgifte buiten de EER</LegalHeading>
          <Paragraph>
            Sommige providers (waaronder AI- en clouddiensten) kunnen gegevens
            buiten de Europese Economische Ruimte verwerken. Waar dat gebeurt,
            doen we dat met passende waarborgen, zoals standaard
            contractbepalingen of vergelijkbare maatregelen van de
            betreffende provider.
          </Paragraph>

          <LegalHeading>7. Beveiliging</LegalHeading>
          <Paragraph>
            We nemen passende technische en organisatorische maatregelen,
            waaronder versleutelde verbindingen (TLS), authenticatie,
            toegangsbeperking per gebruiker (row-level security) en een
            privé-vergrendeling in de app voor gemarkeerde entries. Lumina
            claimt geen end-to-end encryptie van journalinhoud.
          </Paragraph>

          <LegalHeading>8. Jouw rechten</LegalHeading>
          <Paragraph>
            Onder de AVG kun je onder meer verzoeken om inzage, rectificatie,
            wissing, beperking van de verwerking, bezwaar en — waar van
            toepassing — dataportabiliteit. Stuur je verzoek via de{" "}
            <Link className={linkClass} href="/contact">
              contactpagina
            </Link>
            . Je kunt ook een klacht indienen bij de Autoriteit
            Persoonsgegevens.
          </Paragraph>

          <LegalHeading>9. Wijzigingen</LegalHeading>
          <Paragraph>
            We kunnen deze privacyverklaring aanpassen als de app of wetgeving
            verandert. De datum bovenaan geeft aan wanneer de tekst voor het
            laatst is bijgewerkt.
          </Paragraph>
        </section>

        <p className="mt-12">
          <Link
            className="text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500"
            href="/"
          >
            Terug naar home
          </Link>
        </p>
      </main>
    </>
  );
}
