---
name: Privacy pagina uitleg
overview: Een marketingpagina op `/privacy` met eerst een vriendelijke productuitleg over hoe Lumina met reflecties omgaat, daarna een formele AVG-privacyverklaring, plus footer-link naar die route.
todos:
  - id: privacy-route
    content: Route `(marketing)/privacy/page.tsx` + metadata + PrivacyPage component
    status: completed
  - id: privacy-copy
    content: Nederlandse vriendelijke uitleg + AVG-secties (feitelijk o.b.v. Supabase/OpenAI/TwinWord)
    status: completed
  - id: footer-header-links
    content: Footer Privacy → /privacy; Header/#-links naar /#...
    status: completed
  - id: save-plan-doc
    content: Plan opslaan in docs/plans/privacy-pagina.md
    status: completed
isProject: true
---

# Privacy-pagina (uitleg + AVG)

## Keuze

Eén pagina op **`/privacy`** met twee blokken:

1. **Vriendelijke uitleg** (boven) — rustig, Nederlands met **je**, producttaal
2. **Privacyverklaring (AVG)** (onder) — formeel, maar leesbaar; met anker `#privacyverklaring`

Alleen Privacy is in scope. Contact via `/contact` (zie [contact-pagina](docs/plans/contact-pagina.md)).

## Route en bestanden

```
src/app/(marketing)/privacy/page.tsx          # thin page + metadata
src/components/features/marketing/PrivacyPage.tsx
docs/plans/privacy-pagina.md                  # plan opslaan
```

- Blijft in route group `(marketing)` → `marketing-aura` achtergrond.
- Server Component; geen client state.
- Footer: Privacy `href="/privacy"` in `Footer.tsx`.

## Layout / UX

```mermaid
flowchart TB
  Header[Marketing Header]
  Intro[Titel + korte intro]
  Friendly[Vriendelijke uitleg secties]
  Divider[Scheiding]
  Legal[AVG privacyverklaring]
  Footer[Footer met link Privacy]
  Header --> Intro --> Friendly --> Divider --> Legal --> Footer
```

- Hergebruik Header. Nav-ankers: `/#functies`, `/#over-ons`, `/#prijzen`.
- Content in `main`: max-width ~`max-w-3xl`, rustige typografie.
- Metadata: `title: "Privacy | Lumina"`.

## Inhoud — deel 1: vriendelijke uitleg

Feitelijk (geen E2E-claim). Secties: jouw reflecties, wat we nodig hebben, AI als hulpmiddel, privé-entries, wat we niet doen, jouw keuzes. Link naar `#privacyverklaring`.

## Inhoud — deel 2: AVG-privacyverklaring

Verantwoordelijke, gegevens, doeleinden, bewaartermijn (30 dagen na accountverwijdering), verwerkers (Supabase, OpenAI, TwinWord/RapidAPI, Vercel), doorgifte buiten EER, beveiliging, rechten, wijzigingen.

## Footer en navigatie

- Footer Privacy → `/privacy`
- Header-ankers met prefix `/`

## Buiten scope

Voorwaarden, Disclaimer, cookie-banner, account-verwijderflow, registratie-E2E-copy.
