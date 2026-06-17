---
name: Compact dashboard summary
overview: Compact dashboard-overzicht (datum/week/stats), data-laag voor Supabase, en dagelijkse reflectie als carousel met check-in en prompt-kaarten.
todos:
  - id: types-data
    content: DashboardOverviewData types + getDashboardOverview() in mock
    status: completed
  - id: dashboard-overview
    content: DashboardOverview component compacte horizontale layout
    status: completed
  - id: statcard-compact
    content: StatCard compact variant voor inline stats
    status: completed
  - id: wire-page
    content: vandaag/page.tsx aanpassen; WeekOverview + StatsRow verwijderen
    status: completed
  - id: prompt-card
    content: "PromptCard: compact, geen placeholder, potlood bij hover, link naar /schrijf"
    status: pending
  - id: carousel
    content: DailyJournalCarousel client component met scroll-track en pijltjes
    status: pending
  - id: journal-section
    content: "DailyJournalSection: check-in + prompts in carousel layout"
    status: pending
---

# Compact dashboard

Geïmplementeerd en gepland als onderdeel van het Vandaag-dashboard. Zie ook [`app-shell-en-dashboard.md`](app-shell-en-dashboard.md).

## 1. Overzicht (geïmplementeerd)

Aparte cards naast elkaar: datum + weekcirkels links, stats rechts. Datum-card `w-fit`, stats `flex-1`.

### Data-flow (nu vs later)

- **Nu:** `getDashboardOverview()` in `lib/mock/dashboard.ts`
- **Later:** `lib/data/getDashboardOverview.ts` haalt entries uit Supabase en berekent streak, woorden en weekstatus

### Componenten

- `DashboardOverview` — losse cards met gap
- `StatCard` — `compact` prop voor inline stats
- Types in `lib/types/dashboard.ts`
- Verwijderd: `WeekOverview`, `StatsRow`

---

## 2. Dagelijkse reflectie — prompt-carousel (gepland)

### Doel

In [`DailyJournalSection.tsx`](components/dashboard/DailyJournalSection.tsx):

- Placeholdertekst **weg** (`promptsPlaceholderMessage` niet meer tonen)
- Linktekst **weg**; bij hover een **potlood-icoon** (link naar `/schrijf`)
- Prompt-kaarten **kleiner** en **naast** de check-in in een **carousel** met subtiele vorige/volgende pijltjes

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ‹   [ Check-in card ]  [ prompt ]  [ prompt ]  [ ... ]   › │
└──────────────────────────────────────────────────────────────┘
```

- Titel "Dagelijkse reflectie" blijft **buiten** de carousel
- Check-in: `shrink-0`, `min-w-[280px] max-w-[320px]`
- Prompts: `min-w-[200px] max-w-[220px]`, `p-4`, `text-sm`
- Track: `overflow-x-auto scroll-smooth scroll-snap-x`
- Pijltjes: outline-knoppen links/rechts, `aria-label` Vorige/Volgende

### Nieuwe componenten

| Bestand | Rol |
|---------|-----|
| `PromptCard.tsx` | Compacte kaart, badge "Voor jou", potlood bij hover, link naar `/schrijf` |
| `DailyJournalCarousel.tsx` | Client: scroll-track + pijltjes (`scrollBy` smooth) |
| `DailyJournalSection.tsx` | Compositie check-in + prompts in carousel |

### Styling

| Element | Nieuw |
|---------|-------|
| Prompt padding | `p-4` |
| Prompt tekst | `text-sm leading-relaxed` |
| Badge | `text-[0.65rem]` |
| Check-in | vaste breedte in carousel |

### Toegankelijkheid

- Pijltjes: `type="button"`, focus-visible ring
- Prompt-link: `aria-label` "Schrijf over: {tekst}", potlood `aria-hidden`
- Touch/trackpad scroll blijft werken

### Optioneel

- `promptsPlaceholderMessage` in `lib/mock/dashboard.ts` opruimen indien ongebruikt
