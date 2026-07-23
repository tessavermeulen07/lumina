# Lumina — project brief

Lumina is een Nederlandse reflectie-app. Gebruikers schrijven dagelijkse entries, stellen intenties en gewoonten in, en ontvangen AI-ondersteunde inzichten.

## Kern

- Rustige, focusvriendelijke UX (geen drukke dashboards in deze fase)
- UI-taal: Nederlands, informeel met **je**
- Visuele identiteit: blauw-groen palet (`lumina-900` t/m `lumina-100`)

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Supabase (auth, database, storage)
- OpenAI (coach, entry-analyse, weekrapporten)
- TwinWord Emotion Analysis API (optioneel)

## Projectstructuur

```
src/
  app/                 # Next.js routes en API
  components/
    ui/                # Herbruikbare primitives
    layout/            # Shell, navigatie, providers
    features/          # Domeinspecifieke UI
  hooks/               # Custom React hooks
  lib/                 # Server/client logica
  types/               # TypeScript types
docs/
  PROJECT-BRIEF.md
  PROMPT-LOG.md
  AI-DECISIONS.md
  plans/
supabase/
public/
```

Zie [README.md](../README.md) voor installatie en deployment.
