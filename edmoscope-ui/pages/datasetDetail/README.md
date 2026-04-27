# Dataset Detail Page — Implementation Notes

## Primitives used

| Primitive | Used in | Notes |
|-----------|---------|-------|
| `Badge` | All tabs | Status chips, tier labels, permission badges |
| `Button` | Page header | "Open in SQL" (brand variant), "Cite this dataset" (secondary) |
| `Breadcrumb` | Page header | Data Assets › Layer › Title |
| `TierBadge` | Page header | Bronze/Silver/Gold layer indicator with tooltip |
| `DataTable` | UnderstandTab (schema), QualityTab (column signals) | Generic typed table |
| `Notice` | UnderstandTab (decision shortcut), ProvenanceTab (primary source banner) | Inline callout |

## Primitives missing / substituted

### Tabs (active styling)
**Required**: Brand-red active state (`border-b-[3px] border-lux-red`) with italic serif numerals (`i. ii. iii.`).  
**Issue**: `Tabs.Tab` has hardcoded `border-b-2 border-b-odm-ink` for the active state — neither the colour nor the 3px width can be overridden via props.  
**Substitution**: Custom tab buttons with direct state management (`useState<TabId>`). `Tabs.Panel` was not used; conditional rendering is used instead. The same ARIA attributes (`role="tab"`, `aria-selected`, `aria-controls`) are present on the custom buttons.  
**Recommendation**: Add a `variant` or `activeClassName` prop to `Tabs.Tab`, or expose a `renderTab` render-prop so consumers can supply their own button element while preserving the context-driven panel system.

### Full-width clearance banner (Rights tab)
**Required**: A full-width coloured alert block (green/amber/red) with an icon slot and prose.  
**Issue**: `Notice` renders as a left-border callout, not a full-width banner.  
**Substitution**: Bespoke `ClearanceBanner` component using Tailwind semantic colour tokens directly. It deliberately uses the same token names (`odm-ok-bg`, `odm-warn-bg`, `odm-bad-bg`) as `Notice` so it looks coherent.  
**Recommendation**: Add a `banner` variant to `Notice` that uses a full-colour background and horizontal layout instead of a left border.

### Syntax-highlighted SQL block (Access tab)
**Required**: Dark background SQL block with syntax colouring.  
**Issue**: No syntax highlighting library available (constraint: no external UI libraries).  
**Substitution**: Dark `bg-odm-ink` code panel with `text-odm-ok` (green) monospace text, no per-token colouring. Functionally correct; visually minimal.  
**Recommendation**: The host app can wrap the canonical query text in a lightweight tokeniser (e.g. `prism-react-renderer`) since that is a utility library, not a UI component library.

### Lineage graph (Provenance tab)
**Required**: Horizontal three-zone arrow diagram.  
**Issue**: No graph/diagram primitive exists.  
**Substitution**: Flex layout with three zones (upstream · current · downstream) connected by Unicode arrow glyphs (`→`) styled with `text-odm-line-h`. Structurally faithful to the spec; not an SVG flow graph.  
**Recommendation**: A future `LineageGraph` primitive would benefit from SVG arrows (with arrowhead markers) and collapsible intermediate steps.

### `ProvenanceCard` (not used)
The existing `ProvenanceCard` primitive was considered for the Provenance tab's event rows, but the required chip-row layout (activity kind badge + summary text + attribution + timestamp in a compact list) is closer to a simple `<li>` pattern than the card's header/description/panels structure. Using `ProvenanceCard` would add unnecessary nesting. Not a gap — just a design decision.

---

## Type model: fields to add to the backend schema

These fields exist in `types/dataset.ts` and are populated in the fixture but have no counterpart in the current PostgreSQL schema. They should be added before the page is wired to real API data.

| Field | Table | Type | Notes |
|-------|-------|------|-------|
| `Caveat.kind` | `caveats` | `ENUM('meaning', 'fitness')` | Separates Understand caveats from Quality known issues |
| `Caveat.crossReferenceTab` | `caveats` | `ENUM('understand', 'quality') NULLABLE` | Drives the cross-tab display and link |
| `KnownIssue.crossReferenceTab` | `known_issues` | `ENUM('understand', 'quality') NULLABLE` | Same purpose for quality issues |
| `Dataset.totalDisseminationCount` | `datasets` | `INTEGER` | Total count; disseminations[] is a recent subset |
| `SavedQuery.sql` | `saved_queries` | `TEXT` | Full SQL text (may already exist; confirm column name) |
| `SavedQuery.note` | `saved_queries` | `TEXT NULLABLE` | Canonical query caption shown on the Access tab |

`ColumnDef` (from the original brief) was renamed `SchemaColumn` in this implementation to avoid collision with DataTable's generic `ColumnDef<T>` utility type. The backend column name can remain `column_def` or `schema_column` — either works as long as the API serialisation maps to the `SchemaColumn` TypeScript type.

---

## Open editorial questions

### 1. Canonical query note placement
The brief asks for a caption below the canonical SQL block. Two candidate locations were considered:
- `Distribution.canonicalQueryNote` — attached to the file format, not the query
- `SavedQuery.note` — attached to the query itself ✓ (chosen)

`SavedQuery.note` is the correct home because the note explains the *query pattern* (why `quality_flag = 'ok'`, why `vehicle_class <> 'unknown'`), not the distribution format. The `note` field is only rendered when `isCanonical === true`.

### 2. Data fetching: TanStack Query v5
The brief specifies TanStack Query v5. This implementation uses a lightweight internal hook (`useDatasetQuery`) that replicates the `{ status, data, error, isPending }` shape. The host app should replace the hook body with a real `useQuery` call:

```ts
import { useQuery } from '@tanstack/react-query';
// inside useDatasetQuery:
return useQuery({ queryKey: ['dataset', id], queryFn: () => fetchDataset(id) });
```

No other changes to the page are required.

### 3. Cross-reference caveats (Understand ↔ Quality)
The spec requires that the "weekend rule" caveat appears on **both** the Understand caveats panel and the Quality known issues card, with each cross-referencing the other. This is implemented via:
- `Caveat.crossReferenceTab === 'quality'` → renders in Understand with a "(see Quality)" link
- `KnownIssue.crossReferenceTab === 'understand'` → renders in Quality with a cross-reference note

This is correct per the editorial rules ("same fact, different framing across tabs is correct, not a bug"). However, the current fixture has the Gasperich gap issue (`issue-1`) with `crossReferenceTab: 'understand'`, but the corresponding meaning caveat is not in the fixture's caveats array. This is intentional — the coverage gap is a fitness issue only; the meaning register does not need a duplicate. The weekend rule is the only true cross-listed item.

### 4. `outputs` layer and TierBadge
The `DatasetLayer` type includes `'outputs'` as a valid layer. `TierBadge` only accepts `'bronze' | 'silver' | 'gold'`. The page header falls back to a plain `Badge variant="default"` when `layer === 'outputs'`. If OdM adds an Outputs tier to the medallion system, `TierBadge` and `tokens.ts` should be updated together.
