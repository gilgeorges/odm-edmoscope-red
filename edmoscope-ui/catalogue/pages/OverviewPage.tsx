import React from "react";
import {
  PageHeader,
  StatRow,
  EntryCard,
  Badge,
  TierBadge,
  Button,
} from "../../src/index.ts";
import {
  DEMO_DATASETS,
  DEMO_ACTORS,
  DEMO_QUERIES,
  freshnessStatus,
  assetTypeLabel,
} from "../demoData.ts";

/** Props for the OverviewPage. */
export interface OverviewPageProps {
  /** Navigate to a demo sub-route (e.g. `"/demo/datasets"`). */
  onNavigate: (path: string) => void;
}

/** Badge variant per query state. */
const QUERY_STATE_VARIANT: Record<string, "ok" | "warn" | "info"> = {
  implemented: "ok",
  saved: "info",
  draft: "warn",
};

/**
 * OverviewPage — dashboard landing page for the EDMoScope demo app.
 *
 * Shows headline KPIs and the three most recently updated datasets.
 */
export function OverviewPage({ onNavigate }: OverviewPageProps): React.ReactElement {
  const recentDatasets = [...DEMO_DATASETS]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  return (
    <div className="max-w-[960px] mx-auto px-7 py-8">
      <PageHeader
        section="EDMoScope"
        title="Vue d'ensemble"
        sub="Tableau de bord — données de mobilité du Grand-Duché de Luxembourg"
      />

      {/* KPI row */}
      <div className="flex items-start mb-10">
        <StatRow
          stats={[
            { n: DEMO_DATASETS.length, label: "Datasets" },
            { n: DEMO_ACTORS.length,   label: "Actors" },
            { n: DEMO_QUERIES.length,  label: "Queries" },
            { n: "98.2%",              label: "Pipeline uptime" },
          ]}
        />
      </div>

      {/* Recent datasets */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-[15px] font-bold text-odm-ink m-0">
            Recent datasets
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("/demo/datasets")}
          >
            View all →
          </Button>
        </div>

        <div className="flex flex-col gap-0">
          {recentDatasets.map((ds) => (
            <EntryCard
              key={ds.id}
              status={freshnessStatus(ds.lastReceived)}
              header={
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-odm-muted">{ds.id}</span>
                  <Badge variant="default">{assetTypeLabel(ds.assetType)}</Badge>
                  <TierBadge tier={ds.tier} />
                  <span className="text-odm-faint text-[11px] ml-auto">
                    {ds.lastReceived === 0 ? "Today" : `${ds.lastReceived}d ago`}
                  </span>
                </div>
              }
              title={ds.name}
              description={ds.description}
              footer={
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ds.tags.map((tag) => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))}
                </div>
              }
              onClick={() => onNavigate(`/demo/datasets/${ds.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Queries snapshot */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-[15px] font-bold text-odm-ink m-0">
            Saved queries
          </h2>
        </div>

        <div className="flex flex-col gap-0">
          {DEMO_QUERIES.map((q) => (
            <EntryCard
              key={q.id}
              status="neutral"
              header={
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-odm-muted">{q.id}</span>
                  <Badge variant={QUERY_STATE_VARIANT[q.state] ?? "default"}>
                    {q.state}
                  </Badge>
                </div>
              }
              title={q.name}
              description={q.description || undefined}
              footer={
                <span className="text-odm-faint text-[11px]">{q.authorName}</span>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
