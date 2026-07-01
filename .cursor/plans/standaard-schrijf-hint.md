# Standaard hint op schrijfpagina

## Doel

Vervang de mock-tekst over de wandeling door de vaste hint **"Wat wil je vandaag nog meer kwijt?"** op de standaard schrijfpagina (`/schrijf`). Overige flows blijven ongewijzigd.

## Huidige situatie

- Standaardroute (`/schrijf` zonder query params) gebruikt `getWritingPrompt("yesterday")` uit mockdata.
- Mock bevat placeholder-scenario's (`generic`, `yesterday`, `earlier_today`) die nergens in productie worden aangeroepen.

## Gewenste situatie

| Route | Hint |
|-------|------|
| `/schrijf` (standaard) | Wat wil je vandaag nog meer kwijt? |
| `?id=...` | Ga verder met schrijven. |
| `?vervolg=...` | reflectievraag uit database |
| `?reflectie=ochtend\|avond` | dynamisch via `getCheckInWritingContext` |
| `?prompt=first_entry` | Schrijf je eerste entry. (onboarding) |

## Bestanden

- [`app/(app)/schrijf/page.tsx`](../../app/(app)/schrijf/page.tsx) — default-tak met vaste hint; `first_entry` apart
- [`lib/mock/writing.ts`](../../lib/mock/writing.ts) — alleen `first_entry` behouden
- [`lib/types/writing.ts`](../../lib/types/writing.ts) — type vereenvoudigen tot `first_entry`

## Status

Geïmplementeerd.
