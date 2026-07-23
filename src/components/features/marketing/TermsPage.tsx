import Link from "next/link";
import { Header } from "@/components/features/marketing/Header";

const LAST_UPDATED = "23 juli 2026";

const linkClass =
  "text-foreground underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500";

const anchorClass =
  "text-sm text-lumina-700 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500";

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

export function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
        <h1 className="mb-4 font-serif text-3xl text-foreground md:text-4xl">
          Voorwaarden bij Lumina
        </h1>
        <Paragraph>
          Hier lees je wat je van Lumina mag verwachten, en wat we van jou
          vragen bij het gebruik — daaronder de formele algemene voorwaarden.
        </Paragraph>
        <p className="mb-10">
          <a className={anchorClass} href="#algemene-voorwaarden">
            Naar de algemene voorwaarden
          </a>
        </p>

        <section aria-labelledby="uitleg-heading" className="space-y-8">
          <h2 className="sr-only" id="uitleg-heading">
            Wat Lumina voor je betekent
          </h2>

          <div>
            <SectionHeading>Wat Lumina is</SectionHeading>
            <Paragraph>
              Lumina is een reflectie-app: je schrijft, volgt intenties en
              krijgt inzichten terug. Het is een portfolio- /
              eindopdrachtproject — geen commercieel zorgproduct.
            </Paragraph>
          </div>

          <div>
            <SectionHeading>Wat je mag verwachten</SectionHeading>
            <Paragraph>
              Een rustige plek om te schrijven, met AI-ondersteuning voor
              samenvattingen, vragen, weekrapporten en check-ins. We streven
              naar een stabiele ervaring, maar beschikbaarheid en functies
              kunnen veranderen terwijl het project groeit.
            </Paragraph>
          </div>

          <div>
            <SectionHeading>AI als hulpmiddel, geen therapie</SectionHeading>
            <Paragraph>
              De coach en analyses zijn hulpmiddelen voor reflectie. Ze zijn
              geen medisch, psychologisch of therapeutisch advies en vervangen
              geen professional. Bij ernstige klachten zoek je passende hulp
              buiten Lumina.
            </Paragraph>
          </div>

          <div>
            <SectionHeading>Jouw verantwoordelijkheid</SectionHeading>
            <Paragraph>
              Je gebruikt Lumina voor jezelf, houdt je inloggegevens privé en
              plaatst geen inhoud die illegaal of schadelijk is. Jouw
              journaltekst blijft van jou; zie ook onze{" "}
              <Link className={linkClass} href="/privacy">
                privacyverklaring
              </Link>
              .
            </Paragraph>
          </div>
        </section>

        <p className="mt-10 mb-12">
          <a className={anchorClass} href="#algemene-voorwaarden">
            Lees de volledige algemene voorwaarden
          </a>
        </p>

        <hr className="border-lumina-500/15" />

        <section
          aria-labelledby="algemene-voorwaarden-heading"
          className="pt-12"
          id="algemene-voorwaarden"
        >
          <h2
            className="mb-2 font-serif text-2xl text-foreground md:text-3xl"
            id="algemene-voorwaarden-heading"
          >
            Algemene voorwaarden
          </h2>
          <p className="mb-8 text-sm text-muted">
            Laatst bijgewerkt: {LAST_UPDATED}
          </p>

          <LegalHeading>1. Toepasselijkheid</LegalHeading>
          <Paragraph>
            Deze voorwaarden gelden voor het gebruik van de Lumina-app en
            bijbehorende websites. Door een account aan te maken of de dienst
            te gebruiken, ga je akkoord met deze voorwaarden. Waar de{" "}
            <Link className={linkClass} href="/privacy">
              privacyverklaring
            </Link>{" "}
            over persoonsgegevens gaat, geldt die naast deze voorwaarden.
          </Paragraph>

          <LegalHeading>2. De dienst</LegalHeading>
          <Paragraph>
            Lumina biedt een digitale omgeving voor persoonlijke reflectie,
            intenties, inzichten en AI-ondersteunde coaching. Lumina is een
            portfolio- / eindopdrachtproject. Registratie kan beperkt zijn tot
            personen met een geldige uitnodigingscode.
          </Paragraph>

          <LegalHeading>3. Account</LegalHeading>
          <Paragraph>
            Je bent verantwoordelijk voor de juistheid van de gegevens die je
            opgeeft en voor het geheimhouden van je inloggegevens. Activiteiten
            onder jouw account worden aan jou toegerekend. Meld vermoedelijk
            misbruik via de{" "}
            <Link className={linkClass} href="/contact">
              contactpagina
            </Link>
            .
          </Paragraph>

          <LegalHeading>4. Gebruiksregels</LegalHeading>
          <Paragraph>Je mag Lumina niet gebruiken om:</Paragraph>
          <ul className="mb-4 list-disc space-y-2 pl-5 text-muted">
            <li>illegale of schadelijke inhoud op te slaan of te verspreiden</li>
            <li>
              de dienst te verstoren, te misbruiken of ongeautoriseerde toegang
              te verkrijgen
            </li>
            <li>
              automatische scraping of overmatige API-belasting uit te voeren
              buiten normaal gebruik
            </li>
          </ul>
          <Paragraph>
            We mogen accounts opschorten of beëindigen bij schending van deze
            regels.
          </Paragraph>

          <LegalHeading>5. AI en geen professioneel advies</LegalHeading>
          <Paragraph>
            Functies die AI gebruiken (zoals analyse, coachantwoorden en
            weekrapporten) zijn bedoeld als ondersteuning bij reflectie. Ze
            vormen geen medisch, psychologisch, juridisch of ander
            professioneel advies. Beslissingen op basis van AI-uitvoer maak je
            voor eigen rekening.
          </Paragraph>

          <LegalHeading>6. Intellectueel eigendom</LegalHeading>
          <Paragraph>
            De software, vormgeving en merkelementen van Lumina blijven van de
            makers van het project. Jouw journalinhoud, afbeeldingen en andere
            content die je uploadt, blijven van jou. Je geeft Lumina alleen de
            beperkte licentie die nodig is om de dienst te leveren (opslaan,
            tonen en analyseren binnen jouw account).
          </Paragraph>

          <LegalHeading>7. Beschikbaarheid</LegalHeading>
          <Paragraph>
            We streven naar een werkende dienst, maar garanderen geen
            ononderbroken beschikbaarheid, foutloze werking of behoud van alle
            functies. Onderhoud, storingen of wijzigingen kunnen tijdelijk
            toegang of functionaliteit beperken.
          </Paragraph>

          <LegalHeading>8. Aansprakelijkheid</LegalHeading>
          <Paragraph>
            Voor zover wettelijk toegestaan is Lumina niet aansprakelijk voor
            indirecte schade, gevolgschade, gederfde winst of schade die
            voortvloeit uit het gebruik van AI-uitvoer of tijdelijke
            onbeschikbaarheid. Onze totale aansprakelijkheid is beperkt tot
            wat redelijk is voor een niet-commercieel portfolio- /
            eindopdrachtproject, en in ieder geval tot het bedrag dat je
            (indien van toepassing) in de voorafgaande twaalf maanden voor de
            dienst hebt betaald — momenteel nihil bij gratis gebruik.
          </Paragraph>

          <LegalHeading>9. Beëindiging</LegalHeading>
          <Paragraph>
            Je kunt stoppen met het gebruik van Lumina wanneer je wilt. Voor
            verwijdering van je account of gegevens kun je contact opnemen via
            de{" "}
            <Link className={linkClass} href="/contact">
              contactpagina
            </Link>
            . We mogen de dienst of je toegang beëindigen bij schending van
            deze voorwaarden of als het project stopt.
          </Paragraph>

          <LegalHeading>10. Privacy</LegalHeading>
          <Paragraph>
            Hoe we met persoonsgegevens omgaan, staat in de{" "}
            <Link className={linkClass} href="/privacy">
              privacyverklaring
            </Link>
            .
          </Paragraph>

          <LegalHeading>11. Wijzigingen</LegalHeading>
          <Paragraph>
            We kunnen deze voorwaarden aanpassen als de app of wetgeving
            verandert. De datum bovenaan geeft aan wanneer de tekst voor het
            laatst is bijgewerkt. Bij wezenlijke wijzigingen kunnen we je
            vragen opnieuw akkoord te gaan (bijvoorbeeld bij registratie of via
            een melding in de app).
          </Paragraph>

          <LegalHeading>12. Contact</LegalHeading>
          <Paragraph>
            Vragen over deze voorwaarden? Neem contact op via de{" "}
            <Link className={linkClass} href="/contact">
              contactpagina
            </Link>
            .
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
