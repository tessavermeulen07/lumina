---
name: User-koppeling en AI
overview: Koppel alle app-onderdelen aan de ingelogde Supabase-gebruiker (dashboard, entries, intenties, profiel, uitloggen) en bouw een werkende Ask-Lumina AI-flow met OpenAI tool-calling, Twinword emotie-analyse, journal-zoeken en opslag in bestaande tabellen.
todos:
  - id: profile-logout
    content: lib/auth/get-profile.ts + UserMenu met instellingen-icoon (geen naam in header) + uitloggen
    status: completed
  - id: dashboard-data
    content: lib/data/get-dashboard-overview.ts + dashboardbegroeting + vandaag/page.tsx koppelen aan echte entries
    status: completed
  - id: entries-crud-read
    content: list/get entry server functions + EntryList UI + schrijf?id bewerken
    status: completed
  - id: intentions-db
    content: lib/habits/* server actions + GoalsSection persistent maken
    status: completed
  - id: fts-migration
    content: FTS-migratie op entries + questions-migratie verifiëren/toepassen
    status: completed
  - id: ai-tools
    content: Twinword, search-journal, save-insight, question-context tools in lib/ai/tools.ts
    status: completed
  - id: openai-agent
    content: lib/ai/agent.ts met OpenAI tool-calling + ask-lumina server action
    status: completed
  - id: ask-lumina-ui
    content: "AskLuminaSection refactoren: DB-vragen, AI-antwoord, recente inzichten"
    status: completed
  - id: toolbar-ai
    content: WritingToolbar AI-knoppen + AiResponsePanel + respond-to-entry
    status: completed
  - id: settings-page
    content: "Instellingen: profiel bewerken, coach-stijl, uitlog-knop"
    status: completed
  - id: manual-setup
    content: "Handmatig: SUPABASE_DB_URL + npm run db:migrate + db:apply-questions; OPENAI_API_KEY + RAPIDAPI_KEY in .env.local"
    status: pending
isProject: true
---

# Plan: gebruikerskoppeling + Ask Lumina AI

## Huidige situatie (na implementatie)

| Onderdeel | Status |
|-----------|--------|
| Routebescherming + entry opslaan | Supabase Auth + RLS |
| Dashboard (`/vandaag`) | Echte entry-data + begroeting "Fijn je weer te zien, {naam}" |
| Entries (`/entries`) | Lijst + bewerken via `/schrijf?id=…` |
| Intenties | Persistent in `habits_and_intentions` |
| Ask Lumina | OpenAI-agent + DB-vragen + recente `ai_insights` |
| UserMenu | Instellingen-icoon + dropdown (Instellingen, Uitloggen) |
| Schrijf-toolbar AI | `respondToEntryAction` + `AiResponsePanel` |
| Instellingen | Profiel, coach-stijl, uitloggen |
| AI-backend | `lib/ai/agent.ts`, tools, Twinword, journal search |

De database gebruikt bestaande tabellen: `profiles`, `entries`, `emotion_analyses`, `habits_and_intentions`, `ai_insights`, `questions`. FTS-kolom via [`supabase/migrations/20250622100000_entries_fts.sql`](supabase/migrations/20250622100000_entries_fts.sql).

## Architectuur

```mermaid
flowchart TB
  subgraph client [Client]
    Vandaag["/vandaag + begroeting"]
    Entries["/entries"]
    AskLumina[AskLuminaSection]
    Toolbar[WritingToolbar]
    UserMenu["UserMenu (instellingen-icoon)"]
  end

  subgraph server [Server - lib/]
    DataLayer["data/ + entries/ + habits/"]
    Profile["auth/get-profile"]
    Agent["ai/agent.ts"]
    Tools["ai/tools.ts"]
  end

  subgraph external [Extern]
    OpenAI[OpenAI API]
    Twinword[Twinword via RapidAPI]
  end

  subgraph db [Supabase]
    EntriesT[entries]
    QuestionsT[questions]
    InsightsT[ai_insights]
    EmotionsT[emotion_analyses]
    HabitsT[habits_and_intentions]
    ProfilesT[profiles]
  end

  Vandaag --> DataLayer
  Vandaag --> Profile
  Entries --> DataLayer
  AskLumina --> Agent
  Toolbar --> Agent
  DataLayer --> db
  Agent --> OpenAI
  Agent --> Tools
  Tools --> Twinword
  Tools --> db
```

---

## Fase 1 — Gedeelde data-laag en profiel

### 1.1 Profiel ophalen

[`lib/auth/get-profile.ts`](lib/auth/get-profile.ts)

- `getAuthenticatedUser()` — `createClient()` + `getUser()`, redirect naar `/inloggen` als niet ingelogd
- `getProfile()` — `profiles` row + e-mail uit auth

### 1.2 Instellingenmenu in de header (icoon, geen naam)

[`components/app/UserMenu.tsx`](components/app/UserMenu.tsx) + [`components/app/SettingsIcon.tsx`](components/app/SettingsIcon.tsx)

- Trigger: **instellingen-icoon** (tandwiel), `aria-label`: "Instellingen en account"
- Dropdown: **Instellingen** + **Uitloggen**
- Uitloggen: `signOut()` → `/inloggen` → `router.refresh()`

[`app/(app)/layout.tsx`](app/(app)/layout.tsx) — geen profiel-fetch; naam alleen op dashboard.

---

## Fase 2 — Dashboard aan echte entries + persoonlijke begroeting

### 2.1 Begroeting

[`components/dashboard/DashboardGreeting.tsx`](components/dashboard/DashboardGreeting.tsx) — **"Fijn je weer te zien, {username}"** boven `DashboardOverview`.

### 2.2 Entry-statistieken

[`lib/data/get-dashboard-overview.ts`](lib/data/get-dashboard-overview.ts) + [`lib/data/week-utils.ts`](lib/data/week-utils.ts)

| Stat | Berekening |
|------|------------|
| `weekDays[].hasEntry` | Unieke datums in huidige week (ma–zo) |
| `entryCount` | `COUNT(*)` |
| `wordCount` | Woorden in `content` |
| `streak` | Opeenvolgende dagen met entry; start vanaf gisteren als vandaag leeg |

[`app/(app)/vandaag/page.tsx`](app/(app)/vandaag/page.tsx) — parallel fetch: profiel, overview, journal prompts, intenties, Lumina-vragen, recente inzichten.

[`lib/mock/dashboard.ts`](lib/mock/dashboard.ts) — verwijderd.

---

## Fase 3 — Entries lezen en bewerken

| Bestand | Functie |
|---------|---------|
| [`lib/entries/list-entries.ts`](lib/entries/list-entries.ts) | Lijst entries |
| [`lib/entries/get-entry.ts`](lib/entries/get-entry.ts) | Enkele entry |

UI: [`components/entries/EntryList.tsx`](components/entries/EntryList.tsx), [`EntryCard.tsx`](components/entries/EntryCard.tsx), [`schrijf/page.tsx`](app/(app)/schrijf/page.tsx) met `?id=`, [`WritingArea`](components/journal/WritingArea.tsx) met `initialContent` / `initialEntryId`.

---

## Fase 4 — Intenties persistent

[`lib/habits/`](lib/habits/) — `listIntentions`, `saveIntention`, `deleteIntention` (soft-delete `is_active = false`).

[`GoalsSection`](components/dashboard/GoalsSection.tsx) — server-fetched `initialGoals` + server actions.

---

## Fase 5 — Ask Lumina AI

### Database

[`supabase/migrations/20250622100000_entries_fts.sql`](supabase/migrations/20250622100000_entries_fts.sql) — `search_vector` + GIN-index.

[`questions`](supabase/migrations/20250622000000_questions.sql) — via `npm run db:apply-questions`.

### Omgevingsvariabelen

```
OPENAI_API_KEY=...
RAPIDAPI_KEY=...
```

### AI-stack

| Bestand | Rol |
|---------|-----|
| [`lib/ai/twinword.ts`](lib/ai/twinword.ts) | `analyze_entry_sentiment` |
| [`lib/ai/search-journal.ts`](lib/ai/search-journal.ts) | `search_journal_history` |
| [`lib/ai/save-insight.ts`](lib/ai/save-insight.ts) | `save_ai_insight` |
| [`lib/ai/tools.ts`](lib/ai/tools.ts) | Tool-definities + executors |
| [`lib/ai/agent.ts`](lib/ai/agent.ts) | OpenAI GPT-4o-mini tool-calling |
| [`lib/ai/ask-lumina.ts`](lib/ai/ask-lumina.ts) | Server action dashboard |
| [`lib/ai/get-recent-insights.ts`](lib/ai/get-recent-insights.ts) | Recente inzichten |

[`AskLuminaSection`](components/dashboard/AskLuminaSection.tsx) — DB-vragen, eigen vraag, AI-antwoord, recente inzichten.

---

## Fase 6 — Schrijf-toolbar AI

[`lib/ai/respond-to-entry.ts`](lib/ai/respond-to-entry.ts) + [`lib/ai/toolbar-actions.ts`](lib/ai/toolbar-actions.ts)

[`WritingToolbar`](components/journal/WritingToolbar.tsx) — `onAiAction`  
[`AiResponsePanel`](components/journal/AiResponsePanel.tsx) — antwoord onder editor

---

## Fase 7 — Instellingen

[`app/(app)/instellingen/page.tsx`](app/(app)/instellingen/page.tsx) + [`ProfileForm`](components/settings/ProfileForm.tsx) + [`lib/profile/update-profile.ts`](lib/profile/update-profile.ts)

- Naam bewerken, e-mail read-only, AI-coach stijl, uitlogknop

---

## Afhankelijkheden

```bash
npm install openai
```

---

## Testplan

1. Uitloggen via instellingen-icoon → `/inloggen`; `/vandaag` geblokkeerd
2. Dashboardbegroeting met juiste `profiles.username`
3. Dashboard stats kloppen na schrijven op meerdere dagen
4. Entries-lijst + bewerken via `/schrijf?id=…`
5. Intenties persistent per gebruiker
6. Ask Lumina → NL-antwoord + `ai_insights` rij
7. Twinword emotiescores bij relevante tekst
8. Journal search vindt eerdere entries
9. Toolbar AI op schrijfpagina
10. Username wijzigen in instellingen → begroeting update
11. `npm run db:verify-rls`

---

## Bewust buiten scope

- pgvector / embeddings
- `habit_logs` check-ins
- Onboarding-antwoorden uit `sessionStorage` naar profiel
- Wachtwoord wijzigen / account verwijderen
- Emotie-analyse automatisch bij elke save

---

## Status

- [x] Code geïmplementeerd; `npm run build` slaagt
- [ ] Migraties op remote DB (`npm run db:migrate`, `npm run db:apply-questions`) — vereist `SUPABASE_DB_URL`
- [ ] `OPENAI_API_KEY` en `RAPIDAPI_KEY` in `.env.local`
- [ ] Handmatig testen volgens testplan
