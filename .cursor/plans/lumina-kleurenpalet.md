---
name: Lumina Kleurenpalet
overview: Definieer het blauw-groen accentpalet als CSS-variabelen in globals.css, wijs elke tint een UI-rol toe (primair, secundair, interactie, highlight), kies neutrale achtergrond- en tekstkleuren die het palet ondersteunen, en documenteer alles in tailwind-styling.mdc.
todos:
  - id: globals-css-tokens
    content: Accent- en neutral-tokens toevoegen in app/globals.css (@theme inline + dark mode)
    status: completed
  - id: tailwind-rule-colors
    content: Kleurenpalet-sectie toevoegen aan .cursor/rules/tailwind-styling.mdc
    status: completed
  - id: project-rule-ref
    content: Korte visuele-identiteit regel in .cursor/rules/lumina-project.mdc
    status: completed
  - id: cleanup-page-colors
    content: Hardcoded zinc/black kleuren in app/page.tsx vervangen door semantische tokens
    status: completed
  - id: save-plan
    content: Plan opslaan in .cursor/plans/lumina-kleurenpalet.md
    status: completed
isProject: true
---

# Lumina kleurenpalet — plan

## Het palet

| Token | Hex | Karakter |
|-------|-----|----------|
| `lumina-900` | `#04316D` | Diep navy — autoriteit, focus |
| `lumina-700` | `#265973` | Teal-blauw — secundair, diepte |
| `lumina-500` | `#47827A` | Gedempt groen — interactie, borders |
| `lumina-300` | `#69AA80` | Saliegroen — positief, selected |
| `lumina-100` | `#8AD286` | Mint — lichte accenten, glow |

## Aanbevolen achtergrond- en tekstkleuren

### Light mode

| Rol | Kleur |
|-----|-------|
| Achtergrond | `#F7FAF8` |
| Surface | `#FFFFFF` |
| Tekst primair | `#04316D` |
| Tekst secundair | `#47827A` |

### Dark mode

| Rol | Kleur |
|-----|-------|
| Achtergrond | `#032A5A` |
| Surface | `#04316D` |
| Tekst primair | `#EAF5ED` |
| Tekst secundair | `#69AA80` |

## Gebruik per accent

- **lumina-900** — koppen, primary buttons, links, focus ring
- **lumina-700** — hover states, outline buttons, borders (dark)
- **lumina-500** — input borders, iconen, tags, muted tekst (light)
- **lumina-300** — selected states, success, secundaire tekst (dark)
- **lumina-100** — badges, focus glow, subtiele highlights (~5% UI)

## Regel: 80/15/5

80% neutrals, 15% lumina-900/700, 5% lumina-300/100.

## Rules

- Detail: [`.cursor/rules/tailwind-styling.mdc`](../rules/tailwind-styling.mdc)
- Verwijzing: [`.cursor/rules/lumina-project.mdc`](../rules/lumina-project.mdc)

## Verwacht resultaat

Consistent kleursysteem via CSS-variabelen en Tailwind-classes (`bg-lumina-900`, `text-muted`, etc.).
