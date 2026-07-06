---
name: Intenties gewoonte-tracker
overview: Voltooi de intenties- en gewoonte-tracker door `habit_logs` te activeren, een check-in flow (voltooid/overgeslagen/schrijven) op `/vandaag` te bouwen, AI-prompts te genereren, en habit vs intention in de UI te ondersteunen. E-mailherinneringen blijven een aparte latere fase.
todos:
  - id: due-status-logging
    content: "lib/habits: get-intention-due-status, get-due-intention-checkins, log-intention-checkin + Goal type uitbreiden"
    status: completed
  - id: ai-prompts
    content: lib/ai/generate-intention-checkin.ts + cache via dashboard_reflection_cache
    status: completed
  - id: checkin-ui
    content: IntentionCheckInSection + IntentionCheckInCard op /vandaag (Gedaan/Overgeslagen/Schrijf erover)
    status: completed
  - id: habit-type-ui
    content: "AddGoalModal + GoalsSection: intentie vs gewoonte toggle, type-badge, save/list generaliseren"
    status: completed
  - id: schrijf-flow
    content: /schrijf?intentie= + WritingArea intentionId + finalize-entry koppeling naar habit_logs
    status: completed
  - id: email-later
    content: (Later) Profiel-migratie + Resend + cron route voor e-mailherinneringen
    status: pending
isProject: true
---

# Intenties & gewoonte-tracker afmaken

## Huidige stand

| Onderdeel | Status |
|-----------|--------|
| CRUD intenties op `/vandaag` | Werkt via `GoalsSection.tsx` + `lib/habits/*` |
| Schema `habits_and_intentions` + `habit_logs` + RLS | Klaar in `20250615000000_initial_schema.sql` |
| `habit_logs` in app | **Niet gebruikt** |
| `ai_checkin_prompt` | **Niet gebruikt** |
| `type: habit \| intention` | Alleen `intention` wordt geschreven |
| Ochtend/avond reflectie-check-ins | **Apart** — `CheckInCard`, `entries.reflection_period` |

**Belangrijk:** geen `reflection_period` hergebruiken voor intenties; alles loopt via `habit_logs`.

## Fase 1 — Data-laag

- `get-intention-due-status.ts` — due-logica per frequency
- `log-intention-checkin.ts` — insert in `habit_logs`
- `Goal` type uitbreiden met `HabitType`

## Fase 2 — AI prompts

- `generate-intention-checkin.ts` — one-shot OpenAI + fallback
- Cache via `dashboard_reflection_cache` (`intention_prompt:{habitId}`)

## Fase 3 — UI

- `IntentionCheckInSection` + `IntentionCheckInCard` op `/vandaag`
- `AddGoalModal` + `GoalsSection`: intentie vs gewoonte

## Fase 4 — Schrijf-flow

- `/schrijf?intentie={habitId}`
- `finalize-entry` → `habit_logs`

## Fase 5 — E-mail (later)

Zie `vier-kernfeatures-afmaken.md`.
