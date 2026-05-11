/**
 * DatasetDetailPage — the dataset detail view for the EDMoScope catalogue.
 *
 * Organises the five decision-funnel tabs:
 *   i.  Understand   — Is this what I need?
 *   ii. Rights       — Am I allowed to use it?
 *   iii.Quality      — Can I trust it?
 *   iv. Provenance   — Where does it come from?
 *   v.  Access       — How do I use it?
 *
 * Data fetching: a lightweight internal query hook simulates TanStack Query's
 * API shape (status / data / error). The host app should swap this for a real
 * `useQuery` call from `@tanstack/react-query`. See the README for details.
 *
 * SQL drawer: `onOpenSql` prop is the host app's drawer open handler.
 * The "Open in SQL" header button calls it without a pre-filled query;
 * the Access tab's sample queries pass the SQL string through.
 */

import React, { useState, useEffect } from "react";
import { Badge, Breadcrumb, Button, TierBadge } from "../src/index.ts";
import type { DatasetId, Dataset } from "../types/dataset.ts";
import { fetchDataset } from "../mocks/datasetFetchers.ts";
import {
  UnderstandTab,
  UnderstandTabSkeleton,
} from "./datasetDetail/UnderstandTab.tsx";
import {
  RightsTab,
  RightsTabSkeleton,
} from "./datasetDetail/RightsTab.tsx";
import {
  QualityTab,
  QualityTabSkeleton,
} from "./datasetDetail/QualityTab.tsx";
import {
  ProvenanceTab,
  ProvenanceTabSkeleton,
} from "./datasetDetail/ProvenanceTab.tsx";
import {
  AccessTab,
  AccessTabSkeleton,
} from "./datasetDetail/AccessTab.tsx";

/* ── Tab definitions ─────────────────────────────────────────────────────── */

type TabId = "understand" | "rights" | "quality" | "provenance" | "access";

interface TabDef {
  id: TabId;
  numeral: string;
  label: string;
}

const TABS: TabDef[] = [
  { id: "understand", numeral: "i",   label: "Understand"  },
  { id: "rights",     numeral: "ii",  label: "Rights"      },
  { id: "quality",    numeral: "iii", label: "Quality"     },
  { id: "provenance", numeral: "iv",  label: "Provenance"  },
  { id: "access",     numeral: "v",   label: "Access"      },
];

/* ── Props ───────────────────────────────────────────────────────────────── */

/** Props for the DatasetDetailPage component. */
export interface DatasetDetailPageProps {
  /** The dataset to display. */
  datasetId: DatasetId;
  /**
   * Called when the user clicks "Open in SQL" — opens the host app's SQL
   * drawer. The optional `sql` string pre-fills the query editor.
   */
  onOpenSql: (sql?: string) => void;
  /**
   * Called when the user clicks "Data Assets" in the breadcrumb — navigates
   * back to the catalogue list.
   */
  onNavigateToCatalogue: () => void;
}

/* ── Internal query hook ──────────────────────────────────────────────────── */

type QueryStatus = "pending" | "success" | "error";

interface QueryResult {
  status: QueryStatus;
  data: Dataset | undefined;
  error: Error | undefined;
  isPending: boolean;
}

/**
 * Minimal data-fetching hook that mirrors TanStack Query v5's `useQuery` shape.
 *
 * Host app migration: replace the body of this hook with:
 *   return useQuery({ queryKey: ['dataset', id], queryFn: () => fetchDataset(id) });
 */
function useDatasetQuery(id: DatasetId): QueryResult {
  const [status, setStatus] = useState<QueryStatus>("pending");
  const [data, setData] = useState<Dataset | undefined>();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let cancelled = false;
    setStatus("pending");
    setData(undefined);
    setError(undefined);
    fetchDataset(id)
      .then((d) => {
        if (!cancelled) { setData(d); setStatus("success"); }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setStatus("error");
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  return { status, data, error, isPending: status === "pending" };
}

/* ── Relative time helper ─────────────────────────────────────────────────── */

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "< 1 hour ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ── Layer variant → TierBadge tier mapping ─────────────────────────────── */

const LAYER_LABEL: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  outputs: "Outputs",
};

/* ── Page header ─────────────────────────────────────────────────────────── */

function PageHeader({
  dataset,
  onNavigateToCatalogue,
  onOpenSql,
}: {
  dataset: Dataset;
  onNavigateToCatalogue: () => void;
  onOpenSql: (sql?: string) => void;
}): React.ReactElement {
  const layer = dataset.layer;
  const tierLayer = layer === "bronze" || layer === "silver" || layer === "gold"
    ? layer
    : undefined;

  return (
    <div className="pb-6 border-b border-odm-line mb-0">
      <Breadcrumb
        items={[
          { label: "Data Assets", onClick: onNavigateToCatalogue },
          { label: LAYER_LABEL[layer] ?? layer },
          { label: dataset.title },
        ]}
      />
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {tierLayer !== undefined ? (
          <TierBadge tier={tierLayer} />
        ) : (
          <Badge variant="default">{LAYER_LABEL[layer] ?? layer}</Badge>
        )}
        <Badge variant="default">v{dataset.version}</Badge>
        <span className="font-sans text-[11px] text-odm-muted">
          Refreshed {relativeTime(dataset.lastModified)}
        </span>
      </div>
      <h1 className="font-sans text-[28px] font-bold text-odm-ink leading-tight mb-2">
        {dataset.title}
      </h1>
      <p className="font-serif text-[16px] text-odm-soft leading-relaxed mb-4 max-w-3xl">
        {dataset.shortDescription}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="brand" onClick={() => onOpenSql()}>
          Open in SQL
        </Button>
        <Button variant="secondary">
          Cite this dataset
        </Button>
      </div>
    </div>
  );
}

/* ── Tab bar ──────────────────────────────────────────────────────────────── */

function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}): React.ReactElement {
  return (
    <div
      role="tablist"
      aria-label="Dataset detail sections"
      className="flex border-b border-odm-line overflow-x-auto [scrollbar-width:none] mb-0"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            className={[
              "inline-flex items-center gap-1.5 font-sans text-[13px] whitespace-nowrap",
              "py-2.5 pr-5 -mb-px cursor-pointer bg-transparent border-0 border-b-[3px]",
              "transition-colors duration-100",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-[-2px]",
              isActive
                ? "text-lux-red font-semibold border-b-lux-red"
                : "text-odm-muted font-normal border-b-transparent hover:text-odm-soft",
            ].join(" ")}
          >
            <em className="font-serif not-italic italic text-[11px] opacity-70">
              {tab.numeral}.
            </em>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Error state ─────────────────────────────────────────────────────────── */

function ErrorPanel({ error }: { error: Error }): React.ReactElement {
  return (
    <div className="mt-6 bg-odm-bad-bg border border-odm-bad-bd rounded p-5">
      <div className="font-sans text-[13px] font-semibold text-odm-bad mb-1">
        Failed to load dataset
      </div>
      <div className="font-sans text-[12px] text-odm-soft">{error.message}</div>
    </div>
  );
}

/* ── Tab panel wrapper ────────────────────────────────────────────────────── */

function TabPanel({
  id,
  activeTab,
  children,
}: {
  id: TabId;
  activeTab: TabId;
  children: React.ReactNode;
}): React.ReactElement | null {
  if (id !== activeTab) return null;
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red"
    >
      {children}
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────── */

/**
 * DatasetDetailPage — five-tab decision funnel for a single dataset.
 *
 * Renders the page header, custom tab bar (brand-red active state), and one
 * tab panel at a time. All tab navigation is local React state.
 *
 * @example
 * <DatasetDetailPage
 *   datasetId="cordon-daily-flows"
 *   onOpenSql={(sql) => openSqlDrawer(sql)}
 *   onNavigateToCatalogue={() => navigate('/datasets')}
 * />
 */
export function DatasetDetailPage({
  datasetId,
  onOpenSql,
  onNavigateToCatalogue,
}: DatasetDetailPageProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabId>("understand");
  const { status, data, error } = useDatasetQuery(datasetId);

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-6">
      {/* Header skeleton */}
      {status === "pending" && (
        <div className="animate-pulse mb-8">
          <div className="bg-odm-surface rounded h-4 w-48 mb-4" />
          <div className="flex gap-2 mb-2">
            <div className="bg-odm-surface rounded h-5 w-16" />
            <div className="bg-odm-surface rounded h-5 w-14" />
          </div>
          <div className="bg-odm-surface rounded h-8 w-2/3 mb-2" />
          <div className="bg-odm-surface rounded h-4 w-full max-w-3xl mb-4" />
          <div className="flex gap-2">
            <div className="bg-odm-surface rounded h-8 w-28" />
            <div className="bg-odm-surface rounded h-8 w-28" />
          </div>
        </div>
      )}

      {/* Header (data loaded) */}
      {status === "success" && data !== undefined && (
        <PageHeader
          dataset={data}
          onNavigateToCatalogue={onNavigateToCatalogue}
          onOpenSql={onOpenSql}
        />
      )}

      {/* Error in header area */}
      {status === "error" && error !== undefined && (
        <ErrorPanel error={error} />
      )}

      {/* Tab bar */}
      <div className="mt-6">
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab panels */}
      <TabPanel id="understand" activeTab={activeTab}>
        {status === "pending" && <UnderstandTabSkeleton />}
        {status === "error" && error !== undefined && <ErrorPanel error={error} />}
        {status === "success" && data !== undefined && (
          <UnderstandTab
            dataset={data}
            onNavigateToQuality={() => setActiveTab("quality")}
          />
        )}
      </TabPanel>

      <TabPanel id="rights" activeTab={activeTab}>
        {status === "pending" && <RightsTabSkeleton />}
        {status === "error" && error !== undefined && <ErrorPanel error={error} />}
        {status === "success" && data !== undefined && (
          <RightsTab
            dataset={data}
            onNavigateToUnderstand={() => setActiveTab("understand")}
          />
        )}
      </TabPanel>

      <TabPanel id="quality" activeTab={activeTab}>
        {status === "pending" && <QualityTabSkeleton />}
        {status === "error" && error !== undefined && <ErrorPanel error={error} />}
        {status === "success" && data !== undefined && (
          <QualityTab
            dataset={data}
            onNavigateToUnderstand={() => setActiveTab("understand")}
          />
        )}
      </TabPanel>

      <TabPanel id="provenance" activeTab={activeTab}>
        {status === "pending" && <ProvenanceTabSkeleton />}
        {status === "error" && error !== undefined && <ErrorPanel error={error} />}
        {status === "success" && data !== undefined && (
          <ProvenanceTab dataset={data} />
        )}
      </TabPanel>

      <TabPanel id="access" activeTab={activeTab}>
        {status === "pending" && <AccessTabSkeleton />}
        {status === "error" && error !== undefined && <ErrorPanel error={error} />}
        {status === "success" && data !== undefined && (
          <AccessTab
            dataset={data}
            onOpenSql={onOpenSql}
            onNavigateToRights={() => setActiveTab("rights")}
          />
        )}
      </TabPanel>
    </div>
  );
}
