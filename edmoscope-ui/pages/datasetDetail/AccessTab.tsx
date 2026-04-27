/**
 * AccessTab — Tab 5 of the dataset detail decision funnel.
 *
 * "How do I use it?" — enabler tab, assumes the user is cleared.
 *
 * Layout: 2/3 main column + 1/3 sidebar, collapses to single column at 1200px.
 *
 * Main column:
 *   1. Stable identifier card (S3 URI + stats grid)
 *   2. Sample query card (canonical SQL block)
 *   3. Saved queries list
 *
 * Sidebar:
 *   1. Cleared affirmation (or "go back to Rights" if not cleared)
 *   2. Citation card
 *   3. "Need help?" card
 */

import React, { useState } from "react";
import { Badge } from "../../src/index.ts";
import type { Dataset, SavedQuery, Distribution } from "../../types/dataset.ts";

/* ── Props ───────────────────────────────────────────────────────────────── */

/** Props for the AccessTab component. */
export interface AccessTabProps {
  /** The fully loaded dataset. */
  dataset: Dataset;
  /** Called when the user clicks "Open in SQL". Triggers the SQL drawer. */
  onOpenSql: (query?: string) => void;
  /** Called when the user clicks the link back to the Rights tab. */
  onNavigateToRights: () => void;
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */

/** Skeleton placeholder shown while data is loading. */
export function AccessTabSkeleton(): React.ReactElement {
  return (
    <div className="pt-6 animate-pulse">
      <div className="grid grid-cols-[2fr_1fr] gap-5 max-[1200px]:grid-cols-1">
        <div className="space-y-4">
          <div className="bg-odm-surface rounded h-32" />
          <div className="bg-odm-surface rounded h-52" />
          <div className="bg-odm-surface rounded h-40" />
        </div>
        <div className="space-y-3">
          <div className="bg-odm-surface rounded h-28" />
          <div className="bg-odm-surface rounded h-36" />
          <div className="bg-odm-surface rounded h-24" />
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) {
    return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  }
  if (bytes >= 1_048_576) {
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
  }
  return `${(bytes / 1_024).toFixed(1)} KB`;
}

function formatRowCount(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M rows`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(0)}K rows`;
  }
  return `${n} rows`;
}

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

/* ── Stable identifier card ───────────────────────────────────────────────── */

function IdentifierCard({
  distribution,
  catalogTable,
}: {
  distribution: Distribution;
  catalogTable: string | undefined;
}): React.ReactElement {
  const [copied, setCopied] = useState(false);

  function handleCopy(): void {
    copyToClipboard(distribution.accessUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* clipboard unavailable */ });
  }

  return (
    <div className="bg-odm-card border border-odm-line rounded mb-4">
      <div className="px-4 py-3 border-b border-odm-line-l">
        <div className="font-sans text-[13px] font-semibold text-odm-ink">
          Stable identifier
        </div>
      </div>
      {/* S3 URI dark code block */}
      <div className="bg-odm-ink rounded mx-4 mt-3 mb-3 px-4 py-3 flex items-center justify-between gap-3">
        <code className="font-mono text-[12px] text-odm-ok break-all flex-1">
          {distribution.accessUrl}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="font-sans text-[11px] font-semibold text-white bg-transparent border border-odm-line-h rounded px-2 py-1 cursor-pointer hover:border-white transition-colors shrink-0"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {/* 2×2 stats grid */}
      <div className="grid grid-cols-2 gap-0 px-4 pb-4">
        <StatCell label="Format">{distribution.format}</StatCell>
        <StatCell label="Size">
          {formatBytes(distribution.byteSize)}
          {distribution.rowCount !== undefined && (
            <span className="ml-1.5 text-odm-muted">
              · {formatRowCount(distribution.rowCount)}
            </span>
          )}
        </StatCell>
        {catalogTable !== undefined && (
          <StatCell label="Catalog table">
            <code className="font-mono text-[12px] text-odm-info">{catalogTable}</code>
          </StatCell>
        )}
        <StatCell label="Media type">
          <code className="font-mono text-[11px] text-odm-muted">
            {distribution.mediaType}
          </code>
        </StatCell>
      </div>
    </div>
  );
}

function StatCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="py-2 pr-4">
      <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-muted mb-0.5">
        {label}
      </div>
      <div className="font-sans text-[12px] text-odm-soft">{children}</div>
    </div>
  );
}

/* ── Sample query card ────────────────────────────────────────────────────── */

function SampleQueryCard({
  query,
  onOpenSql,
}: {
  query: SavedQuery;
  onOpenSql: (sql: string) => void;
}): React.ReactElement {
  return (
    <div className="bg-odm-card border border-odm-line rounded mb-4">
      <div className="px-4 py-3 border-b border-odm-line-l flex items-center justify-between">
        <div className="font-sans text-[13px] font-semibold text-odm-ink">
          Sample query
          {query.isCanonical === true && (
            <Badge variant="ok" className="ml-2">Canonical</Badge>
          )}
        </div>
        <button
          type="button"
          onClick={() => onOpenSql(query.sql)}
          className="font-sans text-[12px] text-odm-info hover:underline cursor-pointer bg-transparent border-0 p-0"
        >
          Open in SQL drawer →
        </button>
      </div>
      {/* SQL block — dark background, light monospace */}
      <div className="bg-odm-ink rounded mx-4 mt-3 mb-3 p-4 overflow-x-auto">
        <pre className="font-mono text-[12px] text-odm-ok leading-relaxed m-0 whitespace-pre">
          {query.sql}
        </pre>
      </div>
      {query.note !== undefined && (
        <div className="px-4 pb-4">
          <p className="font-serif text-[12px] italic text-odm-muted leading-snug m-0">
            {query.note}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Saved queries list ───────────────────────────────────────────────────── */

function SavedQueriesCard({
  queries,
  onOpenSql,
}: {
  queries: SavedQuery[];
  onOpenSql: (sql?: string) => void;
}): React.ReactElement {
  const nonCanonical = queries.filter((q) => q.isCanonical !== true).slice(0, 3);
  const totalNonCanonical = queries.filter((q) => q.isCanonical !== true).length;

  return (
    <div className="bg-odm-card border border-odm-line rounded">
      <div className="px-4 py-3 border-b border-odm-line-l">
        <div className="font-sans text-[13px] font-semibold text-odm-ink">
          Saved queries against this dataset
        </div>
      </div>
      <ul className="divide-y divide-odm-line-l px-4">
        {nonCanonical.map((q) => (
          <li key={q.id} className="py-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-sans text-[12px] font-semibold text-odm-ink leading-snug">
                {q.title}
              </div>
              <div className="font-sans text-[10px] text-odm-muted mt-0.5">
                {q.savedBy} · {q.savedDate}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenSql(q.sql !== "" ? q.sql : undefined)}
              className="font-sans text-[11px] text-odm-info hover:underline cursor-pointer bg-transparent border-0 p-0 shrink-0"
            >
              Run →
            </button>
          </li>
        ))}
      </ul>
      {totalNonCanonical > 3 && (
        <div className="px-4 py-3 border-t border-odm-line-l">
          <button
            type="button"
            className="font-sans text-[12px] text-odm-info hover:underline cursor-pointer bg-transparent border-0 p-0"
          >
            View all {totalNonCanonical} queries in the library →
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Sidebar: Cleared affirmation ─────────────────────────────────────────── */

function ClearedCard({
  isCleared,
  onNavigateToRights,
}: {
  isCleared: boolean;
  onNavigateToRights: () => void;
}): React.ReactElement {
  if (isCleared) {
    return (
      <div className="bg-odm-info-bg border border-odm-info-bd rounded p-4">
        <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-info mb-2">
          You&apos;re cleared
        </div>
        <div className="font-sans text-[12px] text-odm-info leading-snug">
          You have the required access for this dataset. You may query it directly in the
          SQL workbench or download from the S3 URI above.
        </div>
      </div>
    );
  }
  return (
    <div className="bg-odm-warn-bg border border-odm-warn-bd rounded p-4">
      <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-warn mb-2">
        Access not confirmed
      </div>
      <div className="font-sans text-[12px] text-odm-warn leading-snug mb-2">
        Review the Rights tab before attempting to access this dataset.
      </div>
      <button
        type="button"
        onClick={onNavigateToRights}
        className="font-sans text-[11px] font-semibold text-odm-warn underline cursor-pointer bg-transparent border-0 p-0 hover:text-odm-ink transition-colors"
      >
        ← Go to Rights tab
      </button>
    </div>
  );
}

/* ── Sidebar: Citation card ───────────────────────────────────────────────── */

function CitationCard({ dataset }: { dataset: Dataset }): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const distribution = dataset.distributions[0];
  const citation =
    `${dataset.publisher.name} (${new Date(dataset.lastModified).getFullYear()}). ` +
    `${dataset.title} [Dataset, v${dataset.version}]. ` +
    `Retrieved from ${distribution !== undefined ? distribution.accessUrl : "OdM data catalogue"}.`;

  function handleCopy(): void {
    copyToClipboard(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* clipboard unavailable */ });
  }

  return (
    <div className="bg-odm-card border border-odm-line rounded p-4">
      <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-muted mb-3">
        Cite this dataset
      </div>
      <p className="font-serif text-[12px] italic text-odm-soft leading-snug mb-3 m-0">
        {citation}
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="font-sans text-[11px] font-semibold text-odm-mid border border-odm-line rounded px-2.5 py-1 cursor-pointer bg-transparent hover:bg-odm-surface transition-colors"
      >
        {copied ? "Copied!" : "Copy citation"}
      </button>
    </div>
  );
}

/* ── Sidebar: Need help ───────────────────────────────────────────────────── */

function NeedHelpCard({ dataset }: { dataset: Dataset }): React.ReactElement {
  return (
    <div className="bg-odm-card border border-odm-line rounded p-4">
      <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-muted mb-2">
        Need help?
      </div>
      <div className="font-sans text-[12px] text-odm-soft leading-snug mb-1">
        Contact the steward — <strong>{dataset.steward.name}</strong> — for access
        issues, questions about the data model, or to request a reprocessing.
      </div>
      <a
        href={`mailto:${dataset.steward.email}`}
        className="font-sans text-[12px] text-odm-info hover:underline"
      >
        {dataset.steward.email}
      </a>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────── */

/**
 * AccessTab — "How do I use it?"
 *
 * Tab v of the five-tab dataset detail decision funnel.
 * Enabler tab: assumes the user has cleared gates i–iii.
 * Does not repeat warnings — those belong on earlier tabs.
 */
export function AccessTab({
  dataset,
  onOpenSql,
  onNavigateToRights,
}: AccessTabProps): React.ReactElement {
  const distribution = dataset.distributions[0];
  const canonicalQuery = dataset.sampleQueries.find((q) => q.isCanonical === true);

  return (
    <div className="pt-6">
      <div className="grid grid-cols-[2fr_1fr] gap-5 max-[1200px]:grid-cols-1">
        {/* Main column */}
        <div>
          {distribution !== undefined && (
            <IdentifierCard
              distribution={distribution}
              catalogTable={dataset.catalogTable}
            />
          )}
          {canonicalQuery !== undefined && (
            <SampleQueryCard
              query={canonicalQuery}
              onOpenSql={onOpenSql}
            />
          )}
          <SavedQueriesCard
            queries={dataset.sampleQueries}
            onOpenSql={onOpenSql}
          />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3">
          <ClearedCard
            isCleared={
              dataset.rightsClearance === "cleared" && dataset.userHasAccess
            }
            onNavigateToRights={onNavigateToRights}
          />
          <CitationCard dataset={dataset} />
          <NeedHelpCard dataset={dataset} />
        </div>
      </div>
    </div>
  );
}
