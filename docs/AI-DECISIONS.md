# AI & architectuurbeslissingen

## Structuur: `src/`-indeling (juli 2026)

**Beslissing:** Applicatiecode verplaatst van projectroot naar `src/`, conform school-/template-structuur.

**Motivatie:** Duidelijke scheiding tussen app-code en configuratie; componenten gegroepeerd als `ui`, `layout` en `features`.

**Gevolgen:**

- `@/*` alias wijst naar `./src/*` in `tsconfig.json`
- Types in `src/types/` (niet meer `src/types/`)
- Custom hooks in `src/hooks/` (uit `src/lib/queries/use-*.ts`)
- Feature-componenten onder `src/components/features/<domein>/`
- `src/proxy.ts` (Next.js 16: `middleware` is hernoemd naar `proxy`)

**Behouden buiten `src/`:** `supabase/`, `public/`, `scripts/`, `.cursor/`, `.agents/skills/`

## Entry-analyse thema's

**Beslissing:** AI-prompt gebruikt `{ "name": "..." }` voor themes; label-helper leest ook legacy keys (`theme`, `thema`).

Zie [`docs/plans/fix-entry-themes.md`](plans/fix-entry-themes.md).
