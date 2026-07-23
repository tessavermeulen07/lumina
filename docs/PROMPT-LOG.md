# Prompt log

## Bijlage (inschrijving / oplevering)

Volledige bundeling van alle applicatie-prompts, de samengestelde agent-instructie en Cursor-instructies:

**[`docs/BIJLAGE-PROMPTS-EN-CURSOR-INSTRUCTIES.md`](BIJLAGE-PROMPTS-EN-CURSOR-INSTRUCTIES.md)**

## Plannen

Uitgewerkte implementatieplannen staan in [`docs/plans/`](plans/).

Relevante AI-plannen:

- [`ai-prompt-en-opslag.md`](plans/ai-prompt-en-opslag.md)
- [`fix-entry-themes.md`](plans/fix-entry-themes.md)
- [`lumina-cursor-rules.md`](plans/lumina-cursor-rules.md)

## Runtime-bronnen (code)

| Onderdeel | Pad |
|-----------|-----|
| Agent system + user builders | `src/lib/ai/agent-prompt.ts` |
| Agent runtime | `src/lib/ai/agent.ts` |
| Entry-analyse | `src/lib/ai/analyze-entry.ts` |
| Follow-up / check-in / weekrapport / dashboard-vragen | `src/lib/ai/generate-*.ts`, `get-lumina-dashboard-questions.ts` |
| Tools | `src/lib/ai/tools.ts` |
| Questions seed | `supabase/migrations/20250622000000_questions.sql` |
| Cursor rules | `.cursor/rules/*.mdc` |
