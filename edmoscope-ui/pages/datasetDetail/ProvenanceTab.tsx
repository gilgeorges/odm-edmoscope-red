/**
 * ProvenanceTab — Tab 4 of the dataset detail decision funnel.
 *
 * "Where does it come from?" — investigative, no longer a gate.
 *
 * Content:
 *   1. View toggle: "Lineage (leaves)" | "Full PROV-O log"
 *   2. Lineage view — horizontal three-zone graph (upstream → dataset → downstream)
 *      OR Full PROV-O log (stub chronological list)
 *   3. Recent provenance events card (always visible below)
 */

import React, { useState } from "react";
import { Badge, Notice } from "../../src/index.ts";
import type {
  Dataset,
  LineageNode,
  LineageNodeKind,
  ProvenanceEvent,
  ActivityKind,
} from "../../types/dataset.ts";

/* ── Props ───────────────────────────────────────────────────────────────── */

/** Props for the ProvenanceTab component. */
export interface ProvenanceTabProps {
  /** The fully loaded dataset. */
  dataset: Dataset;
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */

/** Skeleton placeholder shown while data is loading. */
export function ProvenanceTabSkeleton(): React.ReactElement {
  return (
    <div className="pt-6 animate-pulse">
      <div className="flex gap-2 mb-6">
        <div className="bg-odm-surface rounded h-8 w-32" />
        <div className="bg-odm-surface rounded h-8 w-32" />
      </div>
      <div className="bg-odm-surface rounded h-52 mb-6" />
      <div className="bg-odm-surface rounded h-40" />
    </div>
  );
}

/* ── Lineage node kind labels ─────────────────────────────────────────────── */

const NODE_KIND_LABEL: Record<LineageNodeKind, string> = {
  "external-reception": "External source",
  "internal-consumer": "Internal consumer",
  "gold-output": "Gold output",
  "saved-query-set": "Saved query set",
};

const NODE_KIND_BADGE: Record<
  LineageNodeKind,
  "info" | "ok" | "default" | "brand"
> = {
  "external-reception": "info",
  "internal-consumer": "default",
  "gold-output": "brand",
  "saved-query-set": "default",
};

/* ── Single lineage node card ─────────────────────────────────────────────── */

function LineageNodeCard({ node }: { node: LineageNode }): React.ReactElement {
  return (
    <div className="bg-odm-card border border-odm-line rounded p-3 min-w-[180px] max-w-[240px]">
      <div className="mb-1">
        <Badge variant={NODE_KIND_BADGE[node.kind]}>
          {NODE_KIND_LABEL[node.kind]}
        </Badge>
      </div>
      <div className="font-sans text-[12px] font-semibold text-odm-ink leading-snug mb-1">
        {node.title}
      </div>
      {node.meta !== undefined && (
        <div className="font-sans text-[10px] text-odm-muted">{node.meta}</div>
      )}
    </div>
  );
}

/* ── Lineage view ─────────────────────────────────────────────────────────── */

function LineageView({
  dataset,
}: {
  dataset: Dataset;
}): React.ReactElement {
  const { lineage, title } = dataset;

  return (
    <div>
      {lineage.isPrimarySource && (
        <Notice variant="info" className="mb-4">
          This dataset is a primary source — its upstream leaf is itself.
        </Notice>
      )}

      <div className="bg-odm-card border border-odm-line rounded p-5 mb-3">
        {/* Three-zone horizontal layout */}
        <div className="flex items-center gap-0 justify-center flex-wrap">
          {/* Upstream zone */}
          <div className="flex flex-col gap-2 items-end min-w-[200px]">
            <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-muted mb-1 self-start">
              Upstream
            </div>
            {lineage.upstreamLeaves.map((node) => (
              <LineageNodeCard key={node.id} node={node} />
            ))}
          </div>

          {/* Arrow left */}
          <div className="flex flex-col items-center px-3 self-center">
            <div className="font-sans text-[20px] text-odm-line-h leading-none">→</div>
          </div>

          {/* Current dataset (centre) */}
          <div className="flex flex-col items-center">
            <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-lux-red mb-1">
              This dataset
            </div>
            <div className="bg-lux-red-20 border-2 border-lux-red rounded p-3 min-w-[200px] max-w-[240px]">
              <div className="mb-1">
                <Badge variant="brand">{dataset.layer}</Badge>
              </div>
              <div className="font-sans text-[12px] font-semibold text-odm-ink leading-snug">
                {title}
              </div>
              <div className="font-sans text-[10px] text-odm-muted mt-0.5">
                v{dataset.version}
              </div>
            </div>
          </div>

          {/* Arrow right */}
          <div className="flex flex-col items-center px-3 self-center">
            <div className="font-sans text-[20px] text-odm-line-h leading-none">→</div>
          </div>

          {/* Downstream zone */}
          <div className="flex flex-col gap-2 items-start min-w-[200px]">
            <div className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase text-odm-muted mb-1 self-start">
              Downstream
            </div>
            {lineage.downstreamLeaves.map((node) => (
              <LineageNodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>

        {/* Explanatory caption */}
        <div className="mt-4 pt-3 border-t border-odm-line-l font-sans text-[11px] text-odm-muted">
          Reading this view:{" "}
          <strong>{lineage.intermediateCount} intermediate steps skipped.</strong>{" "}
          Switch to Full PROV-O log for the complete event chain.
        </div>
      </div>
    </div>
  );
}

/* ── PROV-O log stub ──────────────────────────────────────────────────────── */

const ACTIVITY_CHIP_VARIANT: Record<
  ActivityKind,
  "info" | "default" | "brand"
> = {
  "odm:Reception": "info",
  "odm:Transformation": "default",
  "odm:Dissemination": "brand",
};

const ACTIVITY_LABEL: Record<ActivityKind, string> = {
  "odm:Reception": "Reception",
  "odm:Transformation": "Transformation",
  "odm:Dissemination": "Dissemination",
};

function ProvOLogView({ dataset }: { dataset: Dataset }): React.ReactElement {
  return (
    <div className="bg-odm-card border border-odm-line rounded p-5 mb-3">
      <div className="font-sans text-[13px] font-semibold text-odm-ink mb-1">
        Full PROV-O event log
      </div>
      <div className="font-sans text-[11px] text-odm-muted mb-4">
        Showing {dataset.recentProvenanceEvents.length} most recent of{" "}
        {dataset.totalProvenanceEventCount} events
      </div>
      <ul className="divide-y divide-odm-line-l">
        {dataset.recentProvenanceEvents.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </ul>
      <div className="mt-4 pt-3 border-t border-odm-line-l">
        <button
          type="button"
          className="font-sans text-[12px] text-odm-muted border border-odm-line rounded px-3 py-1.5 cursor-pointer bg-transparent hover:bg-odm-surface transition-colors"
        >
          Load more events
        </button>
      </div>
    </div>
  );
}

/* ── Single event row (shared between log view and recent events card) ───── */

function EventRow({ event }: { event: ProvenanceEvent }): React.ReactElement {
  return (
    <li className="py-3 flex gap-3 items-start">
      <div className="shrink-0 mt-0.5">
        <Badge variant={ACTIVITY_CHIP_VARIANT[event.activityKind]}>
          {ACTIVITY_LABEL[event.activityKind]}
        </Badge>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-sans text-[12px] text-odm-soft leading-snug mb-0.5">
          {event.summary}
        </div>
        <div className="font-sans text-[10px] text-odm-muted">
          {event.attributedTo.join(" · ")} · {formatTimestamp(event.timestamp)}
        </div>
      </div>
    </li>
  );
}

/* ── Recent events card ───────────────────────────────────────────────────── */

function RecentEventsCard({
  dataset,
}: {
  dataset: Dataset;
}): React.ReactElement {
  const shown = dataset.recentProvenanceEvents.slice(0, 2);
  return (
    <div className="bg-odm-card border border-odm-line rounded p-5">
      <div className="font-sans text-[13px] font-semibold text-odm-ink mb-1">
        Latest provenance events
      </div>
      <ul className="divide-y divide-odm-line-l">
        {shown.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </ul>
      <div className="mt-3 pt-2 border-t border-odm-line-l font-sans text-[12px] text-odm-info">
        View full event log ({dataset.totalProvenanceEventCount} events) →
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ── Main export ──────────────────────────────────────────────────────────── */

/**
 * ProvenanceTab — "Where does it come from?"
 *
 * Tab iv of the five-tab dataset detail decision funnel.
 * Enabler tab: assumes the user is cleared (gates i–iii passed).
 * Provides lineage context and the PROV-O audit trail.
 */
export function ProvenanceTab({ dataset }: ProvenanceTabProps): React.ReactElement {
  const [view, setView] = useState<"lineage" | "provolog">("lineage");

  return (
    <div className="pt-6">
      {/* View toggle */}
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={() => setView("lineage")}
          className={[
            "font-sans text-[12px] font-semibold px-3 py-1.5 rounded border transition-colors cursor-pointer",
            view === "lineage"
              ? "bg-odm-ink text-white border-transparent"
              : "bg-transparent text-odm-mid border-odm-line hover:bg-odm-surface",
          ].join(" ")}
        >
          Lineage (leaves)
        </button>
        <button
          type="button"
          onClick={() => setView("provolog")}
          className={[
            "font-sans text-[12px] font-semibold px-3 py-1.5 rounded border transition-colors cursor-pointer",
            view === "provolog"
              ? "bg-odm-ink text-white border-transparent"
              : "bg-transparent text-odm-mid border-transparent hover:text-odm-ink",
          ].join(" ")}
        >
          Full PROV-O log
        </button>
      </div>

      {view === "lineage" ? (
        <LineageView dataset={dataset} />
      ) : (
        <ProvOLogView dataset={dataset} />
      )}

      <RecentEventsCard dataset={dataset} />
    </div>
  );
}
