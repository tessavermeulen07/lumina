---
name: App shell en dashboard
overview: Bouw de ingelogde app-shell met header/navigatie (Nederlandse routes) en een rustig Vandaag-dashboard met compact overzicht, journal-sectie, intenties met modal en Lumina-vragen — zonder auth, database of AI-backend.
todos:
  - id: extract-logo
    content: LogoIcon extraheren naar src/components/ui/Logo.tsx en marketing Header updaten
    status: completed
  - id: app-header
    content: AppHeader, AppNav (actieve links) en UserMenu (dropdown) bouwen
    status: completed
  - id: app-layout-routes
    content: src/app/(app)/layout.tsx + routes /vandaag, /entries, /schrijf, /instellingen
    status: completed
  - id: mock-data
    content: src/lib/mock/dashboard.ts met weekdagen, stats en placeholder-prompts/vragen
    status: completed
  - id: dashboard-ui
    content: Dashboard-componenten DailyJournal, Goals, AskLumina + compact DashboardOverview
    status: completed
  - id: placeholder-pages
    content: Minimale placeholder-pagina's voor entries, schrijf en instellingen
    status: completed
  - id: compact-overview
    content: Datum, weekdagen en stats naast elkaar in losse cards met props-driven data
    status: completed
  - id: goals-modal
    content: Intenties met +-knop, AddGoalModal (naam, frequentie, omschrijving)
    status: completed
  - id: goals-lumina-row
    content: Intenties en Vraag het Lumina naast elkaar in GoalsAndLuminaRow
    status: completed
---

# App-shell en Vandaag-dashboard

## Context

De marketing-site staat onder [`src/app/(marketing)/`](src/app/(marketing)/). De ingelogde app komt in route group [`src/app/(app)/`](src/app/(app)/) met gedeelde layout.

**Scope nu:** UI + navigatie + dashboard-compositie. Geen auth, database of AI.

## Route-structuur

| Pad | Pagina |
|-----|--------|
| `/vandaag` | Dashboard (post-login landing) |
| `/entries` | Eerdere entries |
| `/schrijf` | Nieuw bericht |
| `/instellingen` | Account |

## Dashboard-overzicht (compact)

Aparte cards: datum + weekcirkels links, stats rechts. Data via `getDashboardOverview()` → props. Types in `src/types/dashboard.ts`.

**Later (Supabase):** `hasEntry`, streak, entryCount en wordCount uit entries-tabel.

## Dagelijkse reflectie

Check-in card + AI-prompt placeholders (`DailyJournalSection`).

## Intenties en Lumina (naast elkaar)

`GoalsAndLuminaRow`: twee cards op desktop (`lg:grid-cols-2`).

### Intenties (`GoalsSection`)

- Card met titel + `+ Voeg toe`-knop (geen inline invoerveld)
- Modal (`AddGoalModal`): Naam, Hoe vaak (dropdown), Omschrijving
- Goal-type in `src/types/goal.ts`; lokale state (geen Supabase)

### Vraag het Lumina (`AskLuminaSection`)

- Card met vraag-chips en placeholder-antwoord

## Buiten scope

- Auth / login-flow
- Supabase / persistente data
- AI-prompts en Lumina-antwoorden
