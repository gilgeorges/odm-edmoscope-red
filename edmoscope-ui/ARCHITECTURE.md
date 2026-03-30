# EDMoScope UI — Architecture

## 1. Purpose

`edmoscope-ui` is the shared React component library for **EDMoScope** — the data catalogue application of the **Observatoire digital de la Mobilité (OdM)**, built for the Ministère de la Mobilité et des Travaux publics (MMTP) in Luxembourg.

The library is maintained in its own git repository and consumed by the EDMoScope main application via a **git submodule**. It may also be consumed by future OdM projects.

**Why a submodule?** The main EDMoScope application lives on a company GitLab instance that is unreachable by AI tooling. This library is the **only place where Claude can assist**. By keeping it self-contained and maximally documented, a solo developer can work confidently on the main app — consuming well-typed, well-documented components — without needing AI assistance for every integration decision.

---

## 2. Folder structure

```
edmoscope-ui/
├── ARCHITECTURE.md        — this file
├── package.json           — dev dependencies only; NO build script
├── tsconfig.json          — strict TypeScript config
├── tailwind.config.ts     — brand token extension of Tailwind's default palette
├── tokens.ts              — brand tokens as TypeScript constants (mirrors tailwind.config.ts)
├── catalogue/
│   ├── Catalogue.tsx      — living component catalogue (all components + variants)
│   ├── main.tsx           — Vite entry point for `npx vite catalogue/`
│   └── index.html         — minimal HTML shell for catalogue preview
└── src/
    ├── index.ts           — barrel export — every public component and type
    ├── primitives/        — atoms with no dependencies on other library components
    │   ├── Badge.tsx      — status / type / tier pill
    │   ├── Button.tsx     — primary interactive control
    │   ├── Icon.tsx       — accessible Unicode / symbol icon wrapper
    │   ├── Spinner.tsx    — animated loading ring
    │   └── Tooltip.tsx    — hover/focus tooltip
    ├── typography/
    │   ├── Heading.tsx    — h1–h4 + Eyebrow section label
    │   └── Label.tsx      — form field / metadata key label
    ├── layout/
    │   ├── AppShell.tsx   — sticky header + primary nav bar + main + drawer slot
    │   ├── PageHeader.tsx — section label + h1 + subtitle + action slot
    │   ├── Section.tsx    — content section with eyebrow + right-slot
    │   └── Divider.tsx    — horizontal rule
    ├── navigation/
    │   ├── TopBar.tsx     — white bar with logo slot, action slot, lux-red bottom border
    │   │                    Also exports: IDMLogo, LuxLion, UserChip
    │   ├── Sidebar.tsx    — collapsible left nav panel + SidebarItem
    │   ├── SidebarItem.tsx — re-export shim (imports from Sidebar.tsx)
    │   └── Breadcrumb.tsx — back link + crumb chain
    ├── feedback/
    │   ├── EmptyState.tsx — list/table zero-state placeholder
    │   ├── ErrorBoundary.tsx — React class error boundary, compact + full-page modes
    │   └── Toast.tsx      — ToastProvider context + useToast hook
    ├── forms/
    │   ├── Input.tsx      — single-line text input + Textarea
    │   ├── Select.tsx     — styled dropdown select
    │   ├── SearchBox.tsx  — inline search field with clear button
    │   └── FilterBar.tsx  — horizontal strip of search / select / toggle filters
    ├── data/
    │   ├── DataTable.tsx  — generic typed table with optional row-click + empty state
    │   ├── MetadataList.tsx — key-value grid (view + edit modes)
    │   ├── StatCard.tsx   — KPI numeral block + StatRow
    │   └── TierBadge.tsx  — bronze/silver/gold medallion tier indicator
    └── overlays/
        ├── Modal.tsx      — compound component: Modal + Modal.Header + Modal.Body + Modal.Footer
        ├── Drawer.tsx     — compound component: Drawer + Drawer.Header + Drawer.Body + Drawer.Footer
        └── ConfirmDialog.tsx — pre-composed Modal for confirmation prompts
```

---

## 3. Design token contract

There are **two token files** that must always be kept in sync:

| File | Purpose | Consumer |
|------|---------|----------|
| `tailwind.config.ts` | Defines `lux-*` and `odm-*` colour keys in the Tailwind theme | Tailwind's JIT compiler; used in component `className` strings |
| `tokens.ts` | Exports the same values as TypeScript constants | JavaScript logic — chart colour series, dynamic computations, canvas rendering |

**Rule:** any change to a colour value requires updating **both** files. The colour names must match (camelCase in `tokens.ts` → kebab-case in Tailwind).

### Example pairing

```ts
// tailwind.config.ts
"lux-red": "#C7001E",

// tokens.ts
luxRed: "#C7001E",
```

### Tier colours

`tokens.ts` also exports `TIER_COLORS` — used by `TierBadge` and available for chart series. OdM convention: gold tier uses `lux-red` (brand red = highest prestige), not yellow/gold.

---

## 4. Component conventions

### Variant pattern

Use a `variant` prop (string literal union) for visual variants. Never boolean flags like `isPrimary`:

```tsx
// ✅ correct
<Button variant="primary" />
<Button variant="danger" />

// ❌ wrong
<Button isPrimary />
<Button isDanger />
```

Variant → Tailwind class mappings are defined as a typed `const` object at the top of each component file so they are immediately visible and easy to update.

### Compound components

Overlay components use the compound component pattern via dot notation, which reduces prop surface area and makes structure explicit:

```tsx
<Modal open={open} onClose={close} aria-labelledby="title">
  <Modal.Header id="title" onClose={close}>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={close}>Cancel</Button>
  </Modal.Footer>
</Modal>
```

### Prop spreading

Components that wrap native HTML elements spread remaining props via `React.ComponentPropsWithoutRef<'element'>`. This means you can always pass `aria-*`, `data-*`, event handlers, and other standard HTML attributes without needing explicit prop forwarding.

### Accessibility requirements

Every interactive component must:
- Have correct ARIA roles (`role="dialog"`, `role="tablist"`, etc.)
- Provide `aria-label` or `aria-labelledby` on dialogs and landmark regions
- Be reachable and operable by keyboard (Tab, Enter, Escape, arrow keys where applicable)
- Show a visible focus ring (`focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red`)
- Not rely solely on colour to convey information

Colour contrast rule: never use `lux-red-20` or `lux-gray-20` as foreground text colours — they are background/tint colours only.

---

## 5. How to add a component

1. **Create the file** in the appropriate `src/` subfolder. If no existing folder fits, create a new one and add a description to this file's folder structure table (section 2).
2. **Define a named `Props` interface** (e.g. `MyComponentProps`) — not an anonymous inline type.
3. **Add JSDoc** on the component function and every prop in the interface.
4. **Use the variant pattern** — no boolean flags for visual states.
5. **Export from `src/index.ts`** — add both the component and its Props type.
6. **Add a section to `catalogue/Catalogue.tsx`** with at least 2–3 variants or states rendered.

Quick checklist:
- [ ] Named `Props` interface with JSDoc on every prop
- [ ] No `any`, no inline styles
- [ ] Variant classes defined as a `const` object
- [ ] Accessible (ARIA roles, keyboard nav, focus ring)
- [ ] Exported from `src/index.ts`
- [ ] Catalogue entry added

---

## 6. How to consume this library

### Add as a git submodule

```bash
# Inside the host app repository:
git submodule add https://github.com/gilgeorges/odm-edmoscope-red.git submodules/edmoscope-ui
git submodule update --init --recursive
```

### Tailwind config extension

In the host app's `tailwind.config.ts` (or `tailwind.config.js`), include the library's `content` paths and merge its theme extension:

```ts
// host-app/tailwind.config.ts
import libConfig from "./submodules/edmoscope-ui/tailwind.config.ts";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    // Include library source so Tailwind sees all class names
    "./submodules/edmoscope-ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Merge in all lux-* and odm-* tokens
      ...libConfig.theme?.extend,
    },
  },
};
```

### Path alias in vite.config.ts

```ts
// host-app/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@edmoscope-ui": path.resolve(__dirname, "./submodules/edmoscope-ui/src"),
    },
  },
});
```

### Importing components

```tsx
import { Button, TierBadge, AppShell, useToast } from "@edmoscope-ui";
// or direct imports:
import { Button } from "@edmoscope-ui/primitives/Button";
```

### Providers

Wrap the app root once with `ToastProvider`:

```tsx
// host-app/src/main.tsx
import { ToastProvider } from "@edmoscope-ui";
import { RouterProvider } from "@tanstack/react-router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ToastProvider>
    <RouterProvider router={router} />
  </ToastProvider>
);
```

### Font

The library assumes Montserrat is loaded. Add the Google Fonts link to the host app's `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap">
```

---

## 7. Catalogue

The living catalogue renders every component with its key variants in a single scrollable page.

### Running the catalogue

```bash
# Inside edmoscope-ui/
npx vite catalogue/
```

This starts Vite with `catalogue/` as the root, serving `catalogue/index.html`. No build config needed in the library itself.

### Adding to the catalogue

Open `catalogue/Catalogue.tsx` and add a new `<CatalogueSection>` block:

```tsx
<CatalogueSection title="MyComponent">
  <CatalogueExample label="Default" code={`<MyComponent />`}>
    <MyComponent />
  </CatalogueExample>
  <CatalogueExample label="Variant X" code={`<MyComponent variant="x" />`}>
    <MyComponent variant="x" />
  </CatalogueExample>
</CatalogueSection>
```

Each section should show at least 2–3 meaningful variants or states. The `code` prop renders the JSX snippet beneath each example for easy reference.
