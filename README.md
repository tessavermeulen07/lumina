This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment variables

Kopieer `.env.example` naar `.env.local` en vul je waarden in.

## Check-in scheduler (timezone-aware)

- Cron route: `/api/cron/check-ins`
- Vereiste env vars: `CRON_SECRET` + `SUPABASE_SECRET_KEY` (of `SUPABASE_SERVICE_ROLE_KEY`) + `NEXT_PUBLIC_SUPABASE_URL`
- Autorisatie: `Authorization: Bearer <CRON_SECRET>` of header `x-cron-secret`
- Vercel cron: geconfigureerd in `vercel.json` met dagelijks schema `0 5 * * *` (05:00 UTC; Hobby-planlimiet)
- Middleware laat `/api/cron/*` door; beveiliging loopt via `CRON_SECRET` (niet via login)

Deze job zet due doelen automatisch in de in-app check-in inbox (`intention_checkin_queue`), met `due_for_date` op de lokale kalenderdag van elke gebruiker (`profiles.timezone`). Popups en reflectie-completion gebruiken dezelfde tijdzone. Geen push of e-mail in deze fase.

**Hybrid scheduling:** het app-layout roept bij elk paginabezoek dezelfde scheduler aan (`ensureDueCheckins`), zodat actieve gebruikers check-ins krijgen op hun lokale dag zonder uurlijkse cron (niet beschikbaar op Vercel Hobby). De dagelijkse cron is een vangnet voor inactieve gebruikers. Vereist `SUPABASE_SERVICE_ROLE_KEY` (of `SUPABASE_SECRET_KEY`) in productie én `.env.local`; `CRON_SECRET` is lokaal optioneel (alleen nodig voor handmatige curl-test van de cron-route).

**Migratie:** draai `supabase/migrations/20260713130000_profile_timezone.sql` voor het `timezone`-veld op profielen.

**Let op:** als een gebruiker zijn tijdzone wijzigt, blijven bestaande queue-rijen op de oude `due_for_date` staan.

### Productie-checklist (Vercel)

1. Zet in **Production** environment variables:
   - `CRON_SECRET` — genereer met `openssl rand -base64 32`
   - `SUPABASE_SECRET_KEY` of `SUPABASE_SERVICE_ROLE_KEY` — zelfde project als `NEXT_PUBLIC_SUPABASE_URL`
2. **Redeploy** production na env-wijzigingen.
3. Test handmatig:

```bash
curl -sS -H "Authorization: Bearer <CRON_SECRET>" \
  "https://<jouw-productie-domein>/api/cron/check-ins"
```

Verwacht `200` met `{ "success": true, ... }`. Bij ontbrekende `CRON_SECRET`: `503`. Bij verkeerd geheim: `401`.

Zie ook [`.cursor/plans/productie-cron-scheduler.md`](.cursor/plans/productie-cron-scheduler.md) en [`.cursor/plans/timezone-aware-cron.md`](.cursor/plans/timezone-aware-cron.md).
