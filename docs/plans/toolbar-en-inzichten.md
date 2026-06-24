---
name: Toolbar en inzichten
overview: "Verbeter de schrijfbalk (meebewegend met inhoud, duidelijk definitief opslaan) en bouw geschiedenis + inzichten: auto-save als concept, definitief opslaan met AI-analyse die eerst getoond wordt, daarna Ga verder naar dashboard, geschiedenispagina per week met entry-modal (Invoer/Analyse)."
todos:
  - id: toolbar-ux
    content: Toolbar groter, definitief Opslaan prominent, in document flow onder JournalFlow (niet fixed viewport)
    status: completed
  - id: analysis-migration
    content: Migratie entry_analyses (incl. title + summary) + types
    status: completed
  - id: analyze-pipeline
    content: analyze-entry.ts + finalize-entry.ts server actions
    status: completed
  - id: analysis-review
    content: EntryAnalysisReview scherm na definitief opslaan met Ga verder-knop naar dashboard
    status: completed
  - id: geschiedenis-page
    content: Geschiedenispagina met weeknavigatie, daggroepen en entry-kaarten
    status: completed
  - id: entry-modal
    content: EntryDetailModal (breder dan login) met tabs Invoer en Analyse
    status: completed
  - id: weekly-data
    content: get-weekly-insights.ts + get-history-by-week.ts aggregatie
    status: completed
  - id: inzichten-ui
    content: Inzichtenpagina met grafieken, kaders en personen-cloud
    status: completed
  - id: nav-links
    content: AppNav Geschiedenis + Inzichten; route /geschiedenis
    status: completed
isProject: false
---

# Schrijfbalk, definitief opslaan + geschiedenis & inzichten

## Twee soorten opslaan

| Actie | Doel | Gedrag |
|-------|------|--------|
| **Auto-save** (1500ms debounce) | Concept bewaren | Slaat user blocks + `entries.content` op; entry kan later worden afgemaakt; **geen** AI-analyse |
| **Opslaan-knop** | Definitief afronden | Persist alles → AI-analyse → **analyse eerst tonen** → gebruiker klikt **Ga verder** → dashboard (`/vandaag`) |

```mermaid
flowchart LR
  autosave[Auto-save] --> draft[Concept in DB]
  draft --> later[Later verder schrijven]
  opslaan[Opslaan klik] --> finalize[finalizeEntry]
  finalize --> review[Analyse lezen]
  review --> gaVerder[Ga verder]
  gaVerder --> dashboard[/vandaag]
```

---

## Deel A: Schrijfbalk

### Huidige situatie

- [`WritingToolbar.tsx`](components/journal/WritingToolbar.tsx): `fixed bottom-6` — blijft op viewport hangen, beweegt **niet** mee met langere entries
- Opslaan is een klein icoon; status staat los boven de tekst

### Gewenste wijzigingen

**1. Meebewegend met de inhoud**

- Toolbar **niet** `fixed` aan de viewport
- Plaats de bar **in document flow**, direct onder [`JournalFlow`](components/journal/JournalFlow.tsx) binnen [`WritingArea.tsx`](components/journal/WritingArea.tsx)
- Naarmate de entry langer wordt, schuift de balk mee naar beneden (onderaan de geschreven inhoud)
- [`FooterGate.tsx`](components/layout/FooterGate.tsx): footer verbergen op `/schrijf` zodat de bar niet visueel concurreert met de site-footer
- Ruimte: `mt-8` tussen laatste blok en toolbar; `pb-12` onder toolbar op schrijfpagina

**2. Groter en duidelijk “definitief opslaan”**

- Bar: `rounded-2xl`, `py-3 px-4`, iconen `h-10 w-10`
- **Opslaan-knop**: label "Opslaan" + icoon, `bg-lumina-900 text-white`; tijdens verwerken "Opslaan…" / "Analyse wordt gemaakt…"
- Status in de bar (niet meer boven de tekst): "Concept opgeslagen" na auto-save vs. foutmeldingen
- Auto-save: subtiele bevestiging in toolbar ("Concept opgeslagen"), geen analyse

---

## Deel B: AI-analyse bij definitief opslaan

### Databasemodel

Nieuwe migratie `entry_analyses`:

```sql
CREATE TABLE public.entry_analyses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id uuid NOT NULL UNIQUE REFERENCES public.entries (id) ON DELETE CASCADE,
    title text NOT NULL,
    summary text NOT NULL,
    reflection_text text NOT NULL,
    key_insight text NOT NULL,
    feelings jsonb NOT NULL DEFAULT '[]',
    persons jsonb NOT NULL DEFAULT '[]',
    themes jsonb NOT NULL DEFAULT '[]',
    word_count int NOT NULL DEFAULT 0,
    emotion_scores jsonb,
    analyzed_at timestamptz NOT NULL DEFAULT now()
);
```

- `title` — korte AI-titel voor geschiedeniskaart en modal
- `summary` — korte AI-samenvatting voor geschiedeniskaart
- `reflection_text` — uitgebreide entry-reflectie (Analyse-tab)
- Overige velden ongewijzigd (feelings met emoji, persons, themes, emotion_scores via Twinword)

### AI-pipeline

**Nieuw** [`lib/ai/analyze-entry.ts`](lib/ai/analyze-entry.ts): structured OpenAI output + Twinword

**Nieuw** [`lib/entries/finalize-entry.ts`](lib/entries/finalize-entry.ts):

1. Alle user blocks persisten + `syncEntryContent`
2. `analyzeEntry` uitvoeren
3. Upsert `entry_analyses` + `emotion_analyses`
4. Retourneer `{ entryId, analysis }`

**Wijzig** [`WritingArea.tsx`](components/journal/WritingArea.tsx) `handleManualSave`:

1. `finalizeEntry(entryId)`
2. Schakel naar **analyse-review modus** op de schrijfpagina (geen directe redirect)

Auto-save blijft alleen `saveUserBlock` / `createEntryWithUserBlock` — geen `finalizeEntry`.

### Analyse eerst tonen (nieuw Deel B2)

**Nieuw** [`components/journal/EntryAnalysisReview.tsx`](components/journal/EntryAnalysisReview.tsx):

- Vervangt tijdelijk schrijfweergave + toolbar na succesvol `finalizeEntry`
- Toont volledige analyse (zelfde inhoud als Analyse-tab in geschiedenis-modal):
  - titel, reflectie, key insight, gevoelens (emoji + label), personen, thema's
- Rustige, leesbare layout (`max-w-prose`, lumina-accenten)
- Onderaan vaste actie: primaire knop **"Ga verder"** → `router.push('/vandaag')`
- Geen sluiten via backdrop; gebruiker leest bewust en kiest zelf wanneer hij/zij verdergaat

**Herbruik** analyse-weergave in [`EntryDetailModal`](components/history/EntryDetailModal.tsx) via gedeeld component [`EntryAnalysisContent.tsx`](components/history/EntryAnalysisContent.tsx) — één bron voor analyse-UI.

Analyse en invoer later opnieuw bekijken via **Geschiedenis** → entry-kaart → modal (tabs Invoer / Analyse).

---

## Deel C: Geschiedenis (voorheen “Eerdere entries”)

### Navigatie & route

- [`AppNav.tsx`](components/app/AppNav.tsx): label **"Geschiedenis"** i.p.v. "Eerdere entries"
- Route: [`app/(app)/geschiedenis/page.tsx`](app/(app)/geschiedenis/page.tsx) (redirect of vervanging van `/entries`)
- Paginatitel: "Geschiedenis"

### Weekweergave bovenaan

**Component** `HistoryWeekHeader`:

```
┌─────────────────────────────────────┐
│  <    Deze week              (geen >) │  ← huidige week: > verborgen
│       17 – 23 juni 2026              │  ← lichte accentkleur (text-lumina-500)
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  <    10 – 16 juni 2026        >    │  ← eerdere week: alleen datumbereik prominent
└─────────────────────────────────────┘
```

- **Huidige week**: kop "Deze week" (`text-foreground`, duidelijk leesbaar), daaronder weekdatums in accentkleur
- **`<`**: naar eerdere week (altijd beschikbaar als er oudere weken met entries zijn)
- **`>`**: alleen zichtbaar als je **niet** op de huidige week bent én er een latere week met entries is; op "Deze week" geen `>`
- Bij oudere weken: geen "Deze week"-label, alleen datumbereik in accentkleur

**Data** [`lib/insights/get-history-by-week.ts`](lib/insights/get-history-by-week.ts): entries + analyses per week, weekgrenzen via [`startOfWeek`](lib/data/week-utils.ts), lijst van weken die entries bevatten (voor `>`-logica)

### Entry-lijst per dag

Entries gegroepeerd per dag, kop:

- "Gisteren" als `created_at` gisteren was
- Anders: "Maandag 16 juni" (nl-NL)

**Entry-kaart** `HistoryEntryCard` (klikbaar):

```
┌─────────────────────────────────────┐
│                        14:32      │  ← rechtsboven, lichte accentkleur
│  Titel van de entry (AI)          │  ← font-medium
│  Korte samenvatting van Lumina…     │  ← text-muted, 2–3 regels max
└─────────────────────────────────────┘
```

- Alleen entries **met** `entry_analyses` tonen titel + samenvatting (definitief opgeslagen)
- Concepten zonder analyse: kaart met "Concept — nog niet afgerond" + link "Verder schrijven" → `/schrijf?id=...`

Klik op afgeronde kaart → opent **EntryDetailModal** (niet aparte routepagina)

---

## Deel D: Entry-detail modal

**Nieuw** [`components/history/EntryDetailModal.tsx`](components/history/EntryDetailModal.tsx)

- Overlay-patroon zoals [`LoginOverlay`](components/marketing/LoginOverlay.tsx) (`fixed inset-0`, backdrop blur)
- Breedte: `max-w-3xl` (breder dan login/registreren `max-w-lg`)
- URL-state: `/geschiedenis?entry={id}&tab=invoer|analyse` zodat deelbaar en back-knop werkt
- Sluiten via backdrop, Escape, of sluit-knop

**Tabbladen linksboven:**

| Tab | Inhoud |
|-----|--------|
| **Invoer** | Volledige entry-thread (user blocks + inline Lumina-antwoorden uit blokken), read-only [`JournalFlow`](components/journal/JournalFlow.tsx)-variant |
| **Analyse** | `title`, `reflection_text`, `key_insight`, gevoelens (emoji + label), personen, thema's |

**Invoer-tab:**

- Bovenaan in accentkleur: datum + tijd van invoer (nl-NL)
- Daaronder de volledige inhoud

**Analyse-tab:** zelfde structuur als na definitief opslaan

**Standaard tab bij openen:**

- Vanuit geschiedenis-kaart: **Invoer** (gebruiker kan zelf naar Analyse tabblad)

Link "Bewerken" in modal-footer → `/schrijf?id=...`

---

## Deel E: Inzichtenpagina (wekelijks)

Ongewijzigd in scope: [`app/(app)/inzichten/page.tsx`](app/(app)/inzichten/page.tsx) met statistieken, woorden-per-dag staafgrafiek, emoties-grafiek, gevoelens/thema's in kaders, personen als leesbare woordwolk met `(Nx)`.

**Nieuw** [`lib/insights/get-weekly-insights.ts`](lib/insights/get-weekly-insights.ts) — aggregatie uit `entry_analyses` per week

**Nav:** item "Inzichten" in [`AppNav.tsx`](components/app/AppNav.tsx)

Geschiedenis = teruglezen per entry; Inzichten = patronen en statistieken per week.

---

## Bestandenoverzicht

| Actie | Bestand |
|-------|---------|
| Wijzig | `WritingToolbar.tsx`, `WritingArea.tsx`, `FooterGate.tsx` |
| Nieuw migratie | `entry_analyses` (met `title`, `summary`) |
| Nieuw | `lib/ai/analyze-entry.ts`, `lib/entries/finalize-entry.ts` |
| Nieuw | `lib/insights/get-history-by-week.ts`, `get-weekly-insights.ts` |
| Nieuw | `app/(app)/geschiedenis/page.tsx` |
| Nieuw | `components/journal/EntryAnalysisReview.tsx`, `components/history/EntryAnalysisContent.tsx` |
| Nieuw | `components/history/HistoryWeekHeader.tsx`, `HistoryEntryCard.tsx`, `EntryDetailModal.tsx` |
| Nieuw | `app/(app)/inzichten/page.tsx`, `components/insights/*` |
| Wijzig | `lib/types/database.ts`, `AppNav.tsx` |
| Verwijder/redirect | `app/(app)/entries/page.tsx` → redirect naar `/geschiedenis` |

## Testplan

1. **Auto-save:** typen → "Concept opgeslagen" in toolbar; geen analyse; entry hervatbaar via schrijven
2. **Toolbar:** groter; staat onder inhoud en schuift mee bij lange entries; niet fixed over footer
3. **Opslaan:** definitief → analyse gegenereerd → **analyse-scherm** op schrijfpagina; pas na **Ga verder** → `/vandaag`
4. **Geschiedenis:** "Deze week" + datums; `<`/`>` logica; gisteren-label; kaarten met tijd, titel, samenvatting
5. **Modal:** breder dan login; tabs Invoer/Analyse; invoer toont datum+tijd accent; openen vanuit geschiedenis start op Invoer
6. **Concept-entry:** zichtbaar in geschiedenis met "nog niet afgerond"
7. **Inzichten:** weekstatistieken en grafieken werken op basis van `entry_analyses`

## Fasering

1. Deel A — toolbar (flow + definitief opslaan UI)
2. Deel B — migratie + analyze + finalize
3. Deel B2 — EntryAnalysisReview + Ga verder naar dashboard
4. Deel C + D — geschiedenispagina + entry-modal
5. Deel E — inzichtenpagina
