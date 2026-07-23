---
name: Typography +2px
overview: Verhoog alle Tailwind lettergroottes met exact 2px via centrale `@theme`-overrides in globals.css.
todos:
  - id: theme-font-sizes
    content: Voeg --text-xs t/m --text-6xl (+2px) toe aan @theme inline in globals.css
    status: completed
  - id: body-font-size
    content: Zet body font-size op var(--text-base) voor inherit-tekst
    status: completed
  - id: update-rule
    content: Documenteer type scale in tailwind-styling.mdc
    status: completed
  - id: verify
    content: Build verifiëren met npm run build
    status: completed
isProject: true
---

# Typografie +2px

Alle `--text-*` tokens in `src/app/globals.css` zijn +2px t.o.v. Tailwind defaults. Body erft `var(--text-base)` (18px).

| Class | Grootte |
|-------|---------|
| text-sm | 16px |
| text-base | 18px |
| text-lg | 20px |
| text-xl | 22px |
| text-2xl | 26px |
| text-3xl | 32px |
| text-4xl | 38px |
| text-5xl | 50px |
| text-6xl | 62px |

Geen component-wijzigingen nodig — classes blijven hetzelfde.
