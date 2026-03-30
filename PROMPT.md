# EDMoScope UI Library — Creation Prompt

This document records the exact prompt used to scaffold the `edmoscope-ui` component library.
It is stored here so both the developer and any future AI session can understand:

1. **What was built** and why
2. **The design decisions** encoded in the library
3. **How to continue** this work in a future session by saying "see PROMPT.md"

---

## Context

You are refactoring a monolithic JSX design template (`odm-template.jsx`) into a
reusable, well-documented React component library for **EDMoScope** — the data catalogue
application of the **Observatoire digital de la Mobilité (OdM)**, built for the Ministère de la Mobilité et des Travaux publics (MMTP) in Luxembourg.

The library will be:
- Maintained in its **own git repository**, added as a **git submodule** inside the main
  EDMoScope app repo (and potentially other future projects)
- Consumed by a Vite + React 19 app using TanStack Router and TanStack Query, fed by PostgREST
- The **only place where Claude can assist** — the main app lives on a company GitLab
  unreachable by AI tooling, so this library must be maximally self-documenting and
  its API surface must be obvious to a solo developer working without AI assistance

---

## Output: Repository Structure

```
edmoscope-ui/
├── ARCHITECTURE.md
├── package.json                    # dev dependencies only (TypeScript, Tailwind, React types)
├── tsconfig.json
├── tailwind.config.ts
├── tokens.ts                       # brand tokens as JS/TS constants
├── catalogue/
│   └── Catalogue.tsx               # living component catalogue (all components + variants)
└── src/
    ├── index.ts                    # barrel export — every public component
    ├── primitives/                 # atoms: no dependencies on other components
    │   ├── Badge.tsx
    │   ├── Button.tsx
    │   ├── Icon.tsx
    │   ├── Spinner.tsx
    │   └── Tooltip.tsx
    ├── typography/
    │   ├── Heading.tsx
    │   └── Label.tsx
    ├── layout/
    │   ├── AppShell.tsx            # top nav + sidebar + main content area
    │   ├── PageHeader.tsx
    │   ├── Section.tsx
    │   └── Divider.tsx
    ├── navigation/
    │   ├── Sidebar.tsx
    │   ├── SidebarItem.tsx
    │   ├── TopBar.tsx
    │   └── Breadcrumb.tsx
    ├── feedback/
    │   ├── EmptyState.tsx
    │   ├── ErrorBoundary.tsx
    │   └── Toast.tsx
    ├── forms/
    │   ├── Input.tsx
    │   ├── Select.tsx
    │   ├── SearchBox.tsx
    │   └── FilterBar.tsx
    ├── data/
    │   ├── DataTable.tsx
    │   ├── MetadataList.tsx        # key-value pair display
    │   ├── StatCard.tsx
    │   └── TierBadge.tsx           # bronze/silver/gold medallion tier indicator
    └── overlays/
        ├── Modal.tsx
        ├── Drawer.tsx
        └── ConfirmDialog.tsx
```

---

## Technology Constraints

- **React 19** (use the new compiler-friendly patterns; avoid legacy patterns like
  `forwardRef` where React 19 makes them unnecessary)
- **TypeScript strict mode** — `"strict": true` in tsconfig, no `any`, explicit return types
  on all components and hooks
- **Tailwind CSS v4** — all styling via Tailwind utility classes only; no inline styles,
  no CSS modules, no CSS files
- **No external UI component libraries** (no shadcn, no Radix, no Headless UI, etc.)
- **No inline styles** — not a single `style={{}}` prop anywhere in the output
- Peer dependencies only: `react`, `react-dom`, `tailwindcss` — keep `package.json` lean
- `package.json` should have **no build script** — this library is consumed as a git submodule
  directly by the host app's Vite instance, which handles all transpilation

---

## Design Tokens

### tailwind.config.ts

Extend the Tailwind theme with the following brand tokens:

```ts
colors: {
  'lux-red':        '#C7001E',
  'lux-red-60':     '#DF6678',
  'lux-red-20':     '#F4D0D5',
  'lux-gray':       '#5A5A59',
  'lux-gray-60':    '#A3A3A2',
  'lux-gray-20':    '#DEDEDE',
  'lux-gold':       '#9A8150',
  'lux-gold-50':    '#CCC0A7',
  'lux-silver':     '#8E9091',
  'lux-silver-50':  '#C6C8C8',
}

fontFamily: {
  sans: ['Montserrat', 'sans-serif'],
}
```

### tokens.ts

```ts
export const COLORS = {
  luxRed:      '#C7001E',
  luxRed60:    '#DF6678',
  luxRed20:    '#F4D0D5',
  luxGray:     '#5A5A59',
  luxGray60:   '#A3A3A2',
  luxGray20:   '#DEDEDE',
  luxGold:     '#9A8150',
  luxGold50:   '#CCC0A7',
  luxSilver:   '#8E9091',
  luxSilver50: '#C6C8C8',
} as const

export const TIER_COLORS = {
  bronze: COLORS.luxGold,
  silver: COLORS.luxSilver,
  gold:   COLORS.luxRed,   // OdM convention: gold tier uses brand red
} as const
```

---

## Component Rules

- Every component must have a named, exported `Props` interface with JSDoc on every prop
- Optional props use destructuring defaults, not `defaultProps`
- Native-element wrappers spread `React.ComponentPropsWithoutRef<'element'>`
- Use the compound component pattern (dot notation) for overlays
- `variant` prop (string literal union) for visual variants — never boolean flags
- Variant → Tailwind class mappings as a `const` object inside each file
- Every interactive component must have correct ARIA roles, focus management, keyboard nav
- Do not use `lux-red-20` or `lux-gray-20` as text colours (contrast)

---

## Source Template

The source template is `odm-template.jsx` in the root of this repository.
It is a 5288-line monolithic JSX file containing all components with inline styles.
The library was scaffolded by reading this file and extracting components into the
appropriate folders with Tailwind classes replacing all inline styles.

---

## How to continue this work

In a new Claude Code session, say:

> "Continue building the EDMoScope UI library. Read PROMPT.md and ARCHITECTURE.md first."

Claude will read these files, understand the full context, and be able to:
- Add new components following the established conventions
- Fix bugs or inconsistencies
- Extend the catalogue
- Update the tokens if the brand palette changes

---

## Session information

- **Date created:** 2026-03-30
- **Git branch:** `claude/edmoscope-ui-library-6GFaG`
- **Repository:** `gilgeorges/odm-edmoscope-red`
- **Source template:** `odm-template.jsx` (5288 lines, inline styles, React with `sx()` helper)
