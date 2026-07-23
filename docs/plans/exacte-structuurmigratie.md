---
name: Exacte structuurmigratie
overview: Lumina heringedeeld naar voorbeeldstructuur met src/, components/ui|layout|features, hooks en types.
todos:
  - id: move-code-to-src
    content: Verplaats app-, component- en lib-code naar src/
    status: completed
  - id: regroup-components
    content: Herstructureer componenten naar ui, layout en features
    status: completed
  - id: extract-types-hooks
    content: Verplaats types naar src/types en hooks naar src/hooks
    status: completed
  - id: repair-imports
    content: Werk tsconfig alias en imports bij
    status: completed
  - id: align-docs-rules
    content: Docs en Cursor-structuur afgestemd op voorbeeld
    status: completed
  - id: verify-migration
    content: Controleer routes, middleware, imports en build
    status: completed
isProject: true
---

# Exacte structuurmigratie naar voorbeeldindeling

Zie dit document voor de volledige specificatie.

## Nieuwe structuur

```
src/
  app/
  components/
    ui/
    layout/
    features/
  hooks/
  lib/
  types/
  middleware.ts
```

Historische plannen in `docs/plans/` zijn bijgewerkt naar deze paden.
