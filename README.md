# EDMoScope UI

Design primitives and interface components for **EDMoScope** — the internal data catalogue of the [Observatoire digital de la Mobilité (OdM)](https://odm.public.lu), operated by the Institut du développement municipal (IDM) for the Ministère de la Mobilité et des Travaux publics, Luxembourg.

**→ [Live component catalogue](https://odm-edmoscope.netlify.app)**

---

## What this is

This repository contains the `edmoscope-ui` component library: a set of React components, layout primitives, and form widgets used to build EDMoScope. It is maintained here as a standalone package and consumed by the main application via a git submodule.

The library is for **internal use within OdM projects**. It is public for transparency and to allow submodule consumption, not as a general-purpose design system.

---

## Tech stack

| | |
|---|---|
| Framework | React 19 |
| Language | TypeScript (strict mode — no `any`) |
| Styling | Tailwind CSS v4 — utility classes only, no CSS-in-JS |
| Build | Vite 6 (catalogue only; library is consumed source-first via submodule) |
| Fonts | Montserrat (Luxembourg government identity) |

No external UI component libraries (no shadcn, Radix, Headless UI, etc.). All components are purpose-built to match the OdM visual identity.

---

## Components

| Group | Components |
|---|---|
| Primitives | Badge, Button, Icon, Spinner, Tooltip |
| Typography | Heading, Eyebrow, Label |
| Layout | AppShell, PageHeader, Section, Divider |
| Navigation | TopBar, IDMLogo, Sidebar, Breadcrumb |
| Feedback | EmptyState, ErrorBoundary, Toast |
| Forms | Input, Select, SearchBox, FilterBar |
| Data | DataTable, MetadataList, StatCard, TierBadge |
| Overlays | Modal, Drawer, ConfirmDialog |

---

## Using as a submodule

```bash
git submodule add https://github.com/gilgeorges/odm-edmoscope-red.git submodules/edmoscope-ui
git submodule update --init --recursive
```

See [`edmoscope-ui/ARCHITECTURE.md`](edmoscope-ui/ARCHITECTURE.md) for Tailwind config merging, Vite path alias setup, and the full integration guide.

---

## Running the catalogue locally

```bash
cd edmoscope-ui
npm install
npm run catalogue     # dev server at localhost:5173
```
