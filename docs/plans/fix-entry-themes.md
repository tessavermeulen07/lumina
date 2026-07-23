---
name: Fix entry themes
overview: De entry-analyse toont "theme" i.p.v. echte themawoorden door een kapot JSON-schema in de AI-prompt en een label-helper die object-keys teruggeeft. We herstellen het schema en maken de normalisatie robuust voor bestaande data.
todos:
  - id: fix-prompt-schema
    content: Herstel themes JSON-schema in ANALYSIS_PROMPT (name-veld)
    status: completed
  - id: harden-label-helper
    content: "Pas getEntryThemeLabel aan: aliases + eerste string-waarde i.p.v. key"
    status: completed
  - id: filter-placeholders
    content: Filter theme/thema placeholders in normalizeEntryThemes
    status: completed
isProject: true
---

# Fix thema's in entry-analyse

## Probleem

De AI krijgt een ongeldig themes-schema in `lib/ai/analyze-entry.ts`: de beschrijving staat als object-key, zonder `"name"`. Het model antwoordt daardoor vaak met `{ "theme": "Werk" }`.

`getEntryThemeLabel` zoekt alleen `name`; bij ontbreken neemt die de **eerste key** (`"theme"`) in plaats van de waarde (`"Werk"`). Die verkeerde label wordt opgeslagen en overal getoond (analyse-review, inzichten, weekly report).

## Aanpak

1. Prompt-schema herstellen: `"themes": [{ "name": "..." }]`
2. Label-extractie harden: aliases (`theme`, `thema`, `label`) + eerste string-waarde
3. Placeholder-labels filteren (`theme` / `thema` / `Thema`)

## Scope

- `lib/ai/analyze-entry.ts` en `lib/types/entry-analysis.ts`
- Geen DB-migratie: bestaande analyses worden bij weergave al goed gelezen
