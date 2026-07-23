# Wachtwoord reset flow

## Overzicht

Implementeer de volledige Supabase wachtwoord-resetflow (vergeten → e-mail → nieuw wachtwoord) en voeg wachtwoord wijzigen toe in instellingen, in lijn met bestaande auth-patronen en Nederlandse UI-copy.

## Todos

- [x] `src/lib/auth/password.ts` met validatePassword en passwordsMatch
- [x] ForgotPasswordCard + wachtwoord-vergeten pagina met resetPasswordForEmail
- [x] auth/callback uitbreiden met next-param en foutafhandeling
- [x] ResetPasswordCard + /wachtwoord-wijzigen pagina met updateUser
- [x] ChangePasswordSection in ProfileForm (huidig + nieuw wachtwoord)
- [x] FooterGate + supabase/config.toml redirect URLs
- [ ] Lokaal testen via Inbucket en instellingen-flow verifiëren

## Huidige situatie

De basis staat al, maar de functionaliteit ontbreekt:

| Onderdeel | Status |
|-----------|--------|
| Link "Wachtwoord vergeten?" in [`LoginCard`](src/components/features/auth/LoginCard.tsx) | Klaar |
| Route `/wachtwoord-vergeten` in [`src/middleware.ts`](../../src/middleware.ts) | Klaar |
| Placeholder-pagina [`src/app/wachtwoord-vergeten/page.tsx`](src/app/wachtwoord-vergeten/page.tsx) | Vervangen door ForgotPasswordCard |
| Auth callback [`src/app/auth/callback/route.ts`](src/app/auth/callback/route.ts) | Uitgebreid met next-param |
| Instellingen [`ProfileForm`](src/components/features/settings/ProfileForm.tsx) | ChangePasswordSection toegevoegd |

## Gewenste flows

```mermaid
sequenceDiagram
    participant User
    participant ForgotPage as wachtwoord-vergeten
    participant Supabase
    participant Callback as auth/callback
    participant ResetPage as wachtwoord-wijzigen
    participant App as vandaag

    User->>ForgotPage: Vult e-mail in
    ForgotPage->>Supabase: resetPasswordForEmail
    Supabase->>User: Reset-e-mail
    User->>Callback: Klikt link met code
    Callback->>Supabase: exchangeCodeForSession
    Callback->>ResetPage: Redirect met sessie
    User->>ResetPage: Nieuw wachtwoord
    ResetPage->>Supabase: updateUser password
    ResetPage->>App: Redirect na succes
```

```mermaid
sequenceDiagram
    participant User
    participant Settings as instellingen
    participant Supabase

    User->>Settings: Huidig + nieuw wachtwoord
    Settings->>Supabase: signInWithPassword huidig
    Settings->>Supabase: updateUser nieuw
    Settings->>User: Bevestiging
```

## Implementatiestappen

### 1. Gedeelde wachtwoordvalidatie

[`src/lib/auth/password.ts`](src/lib/auth/password.ts):

- `validatePassword(password: string): string | null` — minimaal 8 tekens
- `passwordsMatch(a: string, b: string): boolean`

### 2. Wachtwoord vergeten

[`src/components/features/auth/ForgotPasswordCard.tsx`](src/components/features/auth/ForgotPasswordCard.tsx) + [`src/app/wachtwoord-vergeten/page.tsx`](src/app/wachtwoord-vergeten/page.tsx)

### 3. Auth callback

[`src/app/auth/callback/route.ts`](src/app/auth/callback/route.ts) — next-param, foutafhandeling

### 4. Nieuw wachtwoord instellen

[`src/components/features/auth/ResetPasswordCard.tsx`](src/components/features/auth/ResetPasswordCard.tsx) + [`src/app/wachtwoord-wijzigen/page.tsx`](src/app/wachtwoord-wijzigen/page.tsx)

### 5. Wachtwoord wijzigen in instellingen

[`src/components/features/settings/ChangePasswordSection.tsx`](src/components/features/settings/ChangePasswordSection.tsx) in ProfileForm

### 6. Supabase-configuratie

Lokaal: [`supabase/config.toml`](../../supabase/config.toml) — redirect URLs

Productie: Supabase Dashboard → Authentication → URL Configuration

## Bestandenoverzicht

| Actie | Bestand |
|-------|---------|
| Nieuw | `src/lib/auth/password.ts` |
| Nieuw | `src/components/features/auth/ForgotPasswordCard.tsx` |
| Nieuw | `src/components/features/auth/ResetPasswordCard.tsx` |
| Nieuw | `src/components/features/settings/ChangePasswordSection.tsx` |
| Nieuw | `src/app/wachtwoord-wijzigen/page.tsx` |
| Wijzig | `src/app/wachtwoord-vergeten/page.tsx` |
| Wijzig | `src/app/auth/callback/route.ts` |
| Wijzig | `src/components/features/settings/ProfileForm.tsx` |
| Wijzig | `src/components/layout/FooterGate.tsx` |
| Wijzig | `supabase/config.toml` |

## Testplan

1. Lokaal forgot-flow via Inbucket
2. Verlopen link → foutmelding
3. Instellingen: wachtwoord wijzigen
4. Middleware: `/wachtwoord-wijzigen` zonder sessie → `/inloggen`
5. Productie: redirect URLs in Supabase dashboard

## Buiten scope

- OAuth / magic link
- Custom HTML e-mailtemplates in de repo
- Wachtwoordsterkte-meter bovenop 8 tekens
