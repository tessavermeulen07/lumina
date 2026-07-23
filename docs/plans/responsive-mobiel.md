# Responsive verbeteringen — app en marketing

Plan geïmplementeerd op basis van responsive_mobiel_plan.

## Aanpak
- **Scope:** ingelogde app + marketing
- **Navigatie:** hamburger met drawer onder `md` (768px)
- **Typografie:** verlaagde `--text-*` tokens op mobiel + expliciete responsive classes op kernschermen

## Bestanden
- `src/app/globals.css` — mobiele typografie-tokens
- `src/components/ui/NavDrawer.tsx` — herbruikbare drawer
- `src/lib/nav/app-nav-items.ts` — gedeelde nav-config
- `src/components/layout/AppMobileNav.tsx` — app drawer
- `src/components/features/marketing/MarketingMobileNav.tsx` — marketing drawer
- Header-, dashboard- en journal-componenten — responsive aanpassingen
