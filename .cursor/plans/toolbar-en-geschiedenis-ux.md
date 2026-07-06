---
name: Toolbar en geschiedenis UX
overview: Week-navigatie fix, schrijfbalk-herontwerp, delete-bevestiging, bookmark-pagina (/bewaard), en privé entries met wachtwoordbeveiliging.
status: implemented
---

# Toolbar, geschiedenis en entry-acties

Zie agent-plan voor volledige specificatie. Geïmplementeerd in deze sessie.

## Opgeloste onderdelen

1. **Week-navigatie** — `resolveWeekNavigation` toont `›` wanneer niet op kalender-huidige week
2. **Schrijfbalk** — flat layout: AI, stijl, afbeelding, bookmark, privé, delete, groene opslaan-knop; groene terug-knop in subpanels
3. **Delete** — `ConfirmDialog` met bevestiging
4. **Bookmark** — persistentie op `entries`, pagina `/bewaard`, nav-link in `AppNav`
5. **Privé** — wachtwoord via scrypt, unlock-dialoog, afgeschermde cards in geschiedenis/inzichten/bewaard

## Belangrijke bestanden

- `lib/insights/week-navigation.ts`
- `components/journal/WritingToolbar.tsx`
- `components/ui/ConfirmDialog.tsx`
- `components/journal/SetPrivateDialog.tsx`
- `components/journal/UnlockPrivateEntryDialog.tsx`
- `lib/entries/toggle-entry-flags.ts`
- `lib/entries/unlock-private-entry.ts`
- `app/(app)/bewaard/page.tsx`
- `supabase/migrations/20250706100000_entry_bookmark_private.sql`
