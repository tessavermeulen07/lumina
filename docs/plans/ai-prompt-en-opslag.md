# AI-modi verduidelijken en antwoorden opslaan bij entry

Zie implementatie in de codebase. Samenvatting:

## Interactiemodus vs coachstijl

- **InteractionMode**: `dashboard` | `entry_toolbar` — waar de gebruiker AI gebruikt
- **CoachStyle**: `empathetic` | `direct` — hoe Lumina antwoordt (uit onboarding/instellingen)

## Toolbar-acties

- `geef_inzicht`: inzicht in huidige tekst (samenvatting + patronen/emoties)
- `eerdere_gedragspatronen`: cross-entry patronen via `search_journal_history`

## Persistentie

- AI-antwoorden op schrijfpagina → `entry_ai_responses` tabel
- Inline weergave onder textarea in lumina-kleur
- Badge op EntryCard: "Lumina heeft gereageerd"
