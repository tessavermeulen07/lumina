---
name: Vat samen apart
overview: "Splits \"Vat samen\" en \"Geef inzicht\" in twee aparte toolbar-acties met eigen AI-gedrag: neutrale samenvatting versus interpretatief inzicht. De UI blijft twee knoppen; de backend krijgt een nieuwe `vat_samen`-actie en aangepaste prompts."
todos:
  - id: add-vat-samen-type
    content: Voeg `vat_samen` toe aan ToolbarAiAction en TOOLBAR_ACTION_CATEGORIES (lege array) in question-context.ts
    status: completed
  - id: split-toolbar-mapping
    content: "Wijzig toolbar-actions.ts: Vat samen → vat_samen, aparte ACTION_TO_LABEL entry"
    status: completed
  - id: split-ai-prompts
    content: Schrijf aparte TOOLBAR_ACTION_INSTRUCTIONS voor vat_samen (volledige thread) en geef_inzicht in agent-prompt.ts; pas buildUserMessage aan zodat vat_samen de thread als primaire bron benadrukt
    status: completed
  - id: fix-action-label-display
    content: Voeg vat_samen toe aan knownActions in JournalFlow.tsx (of gebruik getToolbarActionLabel met fallback)
    status: completed
  - id: update-docs
    content: Werk docs/plans/ai-prompt-en-opslag.md bij met het onderscheid tussen beide acties
    status: completed
isProject: false
---

# Plan: Vat samen en Geef inzicht als aparte acties

## Gewenste situatie

| Actie | Gebruikersintentie | AI-gedrag (strikt) |
|-------|-------------------|-------------------|
| `vat_samen` | "Wat staat er in mijn hele post?" | Neutrale samenvatting van de **volledige entry-thread**: alle gebruikerstekst én eerdere Lumina-reacties in deze post. Lengte past bij omvang (geen 2–3-zinnen-limiet). Geen interpretatie, thema's, patronen of cognitieve vervormingen. |
| `geef_inzicht` | "Wat zegt dit over mij?" | Korte spiegeling + benoemde thema's, emotionele tonen en denkpatronen in het actieve schrijfsegment. Geen zoekactie in eerdere entries. |

## Wijzigingen

- [`lib/ai/question-context.ts`](lib/ai/question-context.ts) — `vat_samen` type + lege question-categories
- [`lib/ai/toolbar-actions.ts`](lib/ai/toolbar-actions.ts) — aparte mapping + `resolveToolbarActionLabel`
- [`lib/ai/agent-prompt.ts`](lib/ai/agent-prompt.ts) — gesplitste prompts + thread-first user message voor `vat_samen`
- [`components/journal/JournalFlow.tsx`](components/journal/JournalFlow.tsx) — labelweergave via `resolveToolbarActionLabel`
- [`docs/plans/ai-prompt-en-opslag.md`](docs/plans/ai-prompt-en-opslag.md) — documentatie

## Testchecklist

1. Entry met meerdere blokken (schrijven → AI-reactie → verder schrijven).
2. **Vat samen** dekt hele thread; neutraal; lengte past bij omvang.
3. **Geef inzicht** benoemt thema's/emoties/denkpatronen in actief segment.
4. Labels correct na herladen.
