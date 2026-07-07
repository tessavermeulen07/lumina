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

## Dagelijkse check-in scheduler

- Cron route: `/api/cron/check-ins`
- Vereiste env var: `CRON_SECRET`
- Autorisatie: `Authorization: Bearer <CRON_SECRET>` of header `x-cron-secret`
- Vercel cron: geconfigureerd in `vercel.json` met dagelijks schema `0 5 * * *`

Deze job zet due doelen automatisch in de in-app check-in inbox (`intention_checkin_queue`), zodat gebruikers zonder handmatige actie nieuwe check-ins zien in `vandaag`.

In development roept het app-layout dezelfde scheduler automatisch aan bij elk paginabezoek (`ensureDueCheckins`), zodat je lokaal geen cron hoeft te triggeren. Vereist `SUPABASE_SERVICE_ROLE_KEY` (of `SUPABASE_SECRET_KEY`) in `.env.local`.
