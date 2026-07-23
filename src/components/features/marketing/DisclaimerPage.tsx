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

export function DisclaimerPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
        <h1 className="mb-4 font-serif text-3xl text-foreground md:text-4xl">
          Disclaimer bij Lumina
        </h1>
        <Paragraph>
          Hier lees je waar Lumina wel en niet voor is — vooral rond AI,
          advies en aansprakelijkheid. Daaronder staat de formele disclaimer.
        </Paragraph>
        <p className="mb-10">
          <a className={anchorClass} href="#disclaimer">
            Naar de formele disclaimer
          </a>
        </p>

        <section aria-labelledby="uitleg-heading" className="space-y-8">
          <h2 className="sr-only" id="uitleg-heading">
            Grenzen van Lumina
          </h2>

          <div>
            <SectionHeading>Waarom deze pagina</SectionHeading>
            <Paragraph>
              Lumina helpt je reflecteren. Deze pagina maakt duidelijk wat
              dat wel en niet inhoudt, zodat je de app met realistische
              verwachtingen gebruikt. Voor gebruiksafspraken zie de{" "}
              <Link className={linkClass} href="/voorwaarden">
                voorwaarden
              </Link>
              ; voor gegevens zie de{" "}
              <Link className={linkClass} href="/privacy">
                privacyverklaring
              </Link>
              .
            </Paragraph>
          </div>

          <div>
            <SectionHeading>AI als hulpmiddel, geen therapie</SectionHeading>
            <Paragraph>
              De coach, analyses en weekrapporten zijn hulpmiddelen voor
              reflectie. Ze zijn geen medisch, psychologisch of therapeutisch
              advies en vervangen geen professional.
            </Paragraph>
          </div>

          <div>
            <SectionHeading>Geen commercieel zorgproduct</SectionHeading>
            <Paragraph>
              Lumina is een portfolio- / eindopdrachtproject. Het is geen
              zorgaanbieder en geen gecertificeerd medisch of therapeutisch
              product.
            </Paragraph>
          </div>

          <div>
            <SectionHeading>Jouw keuzes blijven van jou</SectionHeading>
            <Paragraph>
              AI-inzichten kunnen onvolledig, onnauwkeurig of verouderd zijn.
              Beslissingen die je neemt op basis van wat Lumina toont, maak je
              voor eigen rekening. Bij ernstige klachten of crisis zoek je
              passende hulp buiten Lumina.
            </Paragraph>
          </div>
        </section>

        <p className="mt-10 mb-12">
          <a className={anchorClass} href="#disclaimer">
            Lees de volledige disclaimer
          </a>
        </p>

        <hr className="border-lumina-500/15" />

        <section
          aria-labelledby="disclaimer-heading"
          className="pt-12"
          id="disclaimer"
        >
          <h2
            className="mb-2 font-serif text-2xl text-foreground md:text-3xl"
            id="disclaimer-heading"
          >
            Disclaimer
          </h2>
          <p className="mb-8 text-sm text-muted">
            Laatst bijgewerkt: {LAST_UPDATED}
          </p>

          <LegalHeading>1. Geen professioneel advies</LegalHeading>
          <Paragraph>
            Informatie en uitvoer in Lumina — inclusief teksten, samenvattingen,
            vragen, analyses en rapporten — vormen geen medisch,
            psychologisch, juridisch of ander professioneel advies. De inhoud
            is bedoeld als ondersteuning bij persoonlijke reflectie, niet als
            diagnose, behandeling of vervanging van zorg of advies door een
            gekwalificeerde professional.
          </Paragraph>

          <LegalHeading>2. AI-uitvoer</LegalHeading>
          <Paragraph>
            Functies die AI gebruiken kunnen fouten bevatten, context missen
            of generaliseren. Er is geen garantie op juistheid, volledigheid
            of geschiktheid voor jouw situatie. Lumina stelt geen medische of
            psychologische diagnoses. Je blijft zelf verantwoordelijk voor
            interpretatie en vervolgacties.
          </Paragraph>

          <LegalHeading>3. Aard van de dienst</LegalHeading>
          <Paragraph>
            Lumina is een portfolio- / eindopdrachtproject voor persoonlijke
            reflectie, intenties en inzichten. Registratie kan beperkt zijn tot
            personen met een geldige uitnodigingscode. De dienst is geen
            commercieel zorgproduct en biedt geen crisisopvang of acute hulp.
          </Paragraph>

          <LegalHeading>4. Beperkte aansprakelijkheid</LegalHeading>
          <Paragraph>
            Voor zover wettelijk toegestaan is Lumina niet aansprakelijk voor
            schade die voortvloeit uit het gebruik of de onmogelijkheid tot
            gebruik van de dienst, uit AI-uitvoer, of uit tijdelijke
            onbeschikbaarheid. Onze totale aansprakelijkheid is beperkt tot
            wat redelijk is voor een niet-commercieel portfolio- /
            eindopdrachtproject, in lijn met de{" "}
            <Link className={linkClass} href="/voorwaarden">
              algemene voorwaarden
            </Link>
            .
          </Paragraph>

          <LegalHeading>5. Externe diensten</LegalHeading>
          <Paragraph>
            Lumina maakt gebruik van externe diensten (onder meer voor hosting,
            authenticatie, opslag en AI). Fouten, storingen of beperkingen bij
            die partijen vallen buiten de garantie van Lumina. Meer over
            verwerkers en gegevens staat in de{" "}
            <Link className={linkClass} href="/privacy">
              privacyverklaring
            </Link>
            .
          </Paragraph>

          <LegalHeading>6. Gerelateerde documenten</LegalHeading>
          <Paragraph>
            Deze disclaimer staat naast de{" "}
            <Link className={linkClass} href="/voorwaarden">
              voorwaarden
            </Link>{" "}
            en de{" "}
            <Link className={linkClass} href="/privacy">
              privacyverklaring
            </Link>
            . Bij tegenstrijdigheid over persoonsgegevens prevaleert de
            privacyverklaring; over gebruiksregels de voorwaarden.
          </Paragraph>

          <LegalHeading>7. Wijzigingen</LegalHeading>
          <Paragraph>
            We kunnen deze disclaimer aanpassen als de app of wetgeving
            verandert. De datum bovenaan geeft aan wanneer de tekst voor het
            laatst is bijgewerkt.
          </Paragraph>

          <LegalHeading>8. Contact</LegalHeading>
          <Paragraph>
            Vragen over deze disclaimer? Neem contact op via de{" "}
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
