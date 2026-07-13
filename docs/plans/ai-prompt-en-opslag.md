# AI-modi verduidelijken en antwoorden opslaan bij entry

Zie implementatie in de codebase. Samenvatting:

## Interactiemodus vs coachstijl

- **InteractionMode**: `dashboard` | `entry_toolbar` — waar de gebruiker AI gebruikt
- **CoachStyle**: `empathetic` | `direct` — hoe Lumina antwoordt (uit onboarding/instellingen)

## Toolbar-acties

- `vat_samen`: neutrale samenvatting van de volledige post (gebruiker + Lumina-reacties in de thread)
- `geef_inzicht`: interpretatie van actief schrijfsegment (thema's, emoties, denkpatronen)
- `eerdere_gedragspatronen`: cross-entry patronen via `search_journal_history`

## Persistentie

- AI-antwoorden op schrijfpagina → `entry_ai_responses` tabel
- Inline weergave onder textarea in lumina-kleur
- Badge op EntryCard: "Lumina heeft gereageerd"
