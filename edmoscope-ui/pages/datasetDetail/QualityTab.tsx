/**
 * QualityTab — Tab 3 of the dataset detail decision funnel.
 *
 * Answers: "Can I trust it?"
 *
 * Content order:
 *   1. Header-level fitness row (four stat cards)
 *   2. Known issues card
 *   3. Per-column quality signals table
 */

import React, { useState } from "react";
import { Badge, DataTable } from "../../src/index.ts";
import type { ColumnDef } from "../../src/index.ts";
import type {
  Dataset,
  FreshnessTolerance,
  KnownIssue,
  ColumnQualitySignal,
} from "../../types/dataset.ts";

/* ── Props ───────────────────────────────────────────────────────────────── */

/** Props for the QualityTab component. */
export interface QualityTabProps {
  /** The fully loaded dataset. */
  dataset: Dataset;
  /** Called when the user clicks the cross-reference link to the Understand tab. */
  onNavigateToUnderstand: () => void;
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */

/** Skeleton placeholder shown while data is loading. */
export function QualityTabSkeleton(): React.ReactElement {
  return (
    <div className="pt-6 animate-pulse">
      <div className="grid grid-cols-4 gap-3 mb-6 max-[900px]:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-odm-surface rounded h-24" />
        ))}
      </div>
      <div className="bg-odm-warn-bg border border-odm-warn-bd rounded h-48 mb-6" />
      <div className="bg-odm-surface rounded h-56" />
    </div>
  );
}

/* ── Freshness gradient bar ───────────────────────────────────────────────── */

const FRESHNESS_MARKER_CLASS: Record<FreshnessTolerance, string> = {
  ok: "left-[20%]",
  stale: "left-[60%]",
  overdue: "left-[85%]",
};

const FRESHNESS_MARKER_COLOR: Record<FreshnessTolerance, string> = {
  ok: "bg-odm-ok border-odm-ok",
  stale: "bg-odm-warn border-odm-warn",
  overdue: "bg-odm-bad border-odm-bad",
};

const FRESHNESS_LABEL: Record<FreshnessTolerance, string> = {
  ok: "Fresh",
  stale: "Stale",
  overdue: "Overdue",
};

function FreshnessBar({
  hours,
  tolerance,
  cadence,
  rebuildJob,
}: {
  hours: number;
  tolerance: FreshnessTolerance;
  cadence: string;
  rebuildJob: string | undefined;
}): React.ReactElement {
  return (
    <div className="bg-odm-card border border-odm-line rounded p-4 flex flex-col gap-2">
      <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-muted">
        Freshness
      </div>
      <div className="font-sans text-[26px] font-bold text-odm-ink leading-none tabular-nums">
        {hours}h
      </div>
      <Badge
        variant={
          tolerance === "ok" ? "ok" : tolerance === "stale" ? "warn" : "danger"
        }
      >
        {FRESHNESS_LABEL[tolerance]}
      </Badge>
      {/* Gradient bar */}
      <div className="relative h-2 rounded-full overflow-visible mt-1 bg-gradient-to-r from-odm-ok via-odm-warn to-odm-bad">
        <div
          className={[
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
            "w-3 h-3 rounded-full border-2",
            FRESHNESS_MARKER_CLASS[tolerance],
            FRESHNESS_MARKER_COLOR[tolerance],
          ].join(" ")}
        />
      </div>
      <div className="font-sans text-[11px] text-odm-muted leading-snug">
        {cadence} cadence
        {rebuildJob !== undefined && (
          <span>
            {" "}· <code className="font-mono text-[10px]">{rebuildJob}</code>
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Fitness row ──────────────────────────────────────────────────────────── */

function FitnessRow({ dataset }: { dataset: Dataset }): React.ReactElement {
  const qs = dataset.qualitySignals;
  const coverageStart = dataset.temporalCoverage.start;
  const coverageEnd = dataset.temporalCoverage.end;

  return (
    <div className="grid grid-cols-4 gap-3 mb-6 max-[900px]:grid-cols-2">
      <FreshnessBar
        hours={qs.freshnessHours}
        tolerance={qs.freshnessTolerance}
        cadence={qs.cadence}
        rebuildJob={qs.rebuildJob}
      />

      <div className="bg-odm-card border border-odm-line rounded p-4 flex flex-col gap-2">
        <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-muted">
          Completeness
        </div>
        <div className="font-sans text-[26px] font-bold text-odm-ink leading-none tabular-nums">
          {qs.completenessPct.toFixed(1)}%
        </div>
        <div className="font-sans text-[11px] text-odm-muted">
          of expected rows present
        </div>
      </div>

      <div className="bg-odm-card border border-odm-line rounded p-4 flex flex-col gap-2">
        <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-muted">
          Coverage
        </div>
        <div className="font-sans text-[26px] font-bold text-odm-ink leading-none tabular-nums">
          {qs.coverageDays.toLocaleString()}d
        </div>
        <div className="font-sans text-[11px] text-odm-muted leading-snug">
          {coverageStart} –{" "}
          {coverageEnd === "ongoing" ? "ongoing" : coverageEnd}
        </div>
      </div>

      <div className="bg-odm-card border border-odm-line rounded p-4 flex flex-col gap-2">
        <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-muted">
          Cadence
        </div>
        <div className="font-sans text-[26px] font-bold text-odm-ink leading-none">
          {qs.cadence}
        </div>
        {qs.rebuildJob !== undefined && (
          <div className="font-sans text-[11px] text-odm-muted">
            <code className="font-mono text-[10px] bg-odm-surface border border-odm-line-l px-1 py-px rounded">
              {qs.rebuildJob}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Known issues card ────────────────────────────────────────────────────── */

const SEVERITY_BADGE: Record<KnownIssue["severity"], "warn" | "danger" | "info"> = {
  warn: "warn",
  severe: "danger",
  info: "info",
};

const SEVERITY_LABEL: Record<KnownIssue["severity"], string> = {
  warn: "Warning",
  severe: "Severe",
  info: "Info",
};

function KnownIssuesCard({
  issues,
  onNavigateToUnderstand,
}: {
  issues: KnownIssue[];
  onNavigateToUnderstand: () => void;
}): React.ReactElement {
  const activeCount = issues.filter((i) => i.status === "active").length;

  return (
    <div className="mb-6 bg-odm-card border border-odm-warn-bd rounded">
      <div className="px-5 py-3 bg-odm-warn-bg border-b border-odm-warn-bd rounded-t">
        <div className="font-sans text-[13px] font-semibold text-odm-warn">
          Known issues
        </div>
        <div className="font-sans text-[11px] text-odm-warn">
          {activeCount} active · fitness only · for meaning caveats see{" "}
          <button
            type="button"
            onClick={onNavigateToUnderstand}
            className="underline cursor-pointer bg-transparent border-0 font-sans text-[11px] text-odm-warn p-0 hover:text-odm-ink transition-colors"
          >
            Understand
          </button>
        </div>
      </div>
      <ul className="divide-y divide-odm-line-l px-5">
        {issues.map((issue) => (
          <li key={issue.id} className="py-3.5 flex gap-3">
            <div className="mt-0.5 shrink-0">
              <Badge variant={SEVERITY_BADGE[issue.severity]}>
                {SEVERITY_LABEL[issue.severity]}
              </Badge>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-sans text-[12px] font-semibold text-odm-ink">
                  {issue.title}
                </span>
                {issue.status === "resolved" && (
                  <Badge variant="ok">Resolved</Badge>
                )}
                {issue.affectsFrom !== undefined && (
                  <span className="font-sans text-[11px] text-odm-muted">
                    {issue.affectsFrom}
                    {issue.affectsTo !== undefined && ` – ${issue.affectsTo}`}
                  </span>
                )}
              </div>
              <div className="font-serif text-[12px] italic text-odm-soft leading-snug">
                {issue.detail}
              </div>
              {issue.crossReferenceTab === "understand" && (
                <div className="font-sans text-[11px] text-odm-muted mt-1">
                  Cross-listed here because it affects time-series fitness; the meaning change
                  is documented under{" "}
                  <button
                    type="button"
                    onClick={onNavigateToUnderstand}
                    className="underline cursor-pointer bg-transparent border-0 font-sans text-[11px] text-odm-muted p-0 hover:text-odm-ink transition-colors"
                  >
                    Understand
                  </button>
                  .
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Per-column quality signals ───────────────────────────────────────────── */

type SignalRow = ColumnQualitySignal & Record<string, unknown>;

const SIGNAL_COLUMNS: ColumnDef<SignalRow>[] = [
  {
    key: "columnName",
    header: "Column",
    render: (row) => (
      <code className="font-mono text-[12px] text-odm-ink">{row.columnName}</code>
    ),
  },
  {
    key: "nullablePct",
    header: "Nullable",
    render: (row) =>
      row.nullablePct !== undefined ? (
        <span className="font-sans text-[12px] text-odm-soft tabular-nums">
          {(row.nullablePct as number).toFixed(1)}% null
        </span>
      ) : (
        <span className="font-sans text-[11px] text-odm-faint">—</span>
      ),
  },
  {
    key: "distinctCount",
    header: "Distinct values",
    render: (row) =>
      row.distinctCount !== undefined ? (
        <span className="font-sans text-[12px] text-odm-soft tabular-nums">
          {(row.distinctCount as number).toLocaleString()}
        </span>
      ) : (
        <span className="font-sans text-[11px] text-odm-faint">—</span>
      ),
  },
  {
    key: "notable",
    header: "Notable",
    render: (row) => (
      <span className="font-sans text-[12px] text-odm-soft leading-snug">
        {row.notable}
      </span>
    ),
  },
];

function ColumnSignalsCard({
  signals,
  totalColumns,
}: {
  signals: ColumnQualitySignal[];
  totalColumns: number;
}): React.ReactElement {
  const [showAll, setShowAll] = useState(false);
  const displayed: SignalRow[] = signals.map((s) => s as SignalRow);

  return (
    <div className="bg-odm-card border border-odm-line rounded">
      <div className="flex items-center justify-between px-5 py-3 border-b border-odm-line-l">
        <div>
          <div className="font-sans text-[13px] font-semibold text-odm-ink">
            Per-column quality signals
          </div>
          <div className="font-sans text-[11px] text-odm-muted">
            Only columns with non-trivial nullability or anomalies ·{" "}
            {signals.length} of {totalColumns} columns shown
          </div>
        </div>
        {!showAll && totalColumns > signals.length && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="font-sans text-[12px] text-odm-info hover:underline cursor-pointer bg-transparent border-0 p-0"
          >
            Show all columns
          </button>
        )}
      </div>
      <div className="px-5 pt-3 pb-1">
        <DataTable<SignalRow>
          columns={SIGNAL_COLUMNS}
          data={displayed}
        />
        {showAll && (
          <div className="py-3 font-sans text-[12px] text-odm-muted italic">
            Full schema is on the Understand tab. Quality signals are shown only
            for columns with something notable to say.
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────── */

/**
 * QualityTab — "Can I trust it?"
 *
 * Tab iii of the five-tab dataset detail decision funnel.
 * Disqualifying gate: active severe issues or low coverage may disqualify
 * the dataset for a given analysis window.
 */
export function QualityTab({
  dataset,
  onNavigateToUnderstand,
}: QualityTabProps): React.ReactElement {
  return (
    <div className="pt-6">
      <FitnessRow dataset={dataset} />
      <KnownIssuesCard
        issues={dataset.knownIssues}
        onNavigateToUnderstand={onNavigateToUnderstand}
      />
      <ColumnSignalsCard
        signals={dataset.columnQualitySignals}
        totalColumns={dataset.schema.length}
      />
    </div>
  );
}
