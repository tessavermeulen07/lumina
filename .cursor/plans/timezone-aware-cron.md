---
name: Timezone-aware cron
overview: Maak de check-in cron timezone-aware door per gebruiker een lokale kalenderdag te gebruiken bij het vullen van `intention_checkin_queue`, en lijn popups en reflectie-completion op dezelfde tijdzone-logica uit. Vercel-cron wordt uurlijks i.p.v. één keer per dag om 05:00 UTC.
todos:
  - id: migration-timezone
    content: "Migratie: profiles.timezone met default Europe/Amsterdam + types bijwerken"
    status: completed
  - id: timezone-utils
    content: lib/utils/user-timezone.ts met getDateStringInTimezone en hasPassedTimeInTimezone
    status: completed
  - id: scheduler-refactor
    content: "schedule-due-checkins.ts: per-user localToday, auto-skip en queue rows"
    status: completed
  - id: cron-hourly
    content: vercel.json naar 0 * * * * + README/plan docs updaten
    status: completed
  - id: popup-alignment
    content: Popup + reflection-completion op profile.timezone laten leunen
    status: completed
  - id: settings-timezone
    content: Timezone detectie/opslag in ProfileForm en update-profile
    status: completed
  - id: manual-test
    content: Handmatig testen met curl + afwijkende timezone in Supabase
    status: completed
isProject: false
---

# Plan: timezone-aware cron voor doelen-check-ins

## Status: geïmplementeerd

Zie [`lib/utils/user-timezone.ts`](../../lib/utils/user-timezone.ts), [`lib/habits/schedule-due-checkins.ts`](../../lib/habits/schedule-due-checkins.ts) en migratie [`supabase/migrations/20260713130000_profile_timezone.sql`](../../supabase/migrations/20260713130000_profile_timezone.sql).

## Doelarchitectuur

```mermaid
flowchart LR
  HourlyCron["Vercel cron elk uur"]
  Route["GET /api/cron/check-ins"]
  Scheduler["scheduleDueCheckinsForToday"]
  Profiles["profiles.timezone"]
  Queue["intention_checkin_queue"]
  Popup["getPendingPopup"]
  HourlyCron --> Route --> Scheduler
  Profiles --> Scheduler
  Scheduler -->|"due_for_date per user local day"| Queue
  Profiles --> Popup
  Queue --> Popup
```

**Kernprincipe:** `due_for_date` = kalenderdag in de timezone van de gebruiker. Cron draait **uurlijks** en is **idempotent**.

## Handmatig testen

1. Draai migratie `20260713130000_profile_timezone.sql` op Supabase.
2. Zet een testprofiel op `America/Los_Angeles`.
3. Trigger cron: `curl -sS -H "Authorization: Bearer <CRON_SECRET>" https://<domein>/api/cron/check-ins`
4. Controleer `intention_checkin_queue.due_for_date` = lokale LA-datum.
5. Herhaal run → `duplicatesSkipped` stijgt, geen dubbele rijen.

## Eindopdracht-formulering

"Intenties met timezone-aware, getimede in-app check-ins en een uurlijkse productie-scheduler."
