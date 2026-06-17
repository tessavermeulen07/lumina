# Schrijfpagina: onzichtbaar tekstvak met AI-hint

## Doel

De pagina `app/(app)/schrijf/page.tsx` is een focus-scherm zonder koptekst. De AI toont een **blijvende hint boven** het schrijfvlak. Het tekstvak zelf is visueel onzichtbaar — geen rand, geen witte box.

## Visueel ontwerp

- **Hint**: `text-muted`, `font-serif`, `text-lg`, `max-w-prose`
- **Tekstvak**: randloos, transparant, zelfde typografie in `text-foreground`
- **Pagina**: geen titel of intro

## Bestanden

- `lib/types/writing.ts` — `WritingPrompt` type
- `lib/mock/writing.ts` — drie mock-scenario's + `getWritingPrompt()`
- `components/journal/WritingArea.tsx` — client component
- `app/(app)/schrijf/page.tsx` — dunne compositie

## Mock scenario's

| Type | Hint |
|------|------|
| `generic` | Waar denk je vandaag aan? |
| `yesterday` (default) | Gisteren schreef je over je wandeling in het park... |
| `earlier_today` | Vanmorgen noemde je dat je je rustig voelde... |

Query param `?prompt=generic|yesterday|earlier_today` voor dev-review.

## Toolbar (gepland)

Sticky menu onderaan zodra er getypt is: AI, afbeelding, formatting, meer opties — met carrousel-submenu's en image-modal. Zie [schrijf-toolbar-menu.md](schrijf-toolbar-menu.md).

**Icoonstijl**: alle toolbar-iconen enkelkleurig groen (`text-lumina-500`, hover `text-lumina-700`), geen emoji's of multi-color SVG's. SVG's via `currentColor`.

## Scope

Geen AI, database, auto-save of header-wijzigingen in deze stap.

## Status

- [x] Plan opgeslagen in `.cursor/plans/schrijfpagina-invisible-editor.md`
- [x] Toolbar-plan opgeslagen in `.cursor/plans/schrijf-toolbar-menu.md`
- [x] Mockup gegenereerd: `assets/schrijfpagina-mockup.png`
- [x] Schrijfpagina basis geïmplementeerd
- [x] Toolbar geïmplementeerd
