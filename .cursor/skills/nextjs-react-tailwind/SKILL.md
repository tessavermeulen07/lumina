---
name: nextjs-react-tailwind
description: Assist with building and reviewing Next.js (App Router) React applications styled with Tailwind CSS. Use when the user mentions Next.js, React components, pages, layouts, API routes, data fetching, or Tailwind utility classes.
---

# Next.js + React + Tailwind

This skill helps design, scaffold, and review Next.js applications that use React components and Tailwind CSS, focusing on clear structure and idiomatic usage rather than opinionated design systems.

## When to Apply This Skill

Use these instructions when:

- The project uses **Next.js** (prefer App Router `app/` when both `app/` and `pages/` exist).
- The user asks for **React components**, **pages**, **layouts**, **API routes**, or **data fetching** patterns.
- The user wants **Tailwind CSS** utility-based styling (including responsive and dark mode variants).
- The user asks to **review** or **refactor** existing Next.js/React/Tailwind code.

If the user explicitly requests a different stack or styling system, do not apply this skill.

## General Principles

- **Follow official patterns**: Default to patterns from the current Next.js and Tailwind docs.
- **Keep defaults minimal**: Avoid inventing heavy design systems; provide small, composable building blocks.
- **Prioritize clarity**: Prefer readable JSX and Tailwind classes grouped logically.
- **Avoid unnecessary abstraction**: Only introduce extra components or hooks when there is clear reuse or complexity.
- **Respect project conventions**: If the repository already has established patterns (e.g. `ui/` components, custom `Button`), reuse them instead of creating new ones.

## Project Detection

Before applying patterns:

1. **Check Next.js version and structure**
   - If there is an `app/` directory, assume **App Router** and use:
     - `app/layout.tsx` / `app/page.tsx`
     - Route segments like `app/(marketing)/page.tsx`, `app/dashboard/page.tsx`
     - `app/api/.../route.ts` for API routes.
   - If only `pages/` exists, use **Pages Router** patterns:
     - `pages/index.tsx`, `pages/api/...`.

2. **Check Tailwind setup**
   - Look for `tailwind.config.js` or `tailwind.config.ts`.
   - Respect configured theme extensions (colors, fonts, spacing) instead of inventing new arbitrary values when possible.

## Scaffolding UI: Components, Pages, Layouts

When generating new components or pages:

- **Use functional components** with hooks.
- Prefer **TypeScript** if the project already uses it; otherwise use JavaScript.
- Use **server components** by default in the App Router, and **client components** only when needed (state, effects, browser APIs, event handlers).
- Keep Tailwind class lists ordered roughly as:
  - Layout (flex, grid, spacing, width/height)
  - Typography (text size, weight, color)
  - Decoration (borders, background, shadows, rounding)
  - State/responsive variants (`hover:`, `focus:`, `md:`, `lg:`, `dark:`).

### Component Guidelines

- Co-locate reusable UI components under a `components/` or `app/(...) /_components/` directory when that pattern exists.
- Accept props that are:
  - **Semantic** (`variant`, `size`, `intent`) instead of raw class strings, when an existing pattern uses that style.
  - **Optional** and sensible by default.
- Use Tailwind for layout and visual styles instead of inline styles, unless dealing with dynamic values not easily expressed as classes.

### Page and Layout Guidelines

- Keep page components focused on:
  - Data fetching (if server-side).
  - Wiring up major layout components.
  - High-level structure (sections, main content blocks).
- Move complex presentational details into smaller components to keep pages readable.

## Data Fetching & API Routes

When the user asks for fullstack patterns:

- In **App Router**:
  - Prefer **Server Components** + async data fetching where possible.
  - Use **Route Handlers** in `app/api/.../route.ts` for backend logic.
  - Use **Server Actions** when the project already uses them and they fit the use case (form submissions, mutations).
- In **Pages Router**:
  - Use `getServerSideProps`, `getStaticProps`, or `getStaticPaths` according to official recommendations.
  - Keep data-fetching logic in separate helpers or services when it becomes complex.

When suggesting code, keep environment-specific secrets and URLs in environment variables rather than hardcoding them.

## Tailwind Usage Guidelines

- Use **utility-first** styling; avoid writing custom CSS unless:
  - The project already uses component-level CSS (e.g. CSS Modules), or
  - A style cannot be expressed cleanly with Tailwind utilities.
- Prefer **semantic Tailwind tokens** from the project config (e.g. `text-primary`, `bg-muted`) over raw values, when they exist.
- For responsive design:
  - Start with a **mobile-first** base.
  - Add `sm:`, `md:`, `lg:`, `xl:` overrides only where needed.
- For dark mode:
  - Respect how the project configures dark mode (`class` vs `media`).
  - Use `dark:` variants instead of duplicating components.

## Reviewing Existing Code

When asked to review Next.js/React/Tailwind code:

1. **Check correctness and behavior**
   - Ensure components render safely on server and client.
   - Confirm hooks are used only in client components.
   - Verify data-fetching logic matches Next.js best practices.

2. **Check structure**
   - Components are small and focused.
   - Shared patterns are extracted where appropriate.
   - File locations respect existing conventions (`app/`, `components/`, `lib/`, `hooks/`, etc.).

3. **Check Tailwind usage**
   - Class lists are not excessively long; consider extracting reusable components or using `clsx`/`cn` helpers when patterns repeat.
   - Colors and spacing align with the configured design tokens.

4. **Check accessibility**
   - Use semantic HTML elements (`button`, `nav`, `main`, `section`, `form`).
   - Ensure interactive elements are keyboard accessible and have appropriate `aria-` attributes when needed.

Provide feedback in clear, prioritized bullets (e.g. “critical”, “improvement”, “nice to have”) instead of long paragraphs.

## Output Style and Examples

When generating code:

- **Match the project’s existing style**:
  - If the project uses named exports, continue that pattern.
  - If there is a `cn` helper for Tailwind classes, use it.
  - Follow existing folder naming (e.g. `ui/`, `components/`, `features/`).
- Keep examples **concise** and focused on the user’s request.
- Avoid generating boilerplate not directly related to the question unless the user asked for a full scaffold (e.g. entire page layout).

When unsure between multiple valid approaches, briefly state the default choice and why, and prefer the simpler, more standard option.

