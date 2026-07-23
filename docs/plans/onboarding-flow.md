---
name: Onboarding flow
overview: Na registratie doorverwijzen naar een rustige `/onboarding`-wizard (4 schermen, selecteerbare kaarten), keuzes tijdelijk in sessionStorage bewaren, en na scherm 4 doorsturen naar `/schrijf` met een eerste-entry prompt.
todos:
  - id: extend-input-register
    content: "Input uitbreiden + RegisterCard: validatie, sessionStorage naam, redirect /onboarding"
    status: pending
  - id: onboarding-route-layout
    content: Route group (onboarding) met layout + FooterGate voor rustige full-page UX
    status: pending
  - id: onboarding-types-constants
    content: src/types/onboarding.ts + src/lib/constants/onboarding.ts met alle stap-copy
    status: pending
  - id: selection-card
    content: src/components/ui/SelectionCard.tsx met actief/inactief styling
    status: pending
  - id: onboarding-wizard
    content: OnboardingWizard met 4 stappen, navigatie en sessionStorage opslag
    status: pending
  - id: first-entry-prompt
    content: first_entry prompt toevoegen + schrijf-pagina koppelen na scherm 4
    status: pending
isProject: true
---

# Onboarding flow na registratie

## Flow

```mermaid
flowchart LR
  Register["/registreren"] -->|"Account aanmaken"| Onboarding["/onboarding"]
  Onboarding --> S1["Scherm 1: hoofddoel"]
  S1 --> S2["Scherm 2: prioriteiten"]
  S2 --> S3["Scherm 3: ervaring"]
  S3 --> S4["Scherm 4: AI-coach"]
  S4 --> Schrijf["/schrijf?prompt=first_entry"]
```

---

## 1. Registratie koppelen aan onboarding

Wijzig [`src/components/features/marketing/RegisterCard.tsx`](src/components/features/marketing/RegisterCard.tsx):

- Form state met `useState` (naam, e-mail, wachtwoord) of `FormData` in submit
- HTML-validatie: `required` op alle velden, `minLength={8}` op wachtwoord
- Uitbreiden [`src/components/ui/Input.tsx`](src/components/ui/Input.tsx) met optionele props: `required`, `minLength`, `value`, `onChange`
- Bij succesvolle submit:
  1. Naam opslaan in `sessionStorage` onder `lumina-user-name`
  2. `router.replace("/onboarding")` — popup verdwijnt doordat `/registreren` verlaten wordt

---

## 2. Route en layout (geen app-nav)

Nieuwe route group **`src/app/(onboarding)/`** — buiten [`src/app/(app)/layout.tsx`](src/app/(app)/layout.tsx) zodat er geen `AppHeader` of navigatie is.

| Bestand | Doel |
|---------|------|
| [`src/app/(onboarding)/layout.tsx`](src/app/(onboarding)/layout.tsx) | `marketing-aura`, `min-h-screen`, gecentreerde inhoud, subtiel Lumina-logo bovenaan |
| [`src/app/(onboarding)/onboarding/page.tsx`](src/app/(onboarding)/onboarding/page.tsx) | Dunne server page die `<OnboardingWizard />` rendert |

**Footer:** Root layout toont altijd [`Footer`](src/components/layout/Footer.tsx). Voeg een kleine client wrapper `FooterGate` toe die de footer verbergt op `/onboarding` — anders ondermijnt de footer het rustige, paginagrote gevoel.

---

## 3. Data en types (geen database)

Nieuw [`src/types/onboarding.ts`](src/types/onboarding.ts):

```ts
export type OnboardingMainGoal = "mental-health" | "gratitude" | ...;
export type OnboardingPriority = "creativity" | "relationships" | ...;
export type JournalExperience = "first-time" | "some" | "experienced";
export type AiCoachStyle = "empathetic" | "direct";

export interface OnboardingAnswers {
  mainGoal: OnboardingMainGoal | null;
  priorities: OnboardingPriority[];
  experience: JournalExperience | null;
  coachStyle: AiCoachStyle | null;
}
```

Nieuw [`src/lib/constants/onboarding.ts`](src/lib/constants/onboarding.ts) — alle stapdefinities met Nederlandse labels en ids (DB-ready). Copy exact volgens specificatie:

**Scherm 1** (single): Mental Health verbeteren, Dankbaarheid stimuleren, Ontdekken van patronen en triggers, Belangrijkse gebeurtenissen vastleggen, Mezelf uitdrukken, Personelijke groei bijhouden

**Scherm 2** (multi): Creatieviteit en expressie, Relaties, Balans en doelen in mijn leven, Werk en carrière, Persoonlijke ontwikkeling, Gezondheid en welzijn

**Scherm 3** (single): Dit is de eerste keer, Al een paar keer gedaan, Behoorlijk wat ervaring

**Scherm 4** (single, met beschrijving): De Empathische Luisteraar + De Directe Gids (inclusief subteksten uit specificatie). Onder de kaarten: *Je kunt je coach later aanpassen in Instellingen.*

Na voltooiing: antwoorden JSON in `sessionStorage` onder `lumina-onboarding-answers` (klaar voor latere DB-koppeling).

---

## 4. UI-componenten

### [`src/components/ui/SelectionCard.tsx`](src/components/ui/SelectionCard.tsx) (nieuw)

Herbruikbare klikbare kaart met duidelijk actief/inactief onderscheid:

| Staat | Styling |
|-------|---------|
| Inactief | `border-lumina-500/25 bg-surface hover:border-lumina-500/50` |
| Actief | `border-lumina-500 bg-lumina-300/15 ring-2 ring-lumina-100/50` |

- Semantisch: `<button type="button">` met `aria-pressed` (multi) of geselecteerde staat visueel
- Optionele `description` prop voor coach-kaarten (scherm 4)
- `font-serif` titel, `text-muted` beschrijving, royale padding (`p-5`/`p-6`), `rounded-2xl`, rustige `transition-colors`

### [`src/components/features/onboarding/OnboardingWizard.tsx`](src/components/features/onboarding/OnboardingWizard.tsx) (nieuw, client)

Step-state machine (`step` 1–4) met gedeelde `OnboardingAnswers` state:

| Scherm | Selectie | Navigatie |
|--------|----------|-----------|
| 1 | Single | Tik op kaart → direct door naar stap 2 |
| 2 | Multi | Toggle kaarten; knop **Volgende** (disabled tot min. 1 keuze) |
| 3 | Single | Tik op kaart → direct door naar stap 4 |
| 4 | Single | Tik op kaart → opslaan + `router.push("/schrijf?prompt=first_entry")` |

**Scherm 1 titel:** `Wat brengt je bij Lumina, [Naam]?` — naam uit `sessionStorage` (`lumina-user-name`), fallback `"daar"` als leeg.

**Subtekst scherm 1:** *Kies je hoofddoel (je kunt dit later altijd aanpassen).*

**Layout per stap:**
- Subtiele voortgang: *Stap X van 4* (`text-sm text-muted`)
- Gecentreerde `font-serif` titel (`text-3xl`/`text-4xl`)
- Optionele subtekst
- Responsive grid: `grid gap-3 sm:grid-cols-2` (scherm 4: `max-w-2xl`, grotere kaarten)
- Terug-knop op stappen 2–4 (links boven) voor correctie

---

## 5. Eerste entry op `/schrijf`

Uitbreiden [`src/types/writing.ts`](src/types/writing.ts) en [`src/lib/mock/writing.ts`](src/lib/mock/writing.ts):

- Nieuw prompt-type: `first_entry`
- Hint: *Schrijf je eerste entry.*

Wijzig [`src/app/(app)/schrijf/page.tsx`](src/app/(app)/schrijf/page.tsx): `first_entry` toevoegen aan `validPromptTypes`.

Na onboarding landt de gebruiker op `/schrijf` met de app-shell (header aanwezig) en de rustige schrijf-UI met bovenstaande hint via bestaande [`WritingArea`](src/components/features/journal/WritingArea.tsx).

---

## Buiten scope

- Database-persistentie en auth
- Werkelijke coach-wissel in instellingen (alleen copy-verwijzing op scherm 4)
- Validatie van e-mailformaat buiten HTML5 `type="email"`

---

## Testplan

- Registratie met lege velden → browser toont verplicht-meldingen
- Registratie met ingevulde velden → `/onboarding`, popup weg
- Scherm 1 toont naam uit formulier
- Single-select schermen: één actieve kaart, directe voortgang
- Scherm 2: meerdere kaarten actief, Volgende pas na selectie
- Scherm 4: coach-beschrijvingen zichtbaar, actief/inactief duidelijk
- Afronding → `/schrijf` met hint *Schrijf je eerste entry.*
- `sessionStorage` bevat `lumina-user-name` en `lumina-onboarding-answers`
- Geen footer en geen app-nav op `/onboarding`
