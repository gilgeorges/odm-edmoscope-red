/**
 * UnderstandTab — Tab 1 of the dataset detail decision funnel.
 *
 * Answers: "Is this what I need?"
 *
 * Content order:
 *   1. Two definition cards (Business / Technical) side-by-side
 *   2. Caveats panel — meaning caveats only
 *   3. Schema table with column filter
 *   4. Bottom row: disseminations (2/3) + metadata sidebar (1/3)
 */

import React, { useState } from "react";
import {
  Badge,
  DataTable,
  Notice,
} from "../../src/index.ts";
import type { ColumnDef } from "../../src/index.ts";
import type { Dataset, SchemaColumn, Caveat, Dissemination } from "../../types/dataset.ts";

/* ── Props ───────────────────────────────────────────────────────────────── */

/** Props for the UnderstandTab component. */
export interface UnderstandTabProps {
  /** The fully loaded dataset. */
  dataset: Dataset;
  /** Called when the user clicks the cross-reference link to the Quality tab. */
  onNavigateToQuality: () => void;
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */

/** Skeleton placeholder shown while data is loading. */
export function UnderstandTabSkeleton(): React.ReactElement {
  return (
    <div className="pt-6 animate-pulse">
      <div className="grid grid-cols-2 gap-4 mb-6 max-[900px]:grid-cols-1">
        <div className="bg-odm-surface rounded h-48" />
        <div className="bg-odm-surface rounded h-48" />
      </div>
      <div className="bg-odm-warn-bg border border-odm-warn-bd rounded h-24 mb-6" />
      <div className="bg-odm-surface rounded h-64 mb-6" />
      <div className="grid grid-cols-[2fr_1fr] gap-4 max-[900px]:grid-cols-1">
        <div className="bg-odm-surface rounded h-48" />
        <div className="bg-odm-surface rounded h-48" />
      </div>
    </div>
  );
}

/* ── Definition cards ────────────────────────────────────────────────────── */

function DefinitionCards({ dataset }: { dataset: Dataset }): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6 max-[900px]:grid-cols-1">
      {/* Business definition */}
      <div className="bg-odm-card border border-odm-line rounded p-5">
        <div className="font-sans text-[10px] font-bold tracking-[0.12em] uppercase text-odm-info mb-0.5">
          Business definition
        </div>
        <div className="font-sans text-[11px] tracking-[0.06em] uppercase text-odm-info mb-3">
          What this dataset represents
        </div>
        <div className="font-serif text-[14px] leading-relaxed text-odm-ink whitespace-pre-line mb-4">
          {dataset.businessDefinition}
        </div>
        <div className="inline-block font-sans text-[10px] text-odm-info bg-odm-info-bg border border-odm-info-bd px-2 py-0.5 rounded">
          For analysts &amp; reporting
        </div>
      </div>

      {/* Technical definition */}
      <div className="bg-odm-card border border-odm-line rounded p-5">
        <div className="font-sans text-[10px] font-bold tracking-[0.12em] uppercase text-odm-mid mb-0.5">
          Technical definition
        </div>
        <div className="font-sans text-[11px] tracking-[0.06em] uppercase text-odm-mid mb-3">
          How this dataset is produced
        </div>
        <TechnicalBody text={dataset.technicalDefinition} />
        <div className="inline-block font-sans text-[10px] text-odm-mid bg-odm-surface border border-odm-line-l px-2 py-0.5 rounded mt-4">
          For engineers &amp; debugging
        </div>
      </div>
    </div>
  );
}

/** Renders technical definition prose with inline mono chips for technical names. */
function TechnicalBody({ text }: { text: string }): React.ReactElement {
  const monoPattern = /\b([a-z][a-z0-9_]*(?:_[a-z0-9]+){2,})\b/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = monoPattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    parts.push(
      <code
        key={match.index}
        className="font-mono text-[12px] bg-odm-surface border border-odm-line-l px-1 py-px rounded text-odm-soft"
      >
        {match[0]}
      </code>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return (
    <div className="font-serif text-[14px] leading-relaxed text-odm-ink whitespace-pre-line">
      {parts}
    </div>
  );
}

/* ── Caveats panel ───────────────────────────────────────────────────────── */

function CaveatsPanel({
  caveats,
  onNavigateToQuality,
}: {
  caveats: Caveat[];
  onNavigateToQuality: () => void;
}): React.ReactElement {
  const meaningCaveats = caveats.filter((c) => c.kind === "meaning");
  if (meaningCaveats.length === 0) return <></>;

  return (
    <div className="mb-6 border border-odm-warn-bd bg-odm-warn-bg rounded p-5">
      <div className="font-sans text-[13px] font-semibold text-odm-warn mb-0.5">
        What a new analyst should not miss
      </div>
      <div className="font-sans text-[11px] text-odm-warn mb-4">
        Caveats about meaning · for fitness and freshness see{" "}
        <button
          type="button"
          onClick={onNavigateToQuality}
          className="underline cursor-pointer bg-transparent border-0 font-sans text-[11px] text-odm-warn p-0 hover:text-odm-ink transition-colors"
        >
          Quality
        </button>
      </div>
      <ul className="space-y-3">
        {meaningCaveats.map((caveat) => (
          <li key={caveat.id} className="flex gap-2">
            <span className="font-sans text-odm-warn mt-0.5 shrink-0">·</span>
            <span className="font-serif text-[13px] leading-relaxed text-odm-soft">
              {caveat.text}
              {caveat.crossReferenceTab === "quality" && (
                <span className="ml-2 font-sans text-[11px] text-odm-warn">
                  (
                  <button
                    type="button"
                    onClick={onNavigateToQuality}
                    className="underline cursor-pointer bg-transparent border-0 font-sans text-[11px] text-odm-warn p-0 hover:text-odm-ink transition-colors"
                  >
                    see Quality
                  </button>
                  )
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Schema table ────────────────────────────────────────────────────────── */

type SchemaRow = SchemaColumn & Record<string, unknown>;

const SCHEMA_COLUMNS: ColumnDef<SchemaRow>[] = [
  {
    key: "name",
    header: "Column",
    cellClassName: "w-[22%]",
    render: (row) => (
      <code className="font-mono text-[12px] text-odm-ink">{row.name}</code>
    ),
  },
  {
    key: "dataType",
    header: "Type",
    cellClassName: "w-[8%]",
    render: (row) => (
      <div>
        <span className="font-mono text-[11px] text-odm-mid">{row.dataType}</span>
        {row.valueDomain !== undefined && row.valueDomain !== "" && (
          <div className="font-mono text-[10px] text-odm-muted mt-0.5 leading-tight">
            {row.valueDomain}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "businessMeaning",
    header: "Business meaning",
    cellClassName: "w-[37%] text-odm-info",
    render: (row) => (
      <span className="font-sans text-[13px] text-odm-soft leading-snug">
        {row.businessMeaning}
      </span>
    ),
  },
  {
    key: "technicalDefinition",
    header: "Technical definition",
    cellClassName: "w-[37%]",
    render: (row) => (
      <span className="font-sans text-[13px] text-odm-soft leading-snug">
        {row.technicalDefinition}
      </span>
    ),
  },
];

function SchemaTable({ schema }: { schema: SchemaColumn[] }): React.ReactElement {
  const [filter, setFilter] = useState("");

  const filtered: SchemaRow[] = (
    filter.trim() === ""
      ? schema
      : schema.filter(
          (col) =>
            col.name.toLowerCase().includes(filter.toLowerCase()) ||
            col.businessMeaning.toLowerCase().includes(filter.toLowerCase()) ||
            col.dataType.toLowerCase().includes(filter.toLowerCase())
        )
  ).map((col) => col as SchemaRow);

  return (
    <div className="mb-6 bg-odm-card border border-odm-line rounded">
      <div className="flex items-center justify-between px-5 py-3 border-b border-odm-line-l">
        <div className="font-sans text-[13px] font-semibold text-odm-ink">
          Schema
          <span className="ml-2 font-sans text-[11px] font-normal text-odm-muted">
            {schema.length} columns
          </span>
        </div>
        <input
          type="search"
          placeholder="Filter columns…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="font-sans text-[12px] text-odm-ink bg-odm-surface border border-odm-line-l rounded px-2.5 py-1 w-44 placeholder:text-odm-muted focus:outline-2 focus:outline-lux-red"
        />
      </div>
      <div className="px-5 pt-3 pb-1">
        <DataTable<SchemaRow>
          columns={SCHEMA_COLUMNS}
          data={filtered}
          emptyState={
            <div className="py-8 text-center font-sans text-[13px] text-odm-muted">
              No columns match &ldquo;{filter}&rdquo;
            </div>
          }
        />
      </div>
    </div>
  );
}

/* ── Disseminations ───────────────────────────────────────────────────────── */

function DisseminationsPanel({
  disseminations,
  totalCount,
}: {
  disseminations: Dissemination[];
  totalCount: number;
}): React.ReactElement {
  const shown = disseminations.slice(0, 3);
  return (
    <div className="bg-odm-card border border-odm-line rounded p-5 h-full">
      <div className="font-sans text-[13px] font-semibold text-odm-ink mb-4">
        Questions this dataset has answered before
      </div>
      <ul className="space-y-4">
        {shown.map((d) => (
          <li key={d.id}>
            <div className="flex items-start gap-2 mb-1">
              <Badge variant="default" className="mt-0.5 shrink-0">DISS</Badge>
              <blockquote className="font-serif text-[13px] italic text-odm-soft leading-snug m-0">
                &ldquo;{d.answeredQuestion}&rdquo;
              </blockquote>
            </div>
            <div className="font-sans text-[11px] text-odm-muted ml-9">
              {d.recipient} · {d.date} · {d.kind}
            </div>
          </li>
        ))}
      </ul>
      {totalCount > 3 && (
        <div className="mt-4 font-sans text-[12px] text-odm-info">
          {totalCount - 3} more disseminations not shown
        </div>
      )}
    </div>
  );
}

/* ── Metadata sidebar ─────────────────────────────────────────────────────── */

function MetadataSidebar({ dataset }: { dataset: Dataset }): React.ReactElement {
  return (
    <div className="flex flex-col gap-3">
      {/* Metadata card */}
      <div className="bg-odm-card border border-odm-line rounded p-4">
        <SidebarSection label="Type">{dataset.type.label}</SidebarSection>
        <SidebarSection label="Publisher">
          {dataset.publisher.uri !== undefined ? (
            <span className="font-sans text-[12px] text-odm-soft">
              {dataset.publisher.name}
            </span>
          ) : (
            dataset.publisher.name
          )}
        </SidebarSection>
        <SidebarSection label="Steward">
          <div className="font-sans text-[12px] text-odm-soft">{dataset.steward.name}</div>
          <a
            href={`mailto:${dataset.steward.email}`}
            className="font-sans text-[11px] text-odm-info hover:underline"
          >
            {dataset.steward.email}
          </a>
        </SidebarSection>
        <SidebarSection label="Coverage">
          <div className="font-sans text-[12px] text-odm-soft">
            {dataset.temporalCoverage.start} –{" "}
            {dataset.temporalCoverage.end === "ongoing"
              ? "ongoing"
              : dataset.temporalCoverage.end}
          </div>
          {dataset.spatialCoverage !== undefined && (
            <div className="font-sans text-[11px] text-odm-muted">
              {dataset.spatialCoverage}
            </div>
          )}
        </SidebarSection>
        <SidebarSection label="Keywords" noBorder>
          <div className="flex flex-wrap gap-1 mt-1">
            {dataset.keywords.map((kw) => (
              <Badge key={kw} variant="default">{kw}</Badge>
            ))}
          </div>
        </SidebarSection>
      </div>

      {/* Decision shortcut card */}
      {dataset.decisionShortcut !== undefined && (
        <div className="bg-odm-card border border-odm-line rounded p-4">
          <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-muted mb-2">
            Decision shortcut
          </div>
          <Notice variant="info" className="mb-0">
            {dataset.decisionShortcut}
          </Notice>
        </div>
      )}
    </div>
  );
}

function SidebarSection({
  label,
  children,
  noBorder = false,
}: {
  label: string;
  children: React.ReactNode;
  noBorder?: boolean;
}): React.ReactElement {
  return (
    <div className={["py-2.5", noBorder ? "" : "border-b border-odm-line-l"].join(" ")}>
      <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-muted mb-1">
        {label}
      </div>
      <div className="font-sans text-[12px] text-odm-soft">{children}</div>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────── */

/**
 * UnderstandTab — "Is this what I need?"
 *
 * Tab i of the five-tab dataset detail decision funnel.
 * Disqualifying gate: if the business or technical definition does not match
 * the analyst's need, they should stop here.
 */
export function UnderstandTab({
  dataset,
  onNavigateToQuality,
}: UnderstandTabProps): React.ReactElement {
  return (
    <div className="pt-6">
      <DefinitionCards dataset={dataset} />
      <CaveatsPanel caveats={dataset.caveats} onNavigateToQuality={onNavigateToQuality} />
      <SchemaTable schema={dataset.schema} />
      <div className="grid grid-cols-[2fr_1fr] gap-4 max-[900px]:grid-cols-1">
        <DisseminationsPanel
          disseminations={dataset.disseminations}
          totalCount={dataset.totalDisseminationCount}
        />
        <MetadataSidebar dataset={dataset} />
      </div>
    </div>
  );
}
