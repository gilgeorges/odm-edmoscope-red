/**
 * EDMoScope UI — Living Component Catalogue
 *
 * Run with:  npx vite catalogue/
 *
 * Every public component is rendered here with its key variants and states.
 * Each section corresponds to one component. A code snippet beneath each
 * variant shows the props used to produce it.
 *
 * To add a new component: follow the pattern below — add a <CatalogueSection>
 * with at least 2–3 <CatalogueExample> entries.
 */

import React, { useState } from "react";

import {
  // Primitives
  Badge, Button, Icon, Spinner, Tooltip,
  // Typography
  Heading, Eyebrow, Label,
  // Layout
  AppShell, PageHeader, Section, Divider, TopNavShell,
  // Navigation
  TopBar, IDMLogo, UserChip, Sidebar, SidebarItem, NavTab, Breadcrumb, GlobalSearch,
  // Feedback
  EmptyState, ErrorBoundary, ToastProvider, useToast,
  // Forms
  Input, Textarea, Select, SearchBox, FilterBar,
  // Data
  DataTable, MetadataList, StatCard, StatRow, TierBadge, SqlWorkbench,
  // Overlays
  Modal, Drawer, ConfirmDialog,
  // Tokens
  COLORS,
} from "../src/index.ts";

import type { ColumnDef, FilterDefinition } from "../src/index.ts";

/* ─────────────────────────────────────────────────────────────────────────────
   Catalogue shell components
───────────────────────────────────────────────────────────────────────────── */

function CatalogueShell({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div style={{ fontFamily: "Montserrat, sans-serif", background: "#EFEFED", minHeight: "100vh", color: "#1A1A1A" }}>
      {/* Header */}
      <div style={{ background: "#1A1A1A", borderBottom: `3px solid ${COLORS.luxRed}`, padding: "16px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>
            EDMoScope UI
          </div>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Component Catalogue
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 36px 80px" }}>
        {children}
      </div>
    </div>
  );
}

function CatalogueSection({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div style={{ marginBottom: 56 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 16, marginBottom: 20,
        paddingBottom: 12, borderBottom: "2px solid #D0D0CC",
      }}>
        <h2 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 18, fontWeight: 700, margin: 0, color: "#1A1A1A" }}>
          {title}
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {children}
      </div>
    </div>
  );
}

function CatalogueExample({ label, code, children, bg = "white" }: {
  label: string;
  code: string;
  children: React.ReactNode;
  bg?: string;
}): React.ReactElement {
  return (
    <div>
      <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#909090", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ background: bg, border: "1px solid #D0D0CC", padding: 24, marginBottom: 8 }}>
        {children}
      </div>
      <pre style={{
        fontFamily: '"SF Mono", "Fira Code", monospace', fontSize: 11,
        background: "#1A1A1A", color: "rgba(255,255,255,0.7)",
        padding: "10px 14px", margin: 0, overflowX: "auto",
        lineHeight: 1.6,
      }}>{code}</pre>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Toast trigger helper (needs to be inside ToastProvider)
───────────────────────────────────────────────────────────────────────────── */
function GlobalSearchDemo(): React.ReactElement {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const DEMO_RESULTS = query.length >= 2 ? [
    { label: "Datasets · 2", results: [
      { id: "DS-001", title: "MobiScout Count Data", subtitle: "MobiScout AG · Source", icon: "▣" },
      { id: "DS-002", title: "SEBES Traffic Counts", subtitle: "SEBES · Source",        icon: "▣" },
    ]},
    { label: "Actors · 1", results: [
      { id: "AC-007", title: "Julie Schmit", subtitle: "Data steward", icon: "◎" },
    ]},
  ] : [];
  return (
    <GlobalSearch
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => { setOpen(false); setQuery(""); }}
      query={query}
      onQueryChange={setQuery}
      results={DEMO_RESULTS}
      onSelect={r => alert(`Selected: ${r.title}`)}
      placeholder="Search datasets, actors…"
    />
  );
}

function ToastDemo(): React.ReactElement {
  const { toast } = useToast();
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button variant="secondary" size="sm" onClick={() => toast.success("Saved", "Changes have been persisted.")}>
        success
      </Button>
      <Button variant="secondary" size="sm" onClick={() => toast.error("Error", "Something went wrong.")}>
        error
      </Button>
      <Button variant="secondary" size="sm" onClick={() => toast.warn("Warning", "The file exceeds the recommended size.")}>
        warn
      </Button>
      <Button variant="secondary" size="sm" onClick={() => toast.info("Info", "The catalogue was last updated 2 hours ago.")}>
        info
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sample data
───────────────────────────────────────────────────────────────────────────── */
type SampleRow = { id: string; name: string; tier: "bronze" | "silver" | "gold"; source: string };

const SAMPLE_DATA: SampleRow[] = [
  { id: "DS-001", name: "MobiScout Count Data",    tier: "gold",   source: "MobiScout" },
  { id: "DS-002", name: "SEBES Traffic Counts",    tier: "silver", source: "SEBES" },
  { id: "DS-003", name: "Raw ANPR Readings",       tier: "bronze", source: "CITA" },
];

const SAMPLE_COLUMNS: ColumnDef<SampleRow>[] = [
  { key: "id",     header: "ID",   cellClassName: "font-mono text-[11px] text-odm-muted" },
  { key: "name",   header: "Name", render: (r) => <strong>{r.name}</strong> },
  { key: "tier",   header: "Tier", render: (r) => <TierBadge tier={r.tier} /> },
  { key: "source", header: "Source" },
];

const SAMPLE_FILTERS: FilterDefinition[] = [
  { key: "q",     type: "search", label: "Search",     placeholder: "Filter assets…" },
  { key: "tier",  type: "select", label: "Tier",
    options: [{ value: "bronze", label: "Bronze" }, { value: "silver", label: "Silver" }, { value: "gold", label: "Gold" }] },
  { key: "fresh", type: "toggle", label: "Current only" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   SqlWorkbench demo section
───────────────────────────────────────────────────────────────────────────── */
type SqlResultRow = { id: string; name: string; count: number; updated: string };

const SQL_RESULT_COLUMNS: ColumnDef<SqlResultRow>[] = [
  { key: "id",      header: "ID",      cellClassName: "font-mono text-[11px] text-odm-muted" },
  { key: "name",    header: "Dataset"  },
  { key: "count",   header: "Rows",    cellClassName: "tabular-nums" },
  { key: "updated", header: "Updated"  },
];

const SQL_RESULT_DATA: SqlResultRow[] = [
  { id: "DS-001", name: "MobiScout Count Data",    count: 14_820, updated: "2026-03-28" },
  { id: "DS-002", name: "SEBES Traffic Counts",    count:  3_410, updated: "2026-03-25" },
  { id: "DS-003", name: "Raw ANPR Readings",       count: 97_003, updated: "2026-03-30" },
];

function SqlWorkbenchSection(): React.ReactElement {
  const [results, setResults] = useState<SqlResultRow[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  function handleRun(_sql: string, _name: string): void {
    setResults(undefined);
    setLoading(true);
    // Simulate async query
    setTimeout(() => {
      setLoading(false);
      setResults(SQL_RESULT_DATA);
    }, 1200);
  }

  return (
    <CatalogueSection title="SqlWorkbench">
      <CatalogueExample
        label="Collapsed (default state)"
        code={`<SqlWorkbench
  defaultQueryName="Top datasets"
  defaultSql="SELECT * FROM datasets LIMIT 20"
  onRun={(sql, name) => fetchResults(sql)}
/>`}
        bg="#EFEFED"
      >
        <SqlWorkbench
          defaultQueryName="Top datasets"
          defaultSql="SELECT * FROM datasets LIMIT 20"
          onRun={() => undefined}
        />
      </CatalogueExample>

      <CatalogueExample
        label="Open state — editor visible"
        code={`<SqlWorkbench
  defaultState="open"
  defaultQueryName="Count by tier"
  defaultSql="SELECT tier, COUNT(*) AS n&#10;FROM datasets&#10;GROUP BY tier"
  onRun={(sql, name) => fetchResults(sql)}
  resultColumns={cols}
  resultData={rows}
  loading={isLoading}
/>`}
        bg="#EFEFED"
      >
        <SqlWorkbench
          defaultState="open"
          defaultQueryName="Count by tier"
          defaultSql={"SELECT tier, COUNT(*) AS n\nFROM datasets\nGROUP BY tier"}
          onRun={handleRun}
          resultColumns={SQL_RESULT_COLUMNS as ColumnDef<Record<string, unknown>>[]}
          resultData={results as Record<string, unknown>[] | undefined}
          loading={loading}
        />
      </CatalogueExample>
    </CatalogueSection>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Catalogue component
───────────────────────────────────────────────────────────────────────────── */
export default function Catalogue(): React.ReactElement {
  const [modalOpen, setModalOpen]     = useState(false);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [inputVal, setInputVal]       = useState("");
  const [searchVal, setSearchVal]     = useState("");

  return (
    <ToastProvider>
      <CatalogueShell>

        {/* ── Primitives: Badge ─────────────────────────────────────────── */}
        <CatalogueSection title="Badge">
          <CatalogueExample label="All variants" code={`<Badge variant="default">Default</Badge>
<Badge variant="ok">Saved</Badge>
<Badge variant="warn">Draft</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="brand">Brand</Badge>`}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge variant="default">Default</Badge>
              <Badge variant="ok">Saved</Badge>
              <Badge variant="warn">Draft</Badge>
              <Badge variant="danger">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="brand">Brand</Badge>
            </div>
          </CatalogueExample>
          <CatalogueExample label="As status labels" code={`<Badge variant="ok">Implemented</Badge>
<Badge variant="warn">Draft</Badge>
<Badge variant="default">Archived</Badge>`}>
            <div style={{ display: "flex", gap: 8 }}>
              <Badge variant="ok">Implemented</Badge>
              <Badge variant="warn">Draft</Badge>
              <Badge variant="default">Archived</Badge>
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Primitives: Button ────────────────────────────────────────── */}
        <CatalogueSection title="Button">
          <CatalogueExample label="All variants" code={`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="brand">Brand</Button>`}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="brand">Brand</Button>
            </div>
          </CatalogueExample>
          <CatalogueExample label="Sizes" code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </CatalogueExample>
          <CatalogueExample label="Disabled" code={`<Button disabled>Disabled</Button>`} bg="#EFEFED">
            <Button disabled>Disabled</Button>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Primitives: Spinner ───────────────────────────────────────── */}
        <CatalogueSection title="Spinner">
          <CatalogueExample label="Sizes and variants" code={`<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
<Spinner variant="brand" />
<Spinner variant="white" label="Loading datasets…" />`}>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner variant="brand" size="md" />
              <span style={{ background: "#1A1A1A", padding: 8, display: "inline-flex" }}>
                <Spinner variant="white" size="md" />
              </span>
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Primitives: Tooltip ───────────────────────────────────────── */}
        <CatalogueSection title="Tooltip">
          <CatalogueExample label="Placements" code={`<Tooltip text="Top tooltip" placement="top">
  <Button variant="secondary">Hover me (top)</Button>
</Tooltip>`}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", padding: "32px 0" }}>
              <Tooltip text="Tooltip on top" placement="top">
                <Button variant="secondary">Top</Button>
              </Tooltip>
              <Tooltip text="Tooltip on bottom" placement="bottom">
                <Button variant="secondary">Bottom</Button>
              </Tooltip>
              <Tooltip text="Tooltip on left" placement="left">
                <Button variant="secondary">Left</Button>
              </Tooltip>
              <Tooltip text="Tooltip on right" placement="right">
                <Button variant="secondary">Right</Button>
              </Tooltip>
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Typography ────────────────────────────────────────────────── */}
        <CatalogueSection title="Heading + Eyebrow">
          <CatalogueExample label="Heading levels" code={`<Heading level={1}>H1 — Data Assets</Heading>
<Heading level={2}>H2 — Overview</Heading>
<Heading level={3}>H3 — Schema</Heading>
<Heading level={4}>H4 — Field notes</Heading>`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Heading level={1}>H1 — Data Assets</Heading>
              <Heading level={2}>H2 — Overview</Heading>
              <Heading level={3}>H3 — Schema</Heading>
              <Heading level={4}>H4 — Field notes</Heading>
            </div>
          </CatalogueExample>
          <CatalogueExample label="Eyebrow + Heading" code={`<Eyebrow>Data Assets</Eyebrow>
<Heading level={2}>MobiScout Count Data</Heading>`}>
            <div>
              <Eyebrow>Data Assets</Eyebrow>
              <Heading level={2}>MobiScout Count Data</Heading>
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Typography: Label ─────────────────────────────────────────── */}
        <CatalogueSection title="Label">
          <CatalogueExample label="Form label variants" code={`<Label htmlFor="f1">Asset title</Label>
<Label htmlFor="f2" required>Source (required)</Label>
<Label htmlFor="f3" error>Organisation (error)</Label>`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <Label htmlFor="f1">Asset title</Label>
                <Input id="f1" placeholder="Enter title" value="" onChange={() => undefined} />
              </div>
              <div>
                <Label htmlFor="f2" required>Source</Label>
                <Input id="f2" placeholder="Enter source" value="" onChange={() => undefined} />
              </div>
              <div>
                <Label htmlFor="f3" error>Organisation</Label>
                <Input id="f3" error placeholder="Enter organisation" value="" onChange={() => undefined} />
              </div>
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Layout: PageHeader ────────────────────────────────────────── */}
        <CatalogueSection title="PageHeader">
          <CatalogueExample label="With section + subtitle + action" code={`<PageHeader
  section="Data Assets"
  title="MobiScout Count Data"
  sub="Urban mobility measurement — source layer"
  right={<Button variant="brand">Register asset</Button>}
/>`}>
            <PageHeader
              section="Data Assets"
              title="MobiScout Count Data"
              sub="Urban mobility measurement — source layer"
              right={<Button variant="brand">Register asset</Button>}
            />
          </CatalogueExample>
          <CatalogueExample label="Title only" code={`<PageHeader title="Queries" />`}>
            <PageHeader title="Queries" />
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Layout: Section ───────────────────────────────────────────── */}
        <CatalogueSection title="Section">
          <CatalogueExample label="With eyebrow and right slot" code={`<Section eyebrow="Schema" right={<Button variant="ghost" size="sm">Edit</Button>}>
  <p style={{margin:0}}>Content goes here…</p>
</Section>`}>
            <Section eyebrow="Schema" right={<Button variant="ghost" size="sm">Edit</Button>}>
              <p style={{ margin: 0, fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#606060" }}>
                Section content goes here.
              </p>
            </Section>
          </CatalogueExample>
          <CatalogueExample label="Without eyebrow" code={`<Section>…</Section>`}>
            <Section>
              <p style={{ margin: 0, fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#606060" }}>
                Section without eyebrow.
              </p>
            </Section>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Navigation: Breadcrumb ────────────────────────────────────── */}
        <CatalogueSection title="Breadcrumb">
          <CatalogueExample label="Full chain" code={`<Breadcrumb items={[
  { label: "Datasets", onClick: () => {} },
  { label: "MobiScout Count Data", id: "DS-001" },
]} />`}>
            <Breadcrumb items={[
              { label: "Datasets", onClick: () => undefined },
              { label: "MobiScout Count Data", id: "DS-001" },
            ]} />
          </CatalogueExample>
          <CatalogueExample label="Single level" code={`<Breadcrumb items={[{ label: "Datasets" }]} />`}>
            <Breadcrumb items={[{ label: "Datasets" }]} />
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Navigation: Sidebar ───────────────────────────────────────── */}
        <CatalogueSection title="Sidebar + SidebarItem">
          <CatalogueExample label="With active state and badges" code={`<Sidebar header="Navigation">
  <SidebarItem label="All Assets" icon="▤" isActive />
  <SidebarItem label="Datasets"   icon="▣" badge={<Badge variant="default">42</Badge>} />
  <SidebarItem label="Queries"    icon="⌕" />
</Sidebar>`}>
            <div style={{ width: 240 }}>
              <Sidebar header="Navigation">
                <SidebarItem label="All Assets" icon="▤" isActive onClick={() => undefined} />
                <SidebarItem label="Datasets"   icon="▣" badge={<Badge variant="default">42</Badge>} onClick={() => undefined} />
                <SidebarItem label="Queries"    icon="⌕" onClick={() => undefined} />
              </Sidebar>
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Layout: TopNavShell ──────────────────────────────────────── */}
        <CatalogueSection title="TopNavShell">
          <CatalogueExample
            label="Dark nav bar — tabs + search + right action"
            code={`<TopNavShell
  nav={
    <>
      <NavTab label="Home"    onClick={() => navigate("/")} />
      <NavTab label="Data"    isActive onClick={() => navigate("/data")} />
      <NavTab label="Actors"  onClick={() => navigate("/actors")} />
      <NavTab label="Queries" onClick={() => navigate("/queries")} />
    </>
  }
  search={
    <div className="w-44">
      <GlobalSearch
        open={searchOpen} onOpen={() => setSearchOpen(true)} onClose={() => setSearchOpen(false)}
        query={query} onQueryChange={setQuery} results={results} onSelect={handleSelect}
        placeholder="Search…"
      />
    </div>
  }
  actions={<button className="...">SQL ▼</button>}
>
  <Outlet />
</TopNavShell>`}
          >
            <div style={{ height: 280, overflow: "hidden", border: "1px solid #D0D0CC" }}>
              <TopNavShell
                nav={
                  <>
                    <NavTab label="Home"    onClick={() => undefined} />
                    <NavTab label="Data"    isActive onClick={() => undefined} />
                    <NavTab label="Actors"  onClick={() => undefined} />
                    <NavTab label="Queries" onClick={() => undefined} />
                  </>
                }
                search={
                  <div className="w-44">
                    <GlobalSearch
                      open={false} onOpen={() => undefined} onClose={() => undefined}
                      query="" onQueryChange={() => undefined} results={[]} onSelect={() => undefined}
                      placeholder="Search…"
                    />
                  </div>
                }
                actions={
                  <button className="font-sans text-xs font-semibold text-lux-red bg-odm-ink border border-lux-red/40 px-3 py-1 cursor-pointer hover:border-lux-red transition-colors">
                    SQL ▼
                  </button>
                }
              >
                <div style={{ padding: 32, fontFamily: "Montserrat, sans-serif" }}>
                  <PageHeader section="Data Catalogue · DCAT-AP" title="Data Assets" sub="12 of 12 assets" />
                  <StatRow stats={[{ n: 12, label: "Assets" }, { n: "4", label: "Sources" }]} />
                </div>
              </TopNavShell>
            </div>
          </CatalogueExample>

          <CatalogueExample
            label="Minimal — nav tabs only"
            code={`<TopNavShell
  nav={
    <>
      <NavTab label="Home"    onClick={() => navigate("/")} />
      <NavTab label="Data"    isActive onClick={() => navigate("/data")} />
      <NavTab label="Actors"  onClick={() => navigate("/actors")} />
    </>
  }
>
  <Outlet />
</TopNavShell>`}
          >
            <div style={{ height: 160, overflow: "hidden", border: "1px solid #D0D0CC" }}>
              <TopNavShell
                nav={
                  <>
                    <NavTab label="Home"   onClick={() => undefined} />
                    <NavTab label="Data"   isActive onClick={() => undefined} />
                    <NavTab label="Actors" onClick={() => undefined} />
                  </>
                }
              >
                <div style={{ padding: 24, fontFamily: "Montserrat, sans-serif", color: "#5A5A59", fontSize: 13 }}>
                  Page content area
                </div>
              </TopNavShell>
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Navigation: GlobalSearch ──────────────────────────────────── */}
        <CatalogueSection title="GlobalSearch">
          <CatalogueExample
            label="Trigger button (click to open overlay)"
            code={`const [open, setOpen]   = useState(false);
const [query, setQuery] = useState("");

<GlobalSearch
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => { setOpen(false); setQuery(""); }}
  query={query}
  onQueryChange={setQuery}
  results={[
    { label: "Datasets · 2", results: [
      { id: "DS-001", title: "MobiScout Count Data", subtitle: "MobiScout AG", icon: "▣" },
      { id: "DS-002", title: "SEBES Traffic Counts", subtitle: "SEBES",        icon: "▣" },
    ]},
  ]}
  onSelect={r => console.log(r)}
/>`}
          >
            <GlobalSearchDemo />
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Navigation: TopBar ────────────────────────────────────────── */}
        <CatalogueSection title="TopBar + IDMLogo + UserChip">
          <CatalogueExample label="Full top bar" code={`<TopBar
  logo={<IDMLogo />}
  actions={<UserChip name="Julie Schmit" />}
/>`}>
            <TopBar
              logo={<IDMLogo />}
              actions={<UserChip name="Julie Schmit" />}
            />
          </CatalogueExample>
          <CatalogueExample label="Compact logo" code={`<IDMLogo compact />`}>
            <TopBar logo={<IDMLogo compact />} />
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Feedback: EmptyState ──────────────────────────────────────── */}
        <CatalogueSection title="EmptyState">
          <CatalogueExample label="With action" code={`<EmptyState
  title="No datasets found"
  description="Try adjusting your filters or search query."
  action={<Button variant="brand">Register first asset</Button>}
/>`} bg="#EFEFED">
            <EmptyState
              title="No datasets found"
              description="Try adjusting your filters or search query."
              action={<Button variant="brand">Register first asset</Button>}
            />
          </CatalogueExample>
          <CatalogueExample label="Minimal" code={`<EmptyState title="Nothing here yet" />`} bg="#EFEFED">
            <EmptyState title="Nothing here yet" />
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Feedback: Toast ───────────────────────────────────────────── */}
        <CatalogueSection title="Toast (useToast)">
          <CatalogueExample label="Trigger variants — click each button" code={`const { toast } = useToast();
toast.success("Saved", "Changes have been persisted.");
toast.error("Error", "Something went wrong.");
toast.warn("Warning", "File exceeds recommended size.");
toast.info("Info", "Catalogue last updated 2 hours ago.");`}>
            <ToastDemo />
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Feedback: ErrorBoundary ───────────────────────────────────── */}
        <CatalogueSection title="ErrorBoundary">
          <CatalogueExample label="Compact fallback (rendered directly for demo)" code={`<ErrorBoundary label="Provenance timeline" compact>
  <ComponentThatMightThrow />
</ErrorBoundary>`}>
            {/* Render the compact fallback directly since we can't trigger an error boundary in a demo */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-l-[3px] border-l-odm-bad-bd bg-odm-bad-bg font-sans">
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6B1C10" }}>
                Provenance timeline could not be displayed.
              </span>
              <span style={{ fontSize: 12, color: "#383838", flex: 1 }}>Unexpected null reference</span>
              <button style={{ background: "transparent", border: "1px solid #C09088", fontSize: 11, fontWeight: 600, color: "#6B1C10", padding: "2px 10px", cursor: "pointer" }}>
                Try again
              </button>
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Forms: Input ─────────────────────────────────────────────── */}
        <CatalogueSection title="Input + Textarea">
          <CatalogueExample label="Input states" code={`<Input placeholder="Default input" value={val} onChange={…} />
<Input placeholder="Error state" error value={val} onChange={…} />
<Input placeholder="Disabled" disabled />`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
              <Input
                placeholder="Default input"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
              <Input placeholder="Error state" error value="" onChange={() => undefined} />
              <Input placeholder="Disabled" disabled />
            </div>
          </CatalogueExample>
          <CatalogueExample label="Textarea" code={`<Textarea rows={3} placeholder="Enter description…" />`}>
            <div style={{ maxWidth: 400 }}>
              <Textarea rows={3} placeholder="Enter description…" />
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Forms: Select ─────────────────────────────────────────────── */}
        <CatalogueSection title="Select">
          <CatalogueExample label="With placeholder" code={`<Select
  placeholder="Choose asset type"
  options={[
    { value: "source",    label: "Source" },
    { value: "output",    label: "Output" },
    { value: "dashboard", label: "Dashboard" },
  ]}
  value=""
  onChange={…}
/>`}>
            <div style={{ maxWidth: 300 }}>
              <Select
                placeholder="Choose asset type"
                options={[
                  { value: "source",    label: "Source" },
                  { value: "output",    label: "Output" },
                  { value: "dashboard", label: "Dashboard" },
                ]}
                value=""
                onChange={() => undefined}
              />
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Forms: SearchBox ─────────────────────────────────────────── */}
        <CatalogueSection title="SearchBox">
          <CatalogueExample label="Controlled search field" code={`<SearchBox
  value={query}
  onChange={setQuery}
  placeholder="Filter datasets…"
/>`}>
            <div style={{ maxWidth: 360 }}>
              <SearchBox
                value={searchVal}
                onChange={setSearchVal}
                placeholder="Filter datasets…"
              />
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Forms: FilterBar ─────────────────────────────────────────── */}
        <CatalogueSection title="FilterBar">
          <CatalogueExample label="Search + select + toggle" code={`<FilterBar
  filters={[
    { key: "q",    type: "search", label: "Search",    placeholder: "Filter assets…" },
    { key: "tier", type: "select", label: "Tier", options: TIER_OPTIONS },
    { key: "fresh", type: "toggle", label: "Current only" },
  ]}
  onChange={state => console.log(state)}
/>`} bg="#EFEFED">
            <FilterBar filters={SAMPLE_FILTERS} onChange={() => undefined} />
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Data: TierBadge ───────────────────────────────────────────── */}
        <CatalogueSection title="TierBadge">
          <CatalogueExample label="All tiers (hover for tooltip)" code={`<TierBadge tier="bronze" />
<TierBadge tier="silver" />
<TierBadge tier="gold" />`}>
            <div style={{ display: "flex", gap: 10 }}>
              <TierBadge tier="bronze" />
              <TierBadge tier="silver" />
              <TierBadge tier="gold" />
            </div>
          </CatalogueExample>
          <CatalogueExample label="Custom tooltip" code={`<TierBadge tier="gold" tooltipText="Analysis-ready data for the mobility dashboard" />`}>
            <TierBadge tier="gold" tooltipText="Analysis-ready data for the mobility dashboard" />
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Data: StatCard ────────────────────────────────────────────── */}
        <CatalogueSection title="StatCard + StatRow">
          <CatalogueExample label="StatRow with multiple cards" code={`<StatRow stats={[
  { n: 42,     label: "Registered assets" },
  { n: "8",    label: "Data sources" },
  { n: "99.8%", label: "Uptime" },
]} />`}>
            <StatRow stats={[
              { n: 42,      label: "Registered assets" },
              { n: "8",     label: "Data sources" },
              { n: "99.8%", label: "Uptime" },
            ]} />
          </CatalogueExample>
          <CatalogueExample label="Single card" code={`<StatCard n={42} label="Datasets" borderRight={false} />`}>
            <StatCard n={42} label="Datasets" borderRight={false} />
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Data: MetadataList ────────────────────────────────────────── */}
        <CatalogueSection title="MetadataList">
          <CatalogueExample label="View mode" code={`<MetadataList entries={[
  { label: "Title",  value: "MobiScout Count Data" },
  { label: "Source", value: "MobiScout AG" },
  { label: "Tier",   value: <TierBadge tier="gold" /> },
  { label: "Description", value: "Urban mobility counts…", span: true },
]} />`}>
            <MetadataList entries={[
              { label: "Title",       value: "MobiScout Count Data" },
              { label: "Source",      value: "MobiScout AG" },
              { label: "Tier",        value: <TierBadge tier="gold" /> },
              { label: "Description", value: "Urban mobility measurement data aggregated at 15-minute intervals across 42 counting stations.", span: true },
            ]} />
          </CatalogueExample>
          <CatalogueExample label="With empty values" code={`<MetadataList entries={[
  { label: "Title",   value: "" },
  { label: "License", value: undefined },
]} />`}>
            <MetadataList entries={[
              { label: "Title",   value: "" },
              { label: "License", value: undefined },
            ]} />
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Data: DataTable ───────────────────────────────────────────── */}
        <CatalogueSection title="DataTable">
          <CatalogueExample label="With data and row click" code={`<DataTable
  columns={COLUMNS}
  data={datasets}
  onRowClick={(row) => console.log(row)}
/>`} bg="#EFEFED">
            <DataTable
              columns={SAMPLE_COLUMNS}
              data={SAMPLE_DATA}
              onRowClick={(row) => alert(`Clicked: ${row.name}`)}
            />
          </CatalogueExample>
          <CatalogueExample label="Empty state" code={`<DataTable columns={COLUMNS} data={[]} />`} bg="#EFEFED">
            <DataTable columns={SAMPLE_COLUMNS} data={[]} />
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Data: SqlWorkbench ───────────────────────────────────────── */}
        <SqlWorkbenchSection />

        {/* ── Overlays: Modal ───────────────────────────────────────────── */}
        <CatalogueSection title="Modal">
          <CatalogueExample label="Open / close" code={`<Modal open={open} onClose={close} aria-labelledby="modal-title">
  <Modal.Header id="modal-title" onClose={close}>Register Asset</Modal.Header>
  <Modal.Body>Form content here…</Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={close}>Cancel</Button>
    <Button variant="brand">Submit</Button>
  </Modal.Footer>
</Modal>`}>
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Open Modal
            </Button>
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              aria-labelledby="demo-modal-title"
            >
              <Modal.Header id="demo-modal-title" onClose={() => setModalOpen(false)}>
                Register Asset
              </Modal.Header>
              <Modal.Body>
                <p style={{ margin: 0, fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#606060" }}>
                  Fill in the asset details to register it in the EDMoScope catalogue.
                </p>
                <div style={{ marginTop: 16 }}>
                  <Label htmlFor="modal-title-field">Asset title</Label>
                  <Input id="modal-title-field" placeholder="Enter title" value="" onChange={() => undefined} />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button variant="brand" onClick={() => setModalOpen(false)}>Submit</Button>
              </Modal.Footer>
            </Modal>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Overlays: Drawer ─────────────────────────────────────────── */}
        <CatalogueSection title="Drawer">
          <CatalogueExample label="Right-side drawer" code={`<Drawer open={open} onClose={close} aria-labelledby="drawer-title">
  <Drawer.Header id="drawer-title" onClose={close}>Filters</Drawer.Header>
  <Drawer.Body>Filter controls…</Drawer.Body>
  <Drawer.Footer>
    <Button variant="ghost" onClick={close}>Cancel</Button>
    <Button variant="brand" onClick={apply}>Apply</Button>
  </Drawer.Footer>
</Drawer>`}>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Open Drawer
            </Button>
            <Drawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              aria-labelledby="demo-drawer-title"
            >
              <Drawer.Header id="demo-drawer-title" onClose={() => setDrawerOpen(false)}>
                Dataset Filters
              </Drawer.Header>
              <Drawer.Body>
                <FilterBar filters={SAMPLE_FILTERS} onChange={() => undefined} />
              </Drawer.Body>
              <Drawer.Footer>
                <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
                <Button variant="brand" onClick={() => setDrawerOpen(false)}>Apply</Button>
              </Drawer.Footer>
            </Drawer>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Overlays: ConfirmDialog ───────────────────────────────────── */}
        <CatalogueSection title="ConfirmDialog">
          <CatalogueExample label="Danger variant" code={`<ConfirmDialog
  open={open}
  onClose={close}
  onConfirm={handleDelete}
  title="Delete dataset?"
  description="This will permanently remove the asset and all its distributions."
  variant="danger"
  confirmLabel="Delete"
/>`}>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Delete dataset
            </Button>
            <ConfirmDialog
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={() => { alert("Deleted!"); setConfirmOpen(false); }}
              title="Delete dataset?"
              description="This will permanently remove MobiScout Count Data and all its distributions. This action cannot be undone."
              variant="danger"
              confirmLabel="Delete"
            />
          </CatalogueExample>
          <CatalogueExample label="Default variant" code={`<ConfirmDialog
  open={open}
  onClose={close}
  onConfirm={handleConfirm}
  title="Publish dataset?"
  description="The dataset will be visible to all catalogue users."
/>`}>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
                Open confirm (reuses state)
              </Button>
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <CatalogueSection title="Divider">
          <CatalogueExample label="Spacing variants" code={`<Divider spacing="sm" />
<Divider spacing="md" />
<Divider spacing="lg" />`}>
            <div>
              <p style={{ margin: 0, fontFamily: "Montserrat, sans-serif", fontSize: 13 }}>Above (sm)</p>
              <Divider spacing="sm" />
              <p style={{ margin: 0, fontFamily: "Montserrat, sans-serif", fontSize: 13 }}>Below sm / Above md</p>
              <Divider spacing="md" />
              <p style={{ margin: 0, fontFamily: "Montserrat, sans-serif", fontSize: 13 }}>Below md / Above lg</p>
              <Divider spacing="lg" />
              <p style={{ margin: 0, fontFamily: "Montserrat, sans-serif", fontSize: 13 }}>Below lg</p>
            </div>
          </CatalogueExample>
        </CatalogueSection>

        {/* ── Icon ─────────────────────────────────────────────────────── */}
        <CatalogueSection title="Icon">
          <CatalogueExample label="Sizes and labelled vs decorative" code={`<Icon symbol="⌕" size="xs" />
<Icon symbol="⌕" size="md" />
<Icon symbol="⌕" size="xl" />
<Icon symbol="✓" label="Success" size="lg" />`}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Icon symbol="⌕" size="xs" />
              <Icon symbol="⌕" size="sm" />
              <Icon symbol="⌕" size="md" />
              <Icon symbol="⌕" size="lg" />
              <Icon symbol="⌕" size="xl" />
              <Icon symbol="✓" label="Success" size="lg" />
            </div>
          </CatalogueExample>
        </CatalogueSection>

      </CatalogueShell>
    </ToastProvider>
  );
}
