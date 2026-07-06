# Responsive verbeteringen — app en marketing

Plan geïmplementeerd op basis van responsive_mobiel_plan.

## Aanpak
- **Scope:** ingelogde app + marketing
- **Navigatie:** hamburger met drawer onder `md` (768px)
- **Typografie:** verlaagde `--text-*` tokens op mobiel + expliciete responsive classes op kernschermen

## Bestanden
- `app/globals.css` — mobiele typografie-tokens
- `components/ui/NavDrawer.tsx` — herbruikbare drawer
- `lib/nav/app-nav-items.ts` — gedeelde nav-config
- `components/app/AppMobileNav.tsx` — app drawer
- `components/marketing/MarketingMobileNav.tsx` — marketing drawer
- Header-, dashboard- en journal-componenten — responsive aanpassingen
