import React, { useState } from "react";
import {
  PageHeader,
  EntryCard,
  Badge,
  TierBadge,
  Button,
  SearchBox,
} from "../../src/index.ts";
import {
  DEMO_DATASETS,
  freshnessStatus,
  assetTypeLabel,
  type AssetType,
} from "../demoData.ts";

/** Props for the DatasetsPage. */
export interface DatasetsPageProps {
  /** Navigate to a demo sub-route (e.g. `"/demo/datasets/DS-001"`). */
  onNavigate: (path: string) => void;
}

/** Badge variant per asset type. */
const ASSET_TYPE_VARIANT: Record<AssetType, "default" | "info" | "brand"> = {
  source:    "default",
  output:    "info",
  dashboard: "brand",
};

/**
 * DatasetsPage — full list of registered datasets with live search.
 */
export function DatasetsPage({ onNavigate }: DatasetsPageProps): React.ReactElement {
  const [query, setQuery] = useState("");

  const filtered = DEMO_DATASETS.filter((ds) => {
    const q = query.toLowerCase();
    return (
      ds.name.toLowerCase().includes(q) ||
      ds.source.toLowerCase().includes(q) ||
      ds.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-[960px] mx-auto px-7 py-8">
      <PageHeader
        section="Data Assets"
        title="Datasets"
        sub={`${DEMO_DATASETS.length} registered assets`}
        right={
          <Button variant="brand" size="sm">
            Register asset
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6 max-w-sm">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search by name, source or tag…"
          aria-label="Search datasets"
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center font-sans text-[13px] text-odm-muted">
          No datasets match <strong>"{query}"</strong>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {filtered.map((ds) => (
            <EntryCard
              key={ds.id}
              status={freshnessStatus(ds.lastReceived)}
              header={
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-odm-muted">{ds.id}</span>
                  <Badge variant={ASSET_TYPE_VARIANT[ds.assetType]}>
                    {assetTypeLabel(ds.assetType)}
                  </Badge>
                  <TierBadge tier={ds.tier} />
                  <span className="text-odm-faint text-[11px] ml-auto">
                    Updated {ds.updated}
                  </span>
                </div>
              }
              title={ds.name}
              description={ds.description}
              footer={
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-odm-faint text-[11px] mr-2">{ds.source}</span>
                  {ds.tags.map((tag) => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))}
                </div>
              }
              onClick={() => onNavigate(`/demo/datasets/${ds.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
