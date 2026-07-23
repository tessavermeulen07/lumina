# Responsive verbeteringen — tablet

Plan geïmplementeerd op basis van responsive_tablet_plan.

## Aanpak
- **Tablet-range:** 768px – 1023px
- **Navigatie:** hamburger-drawer tot `lg` (1024px)
- **Typografie:** tussenlaag (17px body) tussen mobiel en desktop
- **Layout:** dashboard- en hero-grids vanaf `md` in twee kolommen
- **Scope:** app + marketing

## Bestanden
- `src/app/globals.css` — tablet typografie-tokens
- Nav-componenten — breakpoints `md` → `lg`
- Dashboard-grids — `lg:grid-cols-2` → `md:grid-cols-2`
- `marketing/Hero.tsx` — twee kolommen vanaf `md`
- Fine-tuning: greeting, carousel-kaarten, layout-padding
