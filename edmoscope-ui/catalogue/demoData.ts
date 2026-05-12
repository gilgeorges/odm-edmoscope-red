import type { Tier } from "../tokens.ts";

/** Asset type classification for a catalogue entry. */
export type AssetType = "source" | "output" | "dashboard";

/** Actor type — internal IDM staff or external provider/consumer. */
export type ActorType = "internal" | "external";

/** Lifecycle state of a saved SQL query. */
export type QueryState = "draft" | "saved" | "implemented";

/** A dataset entry in the EDMoScope catalogue. */
export interface DemoDataset {
  /** Unique dataset identifier (e.g. "DS-001"). */
  id: string;
  /** Human-readable name of the dataset. */
  name: string;
  /** Name of the data provider organisation. */
  source: string;
  /** Classification of the asset in the data pipeline. */
  assetType: AssetType;
  /** Descriptive tags for filtering and discovery. */
  tags: string[];
  /** Days since the last received delivery. */
  lastReceived: number;
  /** ISO date string of the last catalogue update. */
  updated: string;
  /** Medallion tier: bronze → silver → gold. */
  tier: Tier;
  /** Short description of the dataset's content and purpose. */
  description: string;
}

/** A person or organisation participating in data lineage. */
export interface DemoActor {
  /** Unique actor identifier (e.g. "AC-001"). */
  id: string;
  /** Display name of the person or organisation. */
  name: string;
  /** Role or relationship to OdM data flows. */
  role: string;
  /** Whether this actor is an IDM employee or an external party. */
  type: ActorType;
  /** Optional contact e-mail (internal actors only). */
  email?: string;
}

/** A saved SQL query registered in the catalogue. */
export interface DemoQuery {
  /** Unique query identifier (e.g. "Q-001"). */
  id: string;
  /** Short descriptive name of the query's purpose. */
  name: string;
  /** Current lifecycle state. */
  state: QueryState;
  /** Full name of the query author. */
  authorName: string;
  /** Optional longer description of the analysis intent. */
  description: string;
  /** The SQL text of the query body. */
  sql: string;
}

/** A single column definition from the dataset schema (CSVW). */
export interface DemoField {
  /** Column identifier as it appears in the distribution file. */
  field: string;
  /** SQL-style data type (e.g. "VARCHAR", "INTEGER", "TIMESTAMP"). */
  type: string;
  /** Whether the column accepts NULL values. */
  nullable: boolean;
  /** Human-readable explanation of what this column contains. */
  description: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Datasets
───────────────────────────────────────────────────────────────────────────── */

export const DEMO_DATASETS: DemoDataset[] = [
  {
    id: "DS-001",
    name: "MobiScout Count Data",
    source: "MobiScout AG",
    assetType: "source",
    tags: ["counts", "cycling", "pedestrian"],
    lastReceived: 3,
    updated: "2025-03-18",
    tier: "silver",
    description:
      "Automated pedestrian and cyclist counts at 48 monitoring stations across Luxembourg, delivered daily as CSV-W.",
  },
  {
    id: "DS-002",
    name: "NPVM Demand Matrix",
    source: "ARE",
    assetType: "source",
    tags: ["demand", "OD"],
    lastReceived: 18,
    updated: "2025-03-03",
    tier: "bronze",
    description:
      "National passenger-transport demand matrix from the Swiss federal model (ARE), covering cross-border flows.",
  },
  {
    id: "DS-003",
    name: "SBB Passenger Flows",
    source: "SBB",
    assetType: "source",
    tags: ["rail", "stations"],
    lastReceived: 42,
    updated: "2025-02-07",
    tier: "bronze",
    description:
      "Station-level passenger flow counts from the national rail operator, updated quarterly.",
  },
  {
    id: "DS-007",
    name: "Modal Split ZH 2025–Q1",
    source: "IDM",
    assetType: "output",
    tags: ["modal-split", "derived"],
    lastReceived: 5,
    updated: "2025-03-17",
    tier: "gold",
    description:
      "Derived modal split indicators for Zone ZH, Q1 2025 — analysis-ready output from the MobiScout pipeline.",
  },
  {
    id: "DS-008",
    name: "Motorway Dashboard",
    source: "IDM",
    assetType: "dashboard",
    tags: ["motorway", "live", "CITA"],
    lastReceived: 1,
    updated: "2025-03-20",
    tier: "gold",
    description:
      "Live motorway occupancy dashboard aggregating CITA sensor feeds; updated every 15 minutes.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Actors
───────────────────────────────────────────────────────────────────────────── */

export const DEMO_ACTORS: DemoActor[] = [
  {
    id: "AC-001",
    name: "Canton ZH",
    role: "Data Provider",
    type: "external",
  },
  {
    id: "AC-002",
    name: "ARE — Federal Roads Office",
    role: "Provider & Recipient",
    type: "external",
  },
  {
    id: "AC-006",
    name: "Nadine Hess",
    role: "Data Analyst",
    type: "internal",
    email: "nadine.hess@idm.lu",
  },
  {
    id: "AC-007",
    name: "Thomas Brun",
    role: "Data Engineer",
    type: "internal",
    email: "thomas.brun@idm.lu",
  },
  {
    id: "AC-008",
    name: "Airflow Pipeline System",
    role: "Automated System",
    type: "internal",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Queries
───────────────────────────────────────────────────────────────────────────── */

export const DEMO_QUERIES: DemoQuery[] = [
  {
    id: "Q-001",
    name: "Monthly modal split by station",
    state: "implemented",
    authorName: "Nadine Hess",
    description: "Aggregates MobiScout counts by station and mode.",
    sql: "SELECT station_id, mode, SUM(count) AS total\nFROM ds_001\nGROUP BY station_id, mode\nORDER BY station_id, mode;",
  },
  {
    id: "Q-002",
    name: "Accident severity distribution",
    state: "saved",
    authorName: "Thomas Brun",
    description: "Distribution of accident severity classifications.",
    sql: "SELECT severity, COUNT(*) AS n\nFROM ds_004\nGROUP BY severity\nORDER BY n DESC;",
  },
  {
    id: "Q-004",
    name: "SBB flows quick check",
    state: "draft",
    authorName: "Nadine Hess",
    description: "",
    sql: "SELECT * FROM ds_003 LIMIT 100;",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Schema fields (for DS-001)
───────────────────────────────────────────────────────────────────────────── */

export const DEMO_FIELDS: DemoField[] = [
  {
    field: "station_id",
    type: "VARCHAR",
    nullable: false,
    description: "Unique station identifier",
  },
  {
    field: "timestamp",
    type: "TIMESTAMP",
    nullable: false,
    description: "Observation start time (ISO 8601)",
  },
  {
    field: "mode",
    type: "VARCHAR",
    nullable: false,
    description: "Transport mode: PED / BIKE / ESCOOTER",
  },
  {
    field: "count",
    type: "INTEGER",
    nullable: false,
    description: "Observed passage count",
  },
  {
    field: "quality_flag",
    type: "VARCHAR",
    nullable: true,
    description: "QA classification: OK / IMPUTED / SUSPECT",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

/** Maps `lastReceived` days to an EntryCard status for freshness colouring. */
export function freshnessStatus(days: number): "ok" | "warning" | "danger" {
  if (days <= 7) return "ok";
  if (days <= 30) return "warning";
  return "danger";
}

/** Returns the display label for an asset type. */
export function assetTypeLabel(t: AssetType): string {
  const LABELS: Record<AssetType, string> = {
    source: "Source",
    output: "Output",
    dashboard: "Dashboard",
  };
  return LABELS[t];
}
