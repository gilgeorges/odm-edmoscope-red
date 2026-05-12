import React from "react";
import type { ColumnDef } from "../../src/index.ts";
import {
  Breadcrumb,
  EntryCard,
  Badge,
  TierBadge,
  Tabs,
  MetadataList,
  DataTable,
  ProvenanceCard,
  Button,
} from "../../src/index.ts";
import {
  DEMO_DATASETS,
  DEMO_FIELDS,
  DEMO_QUERIES,
  freshnessStatus,
  assetTypeLabel,
  type DemoField,
  type DemoQuery,
} from "../demoData.ts";

/** Props for the DatasetDetailPage. */
export interface DatasetDetailPageProps {
  /** The dataset ID to display (e.g. `"DS-001"`). */
  datasetId: string;
  /** Navigate to a demo sub-route. */
  onNavigate: (path: string) => void;
}

const SCHEMA_COLUMNS: ColumnDef<DemoField>[] = [
  {
    key: "field",
    header: "Field",
    render: (row) => (
      <span className="font-mono text-[12px] text-odm-ink">{row.field}</span>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (row) => (
      <span className="font-mono text-[11px] text-odm-soft">{row.type}</span>
    ),
  },
  {
    key: "nullable",
    header: "Nullable",
    render: (row) => (
      <Badge variant={row.nullable ? "warn" : "default"}>
        {row.nullable ? "Yes" : "No"}
      </Badge>
    ),
  },
  { key: "description", header: "Description" },
];

const QUERY_STATE_VARIANT: Record<string, "ok" | "warn" | "info"> = {
  implemented: "ok",
  saved: "info",
  draft: "warn",
};

const QUERY_COLUMNS: ColumnDef<DemoQuery>[] = [
  {
    key: "id",
    header: "ID",
    render: (row) => (
      <span className="font-mono text-[11px] text-odm-muted">{row.id}</span>
    ),
  },
  { key: "name", header: "Query" },
  {
    key: "state",
    header: "State",
    render: (row) => (
      <Badge variant={QUERY_STATE_VARIANT[row.state] ?? "default"}>{row.state}</Badge>
    ),
  },
  { key: "authorName", header: "Author" },
];

/**
 * DatasetDetailPage — detail view for a single dataset.
 *
 * Shows a static EntryCard header followed by four tabs: Information,
 * Schema, Queries, and Provenance.
 *
 * Falls back to a "not found" notice when `datasetId` doesn't match any
 * entry in DEMO_DATASETS.
 */
export function DatasetDetailPage({
  datasetId,
  onNavigate,
}: DatasetDetailPageProps): React.ReactElement {
  const ds = DEMO_DATASETS.find((d) => d.id === datasetId);

  if (!ds) {
    return (
      <div className="max-w-[960px] mx-auto px-7 py-8">
        <Breadcrumb
          items={[
            { label: "Datasets", onClick: () => onNavigate("/demo/datasets") },
            { label: datasetId },
          ]}
        />
        <p className="font-sans text-[13px] text-odm-muted">
          Dataset <code>{datasetId}</code> not found.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto px-7 py-8">
      <Breadcrumb
        items={[
          { label: "Datasets", onClick: () => onNavigate("/demo/datasets") },
          { label: ds.id, id: ds.id },
          { label: ds.name },
        ]}
      />

      {/* Static header card */}
      <EntryCard
        status={freshnessStatus(ds.lastReceived)}
        className="mb-6"
        header={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] text-odm-muted">{ds.id}</span>
            <Badge variant="default">{assetTypeLabel(ds.assetType)}</Badge>
            <TierBadge tier={ds.tier} />
            <span className="text-odm-faint text-[11px] ml-auto">
              Updated {ds.updated} · received {ds.lastReceived}d ago
            </span>
          </div>
        }
        title={ds.name}
        description={ds.description}
        footer={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-odm-faint text-[11px] mr-1">{ds.source}</span>
            {ds.tags.map((tag) => (
              <Badge key={tag} variant="default">{tag}</Badge>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm">Edit</Button>
              <Button variant="brand" size="sm">Download</Button>
            </div>
          </div>
        }
      />

      {/* Tabbed detail */}
      <Tabs defaultTab="info">
        <Tabs.List>
          <Tabs.Tab id="info">Information</Tabs.Tab>
          <Tabs.Tab id="schema">Schema</Tabs.Tab>
          <Tabs.Tab id="queries">Queries</Tabs.Tab>
          <Tabs.Tab id="provenance">Provenance</Tabs.Tab>
        </Tabs.List>

        {/* ── Information ── */}
        <Tabs.Panel id="info" className="pt-5">
          <MetadataList
            entries={[
              { label: "Dataset ID",        value: ds.id,                  readOnly: true },
              { label: "Asset type",         value: assetTypeLabel(ds.assetType) },
              { label: "Source organisation",value: ds.source },
              { label: "Medallion tier",     value: <TierBadge tier={ds.tier} /> },
              { label: "Last received",      value: `${ds.lastReceived} days ago` },
              { label: "Last updated",       value: ds.updated,             readOnly: true },
              {
                label: "Tags",
                value: (
                  <div className="flex gap-1.5 flex-wrap">
                    {ds.tags.map((t) => <Badge key={t} variant="default">{t}</Badge>)}
                  </div>
                ),
              },
              { label: "Description", value: ds.description, span: true },
            ]}
          />
        </Tabs.Panel>

        {/* ── Schema ── */}
        <Tabs.Panel id="schema" className="pt-5">
          <DataTable<DemoField>
            columns={SCHEMA_COLUMNS}
            data={ds.id === "DS-001" ? DEMO_FIELDS : []}
            emptyState={
              <p className="font-sans text-[13px] text-odm-muted py-6 text-center">
                Schema not yet registered for this asset.
              </p>
            }
          />
        </Tabs.Panel>

        {/* ── Queries ── */}
        <Tabs.Panel id="queries" className="pt-5">
          <DataTable<DemoQuery>
            columns={QUERY_COLUMNS}
            data={ds.id === "DS-001" ? DEMO_QUERIES.slice(0, 2) : []}
            emptyState={
              <p className="font-sans text-[13px] text-odm-muted py-6 text-center">
                No queries registered against this dataset yet.
              </p>
            }
          />
        </Tabs.Panel>

        {/* ── Provenance ── */}
        <Tabs.Panel id="provenance" className="pt-5">
          {ds.id === "DS-001" ? (
            <div className="flex flex-col gap-4">
              <ProvenanceCard
                accent="info"
                headerLeft={
                  <span className="font-sans font-semibold text-odm-ink text-[13px]">
                    Origin — MobiScout AG
                  </span>
                }
                headerRight={<Badge variant="default">Provider</Badge>}
                description="Raw daily CSV delivery from MobiScout sensors at 48 stations. Validated and ingested by Airflow pipeline v2."
                panels={[
                  { label: "Format",   content: "CSV-W" },
                  { label: "Cadence",  content: "Daily" },
                  { label: "Coverage", content: "48 stations" },
                  { label: "Owner",    content: "Nadine Hess" },
                ]}
              />
              <ProvenanceCard
                accent="ok"
                headerLeft={
                  <span className="font-sans font-semibold text-odm-ink text-[13px]">
                    Derived — Modal Split ZH 2025–Q1
                  </span>
                }
                headerRight={<Badge variant="info">Output</Badge>}
                description="This dataset is consumed by the modal split pipeline to produce DS-007."
                panels={[
                  { label: "Output ID", content: "DS-007" },
                  { label: "Tier",      content: "Gold" },
                  { label: "Pipeline",  content: "modal-split-v3" },
                ]}
              />
            </div>
          ) : (
            <p className="font-sans text-[13px] text-odm-muted py-6 text-center">
              No provenance events recorded for this dataset.
            </p>
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
