# CLAUDE.md — EDMoScope UI Library

This file is read automatically by Claude Code at the start of every session.
It gives Claude the context needed to work on this repository without the developer
having to re-explain the project each time.

---

## What this repo is

`edmoscope-ui` is a React component library for **EDMoScope** — the data catalogue of the
Observatoire digital de la Mobilité (OdM), Luxembourg. It lives here as a standalone
repo and is consumed by the main EDMoScope app (on a private company GitLab) via a
**git submodule**.

**This repo is the only place Claude can help.** The main app is unreachable by AI
tooling, so this library must be self-contained, well-typed, and obvious to consume.

Full creation story and architectural rationale: `PROMPT.md` (repo root).
Full architectural guide: `edmoscope-ui/ARCHITECTURE.md`.

---

## Active branch

Always develop on `claude/edmoscope-ui-library-6GFaG` and push there.
Never push to `main` without explicit permission.

---

## Tech stack

| Concern | Choice |
|---------|--------|
| Framework | React 19 |
| Language | TypeScript strict (`"strict": true`, no `any`) |
| Styling | Tailwind CSS v4 — utility classes only, **no inline styles** |
| Build | None (consumed as submodule by host app's Vite) |
| Catalogue preview | `npm run catalogue` inside `edmoscope-ui/` |
| Catalogue build | `npm run build:catalogue` → `catalogue/dist/` |
| Catalogue live URL | https://gilgeorges.github.io/odm-edmoscope-red/ (GitHub Pages, auto-deployed) |

---

## Non-negotiable rules

1. **No inline styles** — not a single `style={{}}` prop anywhere.
2. **No `any`** — TypeScript strict mode; explicit return types on all components.
3. **No external UI libraries** — no shadcn, Radix, Headless UI, etc.
4. **Variant pattern** — `variant="primary"` not `isPrimary`. Map variants to Tailwind classes via a `const` object at the top of the file.
5. **Named Props interfaces** — `ButtonProps`, `TierBadgeProps`, etc. Never anonymous inline types.
6. **JSDoc on everything** — every exported component function and every prop in its Props interface.
7. **Token sync** — when changing a colour, update both `tailwind.config.ts` AND `tokens.ts`.

---

## Source of truth for design

The original monolithic template is `odm-template.jsx` (5 288 lines, root of repo).
It uses inline styles via a `TOKENS` object and an `sx()` helper. When extracting or
updating a component:
- Replace inline styles with Tailwind `lux-*` / `odm-*` classes
- Preserve the visual design exactly — spacing, shadow, border radius
- Replace hardcoded data with typed props

---

## Adding a component — checklist

1. Create file in the right `edmoscope-ui/src/<folder>/` subfolder
2. Named `Props` interface with JSDoc on every prop
3. Variant → Tailwind class mapping as a `const` object (if variants exist)
4. Correct ARIA roles + keyboard nav + visible focus ring (`focus-visible:outline-2 focus-visible:outline-lux-red`)
5. Export component + Props type from `edmoscope-ui/src/index.ts`
6. Add a `<CatalogueSection>` to `edmoscope-ui/catalogue/Catalogue.tsx` (≥ 2 variants)

---

## Catalogue purpose

`catalogue/Catalogue.tsx` is a **component showcase**, not a full app demo.
Each section shows one component in isolation with its key variants and a
JSX code snippet. Run it with `npx vite catalogue/` from inside `edmoscope-ui/`.

It is intentionally different from the default export demo in `odm-template.jsx`
(which shows a full working app screen). The catalogue focuses on individual
component API surfaces so a developer can quickly see what props produce what output.

---

## Commit convention

- Prefix: `feat:` for new components, `fix:` for bugs, `docs:` for documentation only
- Keep commit messages descriptive but concise
- Always push to `claude/edmoscope-ui-library-6GFaG` after significant changes
