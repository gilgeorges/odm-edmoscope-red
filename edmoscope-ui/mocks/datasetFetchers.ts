/**
 * Mock fetchers for the dataset detail page.
 *
 * Returns Promises with a small artificial delay (200–400 ms) so loading
 * states are exercised in development. Swap with real API calls in the host app.
 *
 * The single fixture is "Daily commuter flows — Luxembourg City cordon",
 * a silver-layer dataset that exercises all five tabs meaningfully.
 */

import type {
  Dataset,
  DatasetId,
  SchemaColumn,
  Caveat,
  Dissemination,
  Legislation,
  KnownIssue,
  ColumnQualitySignal,
  LineageGraph,
  ProvenanceEvent,
  Distribution,
  SavedQuery,
} from "../types/dataset.ts";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): Promise<void> {
  return delay(200 + Math.random() * 200);
}

/* ── Schema ──────────────────────────────────────────────────────────────── */

const SCHEMA: SchemaColumn[] = [
  {
    name: "date",
    dataType: "date",
    nullable: false,
    businessMeaning: "The calendar date to which this row's crossing counts refer.",
    technicalDefinition:
      "Partition column; YYYY-MM-DD derived from the event timestamp in cordon_loop_raw. Rows are deduplicated per date within cordon_transform_daily.",
  },
  {
    name: "crossing_direction",
    dataType: "enum",
    valueDomain: "inbound · outbound",
    nullable: false,
    businessMeaning:
      "Direction of travel relative to the city cordon — whether the vehicle was entering or leaving the Luxembourg City boundary.",
    technicalDefinition:
      "Derived from detector geometry: inbound when the loop ID suffix ends in 'I', outbound for 'O'. Mapping maintained in dim_cordon_loop.",
  },
  {
    name: "vehicle_class",
    dataType: "enum",
    valueDomain: "car · lgv · hgv · motorcycle · unknown",
    nullable: false,
    businessMeaning:
      "Broad category of vehicle crossing the cordon. Used to separate commuter-car flows from freight (hgv) and light delivery (lgv) traffic.",
    technicalDefinition:
      "Mapped from MTC class code via dim_vehicle_class lookup table. The 'unknown' value occurs when MTC code = 0, indicating the detector could not classify the vehicle.",
  },
  {
    name: "quality_flag",
    dataType: "enum",
    valueDomain: "ok · suspect · excluded",
    nullable: false,
    businessMeaning:
      "Analyst-facing quality assessment for this row. Rows with a flag other than 'ok' should be excluded from standard reporting.",
    technicalDefinition:
      "Set by the cordon_quality_check DAG. 'suspect' is assigned when coverage_pct < 80; 'excluded' when fewer than 6 of the 14 cordon loops were active.",
  },
  {
    name: "crossing_count",
    dataType: "integer",
    nullable: false,
    businessMeaning:
      "Total number of vehicle crossings recorded at the cordon for this combination of date, direction, and vehicle class.",
    technicalDefinition:
      "SUM of validated detector events from cordon_loop_clean, grouped by date, crossing_direction, and vehicle_class. Events with a fault code are excluded before aggregation.",
  },
  {
    name: "excluded_loops",
    dataType: "integer",
    nullable: true,
    businessMeaning:
      "How many of the 14 cordon detector loops were excluded from this day's aggregate due to faults or maintenance.",
    technicalDefinition:
      "Populated from loop_exclusion_log; NULL when no loops were excluded for that day. Non-NULL values directly reduce the effective cordon coverage.",
  },
  {
    name: "coverage_pct",
    dataType: "integer",
    nullable: false,
    businessMeaning:
      "Percentage of cordon detector loops that were active and reporting valid data on this date. Values below 80 indicate a partially covered day.",
    technicalDefinition:
      "Computed as ROUND(100.0 * active_loops / 14) within cordon_transform_daily. active_loops is the count of loops not present in loop_exclusion_log for that date.",
  },
  {
    name: "data_source_run_id",
    dataType: "string",
    nullable: false,
    businessMeaning:
      "Identifier of the pipeline run that produced this row. Used when tracing data quality issues back to a specific ingestion event.",
    technicalDefinition:
      "Airflow run_id from the cordon_transform_daily DAG execution; maps to execution_date in the Airflow metadata database. Format: scheduled__YYYY-MM-DDTHH:MM:SS+00:00.",
  },
  {
    name: "weekend_rule_applied",
    dataType: "boolean",
    nullable: true,
    businessMeaning:
      "Indicates whether a weekend and public holiday traffic pattern correction was applied to this row's crossing count.",
    technicalDefinition:
      "NULL for all rows before 2024-09-15 (the feature did not exist). TRUE when the cordon_weekend_correction factor was applied; FALSE when the correction was evaluated but skipped (e.g. the day is a weekday).",
  },
];

/* ── Caveats ─────────────────────────────────────────────────────────────── */

const CAVEATS: Caveat[] = [
  {
    id: "cav-1",
    kind: "meaning",
    text: "Weekend rule structural break (2024-09-15): Prior to September 2024, the weekend and public holiday correction factor was not applied to crossing counts. Time series spanning this date will show a structural break of approximately 4–7% in weekend vehicle counts. The break is real — it reflects a methodology correction, not a change in actual traffic volumes. The weekend_rule_applied column records which rows are affected.",
    effectiveFrom: "2024-09-15",
    crossReferenceTab: "quality",
  },
  {
    id: "cav-2",
    kind: "meaning",
    text: "Cordon crossings ≠ trips to the city centre: Inbound and outbound counts record physical crossings of the cordon boundary, not origin-destination trips. A commuter who drives to a park-and-ride site just inside the cordon and then boards a bus generates one inbound crossing. If they later exit by car, that is a second outbound crossing. Do not interpret these counts as a proxy for the total number of people entering the city.",
  },
  {
    id: "cav-3",
    kind: "meaning",
    text: "Unknown vehicle class prevalence: The 'unknown' class absorbs all MTC code 0 events, where the detector could not classify the vehicle type. In data from 2020 to mid-2022, 'unknown' constituted 8–12% of total crossings due to calibration issues with sensors installed before 2019. Following a sensor upgrade programme completed in June 2022, this proportion has since stabilised below 1%. Longitudinal analysis spanning 2020–2022 should account for this structural change in classifier performance.",
  },
];

/* ── Disseminations ───────────────────────────────────────────────────────── */

const DISSEMINATIONS: Dissemination[] = [
  {
    id: "diss-1",
    answeredQuestion:
      "Can you provide peak-hour crossing volumes for the southern cordon segment for Q3 2023, broken down by vehicle class?",
    recipient: "Ministry of Mobility and Public Works",
    date: "2024-01-15",
    kind: "data extract",
  },
  {
    id: "diss-2",
    answeredQuestion:
      "How has the commuter vehicle mix at the Luxembourg City cordon changed since 2018, and what share is attributable to HGV freight?",
    recipient: "OdM Annual Mobility Report team",
    date: "2024-06-20",
    kind: "briefing note",
  },
  {
    id: "diss-3",
    answeredQuestion:
      "Are weekend HGV crossing patterns at the northern cordon consistent with the city-centre delivery curfew in force since 2021?",
    recipient: "City of Luxembourg — Sustainability & Mobility Unit",
    date: "2024-09-03",
    kind: "data extract",
  },
];

/* ── Legislation ──────────────────────────────────────────────────────────── */

const LEGISLATION: Legislation[] = [
  {
    label: "Regulation (EU) 2022/868 — Data Governance Act",
    uri: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R0868",
    note: "Applies to the conditions under which this data may be shared externally. OdM is designated as a data intermediary under Article 10; any dissemination beyond OdM must comply with the DGA re-use framework.",
  },
  {
    label: "Loi du 1er août 2018 sur la protection des données",
    note: "Governs the processing of data that could, in combination with other datasets (e.g. GPS traces), be used to infer patterns associated with identifiable individuals. Aggregated counts at this granularity are assessed as low-risk but must remain aggregated.",
  },
  {
    label: "Règlement grand-ducal du 14 août 2017 relatif aux données de trafic",
    note: "Mandates collection and storage standards for traffic counting data in Luxembourg. OdM is designated as the competent body; this dataset fulfils the statutory reporting obligation for the Luxembourg City cordon.",
  },
];

/* ── Known issues ────────────────────────────────────────────────────────── */

const KNOWN_ISSUES: KnownIssue[] = [
  {
    id: "issue-1",
    title: "Coverage gap: Gasperich interchange loops (2024-11-15 – 2024-11-22)",
    detail:
      "Seven of the 14 cordon loops at the Gasperich interchange were taken offline for scheduled maintenance. coverage_pct fell to 68% across that week; all affected rows carry quality_flag = 'suspect'. Flows for the southern cordon segment are under-reported for this period.",
    severity: "warn",
    status: "resolved",
    affectsFrom: "2024-11-15",
    affectsTo: "2024-11-22",
    crossReferenceTab: "understand",
  },
  {
    id: "issue-2",
    title: "Unknown vehicle class spike: sensor firmware fault (2023-08-01 – 2023-08-14)",
    detail:
      "A firmware update to sensor batch L-NW-03 caused all vehicle detections on those loops to log as MTC code 0. Affected rows have quality_flag = 'suspect'. The vehicle_class breakdown for crossing_direction = 'inbound' is unreliable for this period.",
    severity: "warn",
    status: "resolved",
    affectsFrom: "2023-08-01",
    affectsTo: "2023-08-14",
  },
  {
    id: "issue-3",
    title: "HGV undercount — January 2021",
    detail:
      "A calibration error in one HGV-detection loop affected the northeastern cordon segment throughout January 2021. The undercount is estimated at approximately 12% of expected HGV volume for that month. The correction was not applied retroactively. Exclude January 2021 HGV data from longitudinal freight analysis.",
    severity: "info",
    status: "resolved",
    affectsFrom: "2021-01-01",
    affectsTo: "2021-01-31",
  },
];

/* ── Column quality signals ───────────────────────────────────────────────── */

const COLUMN_QUALITY_SIGNALS: ColumnQualitySignal[] = [
  {
    columnName: "excluded_loops",
    nullablePct: 98.3,
    notable:
      "98.3% NULL — most days have no excluded loops. Non-NULL values are meaningful signals of partial coverage.",
  },
  {
    columnName: "weekend_rule_applied",
    notable:
      "100% NULL before 2024-09-15; TRUE/FALSE after. NULL here is not a data error — it marks the pre-feature era. Do not impute.",
  },
  {
    columnName: "vehicle_class",
    distinctCount: 5,
    notable:
      "5 distinct values. The 'unknown' class ran at 8–12% of crossings in 2020–2022 due to sensor calibration issues; now below 1%. See Understand caveats.",
  },
  {
    columnName: "quality_flag",
    distinctCount: 3,
    notable:
      "3 distinct values. Distribution: ~99.4% 'ok', ~0.5% 'suspect', ~0.1% 'excluded'. Filter to quality_flag = 'ok' for analysis.",
  },
  {
    columnName: "coverage_pct",
    notable:
      "Ranges 60–100 in practice. Values below 80 are flagged 'suspect' by convention. The 60–80 range occurs only on days with maintenance outages.",
  },
];

/* ── Lineage graph ────────────────────────────────────────────────────────── */

const LINEAGE: LineageGraph = {
  upstreamLeaves: [
    {
      id: "lin-up-1",
      title: "MTC Traffic Counting Loops — Raw SFTP Feed",
      kind: "external-reception",
      meta: "Daily SFTP drop at 02:00 CET",
    },
  ],
  downstreamLeaves: [
    {
      id: "lin-down-1",
      title: "OdM Annual Mobility Report — Cordon Chapter",
      kind: "gold-output",
      meta: "Published annually in October",
    },
    {
      id: "lin-down-2",
      title: "SQL Workbench — Cordon Analysis Queries",
      kind: "saved-query-set",
      meta: "8 saved queries in the library",
    },
  ],
  intermediateCount: 3,
  isPrimarySource: false,
};

/* ── Provenance events ────────────────────────────────────────────────────── */

const PROVENANCE_EVENTS: ProvenanceEvent[] = [
  {
    id: "prov-1",
    activityKind: "odm:Reception",
    summary:
      "Received daily MTC cordon loop count file via SFTP (cordon_20260426.csv, 2.1 MB, 14 loops).",
    attributedTo: ["airflow:cordon_ingest"],
    timestamp: "2026-04-26T02:14:00Z",
  },
  {
    id: "prov-2",
    activityKind: "odm:Transformation",
    summary:
      "Applied cordon_transform_daily DAG: classified 11,388 events, produced 2,847 rows, quality_flag distribution 99.4% / 0.5% / 0.1%.",
    attributedTo: ["airflow:cordon_transform_daily"],
    timestamp: "2026-04-26T03:22:00Z",
  },
  {
    id: "prov-3",
    activityKind: "odm:Dissemination",
    summary:
      "Data extract provided to Ministry of Mobility and Public Works for Q3 2023 peak-hour analysis.",
    attributedTo: ["analyst:marie.muller@odm.lu"],
    timestamp: "2024-01-15T14:00:00Z",
  },
];

/* ── Distributions ────────────────────────────────────────────────────────── */

const DISTRIBUTIONS: Distribution[] = [
  {
    accessUrl: "s3://odm-silver/cordon-daily-flows/v=1.4.2/",
    format: "Parquet (partitioned by date)",
    mediaType: "application/vnd.apache.parquet",
    byteSize: 2_576_980_377,
    rowCount: 12_742_560,
    partitioning: "date",
  },
];

/* ── Saved queries ────────────────────────────────────────────────────────── */

const SAVED_QUERIES: SavedQuery[] = [
  {
    id: "sq-canonical",
    title: "Canonical starter — weekday flows by vehicle class",
    sql: `-- Canonical: weekday commuter flows, 2023, quality-filtered
SELECT
  date,
  crossing_direction,
  vehicle_class,
  SUM(crossing_count) AS total_crossings
FROM silver.cordon_daily_flows
WHERE
  quality_flag = 'ok'
  AND vehicle_class <> 'unknown'
  AND EXTRACT(DOW FROM date) BETWEEN 1 AND 5
  AND date BETWEEN '2023-01-01' AND '2023-12-31'
GROUP BY 1, 2, 3
ORDER BY date, crossing_direction, vehicle_class`,
    savedBy: "marie.muller@odm.lu",
    savedDate: "2024-02-01",
    isCanonical: true,
    note: "Filter on quality_flag = 'ok' and exclude 'unknown' vehicle class for a clean time series. EXTRACT(DOW ...) BETWEEN 1 AND 5 selects Monday–Friday.",
  },
  {
    id: "sq-2",
    title: "Annual cordon totals with YoY growth",
    sql: "",
    savedBy: "thomas.klein@odm.lu",
    savedDate: "2024-03-10",
  },
  {
    id: "sq-3",
    title: "Weekend vs weekday inbound comparison",
    sql: "",
    savedBy: "marie.muller@odm.lu",
    savedDate: "2024-04-22",
  },
  {
    id: "sq-4",
    title: "HGV freight share by month (2019–present)",
    sql: "",
    savedBy: "analysis.team@odm.lu",
    savedDate: "2024-05-15",
  },
  {
    id: "sq-5",
    title: "Coverage quality overview — all days below 90%",
    sql: "",
    savedBy: "thomas.klein@odm.lu",
    savedDate: "2024-06-01",
  },
  {
    id: "sq-6",
    title: "Peak-hour slice (07:00–09:00) approximation from daily data",
    sql: "",
    savedBy: "marie.muller@odm.lu",
    savedDate: "2024-07-08",
  },
  {
    id: "sq-7",
    title: "Cordon balance: inbound vs outbound daily net",
    sql: "",
    savedBy: "analysis.team@odm.lu",
    savedDate: "2024-09-30",
  },
  {
    id: "sq-8",
    title: "Pre/post weekend rule comparison (2024-09-15 break)",
    sql: "",
    savedBy: "marie.muller@odm.lu",
    savedDate: "2024-10-12",
  },
];

/* ── Fixture dataset ──────────────────────────────────────────────────────── */

const CORDON_FLOWS_DATASET: Dataset = {
  id: "cordon-daily-flows",
  title: "Daily commuter flows — Luxembourg City cordon",
  shortDescription:
    "Daily aggregated vehicle crossing counts at the 14 detector loops forming the Luxembourg City cordon boundary, broken down by direction, vehicle class, and quality status.",
  type: {
    label: "Controlled Traffic Count",
    conceptUri: "http://www.w3.org/ns/dcat#Dataset",
  },
  layer: "silver",
  version: "1.4.2",
  lastModified: "2026-04-26T03:22:00Z",
  publisher: {
    name: "Observatoire digital de la Mobilité",
    uri: "https://odm.lu",
  },
  steward: { name: "Marie Müller", email: "marie.muller@odm.lu" },
  keywords: [
    "cordon",
    "commuter flows",
    "vehicle counts",
    "traffic",
    "Luxembourg City",
    "silver",
    "daily",
    "MTC",
  ],
  temporalCoverage: { start: "2018-02-01", end: "ongoing" },
  spatialCoverage: "Luxembourg City cordon (14 detector loop stations)",

  // Understand
  businessDefinition: `The Luxembourg City cordon is a defined geographical boundary encircling the city centre. This dataset counts how many vehicles of each broad type — private cars, light goods vehicles, heavy goods vehicles, and motorcycles — crossed that boundary on each day, and in which direction.

It answers questions such as: how many cars entered Luxembourg City on a typical Tuesday in 2023? How does freight volume at the cordon differ between Monday and Friday? Has the share of heavy vehicles changed since 2018?

The dataset covers each day from February 2018 to the present. It is refreshed every morning with the previous day's counts. Days where detector coverage falls below 80% are flagged and should be treated with caution in trend analysis.`,

  technicalDefinition: `Source data arrives daily via SFTP from the Ministry's Traffic Counting (MTC) system as a CSV file containing raw detector events from 14 loop stations around the cordon perimeter. The cordon_ingest DAG picks up this file, validates its checksum, and loads it into the bronze layer table cordon_loop_raw.

The cordon_transform_daily DAG runs at 03:00 CET. It joins cordon_loop_raw against dim_cordon_loop (to resolve loop IDs to crossing_direction) and dim_vehicle_class (to map MTC class codes to the five-value enum). Events with a fault_code are excluded before aggregation. The DAG groups by date, crossing_direction, and vehicle_class and writes one row per combination into silver.cordon_daily_flows.

The cordon_quality_check DAG runs immediately after and sets quality_flag on each row based on coverage_pct. Rows with coverage_pct < 80 receive 'suspect'; rows where fewer than six of the 14 loops were active receive 'excluded'. The partition column is date, which enables incremental Hive-style reads via the S3 path prefix.`,

  caveats: CAVEATS,
  schema: SCHEMA,
  decisionShortcut:
    "If you need sub-daily (hourly) resolution, use the bronze-layer cordon_loop_raw table instead — it preserves individual detector events. If you need origin-destination flows rather than cordon crossings, the OdM mobility matrix dataset is the right starting point.",
  disseminations: DISSEMINATIONS,
  totalDisseminationCount: 14,

  // Rights
  rightsClearance: "cleared",
  rightsClearanceReason:
    "Internal OdM users with the odm-read role are cleared to use this dataset for analysis and reporting. Outputs containing aggregated crossing counts may be shared externally under the OdM Internal Use licence. Do not share row-level data without steward approval.",
  applicableLegislation: LEGISLATION,
  requiredPermission: "odm-read",
  userHasAccess: true,
  license: {
    label: "OdM Internal Use",
    scope: "aggregated outputs only",
  },
  retentionPolicy:
    "Retained for 10 years from the date of collection, per Règlement grand-ducal du 14 août 2017. Deletion requests must be approved by the steward and the DPO.",
  sensitivity:
    "Low — no personal data. Counts are aggregated across all vehicles crossing the cordon; individual journey reconstruction is not possible from this dataset alone.",

  // Quality
  qualitySignals: {
    freshnessHours: 14,
    freshnessTolerance: "ok",
    completenessPct: 99.4,
    coverageDays: 2663,
    cadence: "Daily",
    cadenceUri: "http://purl.org/linked-data/sdmx/2009/code#freq-D",
    rebuildJob: "cordon_transform_daily",
  },
  knownIssues: KNOWN_ISSUES,
  columnQualitySignals: COLUMN_QUALITY_SIGNALS,

  // Provenance
  lineage: LINEAGE,
  recentProvenanceEvents: PROVENANCE_EVENTS,
  totalProvenanceEventCount: 42,

  // Access
  distributions: DISTRIBUTIONS,
  catalogTable: "silver.cordon_daily_flows",
  sampleQueries: SAVED_QUERIES,
};

/* ── Registry & fetcher ───────────────────────────────────────────────────── */

const DATASETS: Record<DatasetId, Dataset> = {
  "cordon-daily-flows": CORDON_FLOWS_DATASET,
};

/**
 * Fetch full dataset detail by ID.
 *
 * Returns a Promise that resolves after a 200–400 ms artificial delay,
 * simulating a network round-trip so loading states are exercised.
 *
 * @throws {Error} when no dataset is found for the given ID.
 */
export async function fetchDataset(id: DatasetId): Promise<Dataset> {
  await randomDelay();
  const dataset = DATASETS[id];
  if (dataset === undefined) {
    throw new Error(`Dataset not found: ${id}`);
  }
  return dataset;
}
