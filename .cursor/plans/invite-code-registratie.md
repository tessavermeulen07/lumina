# Plan: gedeelde invite-code voor registratie (optie 1)

**Status:** geïmplementeerd

Zie volledige documentatie: [`docs/plans/invite-code-registratie.md`](../../docs/plans/invite-code-registratie.md)

## Samenvatting

- Env var: `REGISTRATION_INVITE_CODE` (server-only, lokaal + Vercel)
- Validatie: `lib/auth/register.ts` → `validateRegistrationInviteCode`
- API: `app/api/auth/register/route.ts` vóór `createUser`
- UI: uitnodigingscode-veld in `RegisterCard.tsx`, prefill via `?code=`

## Belangrijk

- Variabele heet **`REGISTRATION_INVITE_CODE`**, niet `SUPABASE_INVITE_CODE`.
- Zonder env var: registratie geblokkeerd (503).
- Na env-wijziging: dev-server herstarten / Vercel redeployen.
