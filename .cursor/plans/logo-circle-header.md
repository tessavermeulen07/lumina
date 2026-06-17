---
name: Logo circle header
overview: Vervang het SVG-icoon in de gedeelde Logo-component door public/logo-lumina-circle.png, zodat app- en marketing-header het cirkel-logo tonen naast Lumina.
todos:
  - id: update-logo
    content: "Logo.tsx: SVG vervangen door /logo-lumina-circle.png via next/image"
    status: completed
---

# Logo-lumina-circle in header

## Situatie

- Asset: `public/logo-lumina-circle.png`
- `components/ui/Logo.tsx` — gedeeld door AppHeader en marketing Header

## Wijziging

`Logo.tsx` gebruikt `next/image` met `/logo-lumina-circle.png` (32×32, `h-8 w-8`).

## Buiten scope

- Favicon of `logo-lumina-square.png`
