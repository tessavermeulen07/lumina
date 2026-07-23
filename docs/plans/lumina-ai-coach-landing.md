---
name: AI Coach Landing Section
overview: Add a dedicated AI-coach section to the landing page (copy + placeholder illustration) explaining that Lumina reads journal entries and offers summaries and perspective — plus light updates to Hero, FeatureGrid, and nav. UI/marketing only; no AI backend.
todos:
  - id: ai-coach-illustration
    content: Create AiCoachIllustration.tsx placeholder SVG
    status: completed
  - id: ai-coach-section
    content: Create AiCoachSection.tsx with Dutch copy and two-column layout
    status: completed
  - id: wire-page
    content: Wire AiCoachSection into src/app/(marketing)/page.tsx
    status: completed
  - id: update-existing
    content: Update Hero, FeatureGrid, and Header with AI-coach references
    status: completed
  - id: save-plan
    content: Save plan to docs/plans/lumina-ai-coach-landing.md
    status: completed
isProject: true
---

# AI-coach section on landing page — plan

## Goal

Visitors understand that Lumina includes an **AI-coach** that **reads reflection entries** and helps gain insight — marketing copy only, no AI implementation.

## Page flow

Hero → **AI-coach section** → Over ons → FeatureGrid (4 cards) → Prijzen

## New components

- [`src/components/features/marketing/AiCoachIllustration.tsx`](src/components/features/marketing/AiCoachIllustration.tsx) — placeholder SVG
- [`src/components/features/marketing/AiCoachSection.tsx`](src/components/features/marketing/AiCoachSection.tsx) — `#ai-coach`, two columns

## Updates

- [`Hero.tsx`](src/components/features/marketing/Hero.tsx) — AI mention in subtext, Bekijk meer → `#ai-coach`
- [`FeatureGrid.tsx`](src/components/features/marketing/FeatureGrid.tsx) — AI-coach as first card, 2×2 grid
- [`Header.tsx`](src/components/features/marketing/Header.tsx) — nav link AI-coach → `#ai-coach`
- [`page.tsx`](src/app/(marketing)/page.tsx) — wire AiCoachSection after Hero

## Scope

Marketing UI only — no LLM, API routes, or `src/lib/ai/`.

## Status

Implemented. Verified with `npm run build`.
